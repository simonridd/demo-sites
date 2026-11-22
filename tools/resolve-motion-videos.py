#!/usr/bin/env python3
"""Find candidate original videos via public YouTube metadata, no video downloads.

Requires installed yt-dlp. Automatically accepts only channel+title verified
matches; leaves uncertain/truncated entries unresolved for manual checking.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "kits" / "shorts-lab"
CHANNEL_ID = "UC5DNytAJ6_FISueUfzZCVsw"
OUTPUT = LAB / "resolved-videos.mjs"
MANUALLY_VERIFIED = {68, 69, 75}


def normalize(value):
    value = unicodedata.normalize("NFKD", value).lower()
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", value)).strip()


def rows():
    text = (LAB / "effects-data.mjs").read_text(encoding="utf-8")
    match = re.search(r"const RAW = String\.raw\`(.*?)\`\.trim\(\)", text, re.S)
    if not match:
        raise RuntimeError("Source register cannot be read")
    parsed = []
    for index, row in enumerate(match.group(1).strip().splitlines(), 1):
        columns = row.split("|")
        if len(columns) != 7:
            raise RuntimeError(f"Bad catalogue row {index}")
        parsed.append((index, columns[0]))
    return parsed


def search(title, limit=6):
    query = "Code with Ania Kubow " + title.replace("…", " ")
    proc = subprocess.run(
        ["yt-dlp", "--no-warnings", "--skip-download", "--flat-playlist",
         "--dump-single-json", f"ytsearch{limit}:{query}"],
        check=False, capture_output=True, text=True, timeout=45,
    )
    if proc.returncode:
        raise RuntimeError((proc.stderr or proc.stdout)[-400:].strip())
    data = json.loads(proc.stdout)
    return data.get("entries", [])


def is_right_creator(entry):
    channel_id = entry.get("channel_id") or ""
    if channel_id == CHANNEL_ID:
        return True
    # Metadata from some yt-dlp flat search responses omits channel_id.
    # In that case require a matching creator name *and* URL/handle proof.
    author = normalize(entry.get("channel") or entry.get("uploader") or "")
    url = entry.get("channel_url") or entry.get("uploader_url") or ""
    return (
        "ania kubow" in author
        and ("@aniakubow" in url.lower() or CHANNEL_ID in url)
    )


def score(title, entry):
    requested, actual = normalize(title), normalize(entry.get("title") or "")
    if not actual or not requested:
        return 0.0
    similarity = SequenceMatcher(None, requested, actual).ratio()
    # Some titles in the earlier register are explicitly truncated.
    if requested.endswith(("nav", "fa", "gl", "bu", "wi")) or title.endswith("…"):
        common = len(normalize(title).split())
        if actual.startswith(requested[: min(len(requested), 12)]):
            similarity = max(similarity, min(1, common / max(1, len(actual.split()))))
    return similarity


def load_previous():
    content = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
    match = re.search(r"Object\.freeze\((\{.*\})\)", content, re.S)
    if not match:
        return {}
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return {}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=75, help="Max new searches")
    parser.add_argument("--min-score", type=float, default=.72)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    current = load_previous()
    found = 0
    unresolved = []
    attempted = 0
    for video_id, title in rows():
        if video_id in MANUALLY_VERIFIED:
            continue
        key = str(video_id)
        if key in current and not args.force:
            continue
        if attempted >= args.limit:
            break
        attempted += 1
        try:
            options = search(title)
            matches = sorted(
                ((score(title, x), x) for x in options
                 if is_right_creator(x) and re.fullmatch(r"[a-zA-Z0-9_-]{11}", x.get("id") or "")),
                key=lambda item: item[0], reverse=True,
            )
            if not matches:
                unresolved.append((video_id, title, "no channel-validated result"))
                continue
            top_score, best = matches[0]
            runner_up = matches[1][0] if len(matches) > 1 else 0.0
            if top_score < args.min_score or top_score - runner_up < .075:
                unresolved.append((video_id, title, f"ambiguous score {top_score:.2f}"))
                continue
            current[key] = {
                "url": "https://www.youtube.com/watch?v=" + best["id"],
                "platform": "YouTube",
                "evidence": "yt-dlp public search; verified creator and title "
                            + best["title"][:120],
            }
            found += 1
            print(f"VERIFIED {video_id:03d} {top_score:.2f} -> {best['id']} {title}")
        except Exception as exc:
            unresolved.append((video_id, title, str(exc)[:160]))
            print(f"UNRESOLVED {video_id:03d} {exc}", file=sys.stderr)
    stable = dict(sorted(current.items(), key=lambda pair: int(pair[0])))
    OUTPUT.write_text(
        "// Generated candidate links; accepted only after creator and title checks.\n"
        "export const resolvedVideos = Object.freeze("
        + json.dumps(stable, indent=2, ensure_ascii=False) + ");\n",
        encoding="utf-8",
    )
    report = LAB / "video-link-resolution.json"
    report.write_text(json.dumps({
        "channel_id": CHANNEL_ID,
        "searched_this_run": attempted, "new_verified_this_run": found,
        "all_machine_verified": len(stable),
        "manually_verified": sorted(MANUALLY_VERIFIED),
        "unresolved_this_run": [
            {"id": id_, "title": title_, "reason": reason}
            for id_, title_, reason in unresolved
        ],
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(stable)+len(MANUALLY_VERIFIED)} total exact links in the registry, "
          f"{len(unresolved)} unresolved in this run")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
