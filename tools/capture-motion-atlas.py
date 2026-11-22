#!/usr/bin/env python3
"""Capture the REAL Motion Atlas browser previews into short MP4 comparisons.

No creator videos are downloaded. No external network/API calls. Uses isolated
localhost HTTP, installed Playwright Chromium and ffmpeg. Does not touch demos.
"""
from __future__ import annotations

import argparse
import contextlib
import http.server
import json
import re
import shutil
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "kits" / "shorts-lab"
ASSETS = LAB / "assets"
MANIFEST = LAB / "clip-manifest.mjs"
FPS = 10
SECONDS = 2.5


def catalogue():
    text = (LAB / "effects-data.mjs").read_text(encoding="utf-8")
    match = re.search(r"const RAW = String\.raw\`(.*?)\`\.trim\(\)", text, re.S)
    if not match:
        raise RuntimeError("The 75-reference catalogue was not found")
    rows = []
    for index, line in enumerate(match.group(1).strip().splitlines(), 1):
        fields = line.split("|")
        if len(fields) != 7:
            raise ValueError(f"Broken source row {index}")
        title, verdict, priority, preview, family, stage, note = fields
        rows.append(dict(id=index, title=title, preview=preview, family=family))
    if len(rows) != 75:
        raise RuntimeError(f"Expected 75 catalogue rows, got {len(rows)}")
    return rows


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


@contextlib.contextmanager
def local_site():
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{httpd.server_port}/kits/shorts-lab/"
    finally:
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=3)


def act(preview, entry):
    """Trigger a genuine available control; static originals remain static."""
    key = entry["preview"]
    actions = {
        "odometer": "odometer", "price-roll": "price",
        "progress": "progress", "ratio": "ratio", "wheel": "zoom",
        "header": "header", "icon": "icon", "palette": "palette",
        "fab": "fab", "nudge": "replay", "carousel": "next",
        "squeeze": "replay", "border": "replay",
    }
    if key == "pill":
        preview.locator('[data-index="1"]').click(timeout=1200)
    elif key == "slider":
        preview.locator('[data-range]').evaluate(
            "(el) => {el.value = '85'; el.dispatchEvent(new Event('input',{bubbles:true}));}"
        )
    elif key in ("toggle", "checkbox"):
        preview.locator('input[type="checkbox"]').first.check(timeout=1200, force=True)
        preview.locator('input[type="checkbox"]').first.uncheck(timeout=1200, force=True)
    elif key == "shine":
        preview.locator(".shine-card").hover(timeout=1200)
    elif key == "button":
        preview.locator("button.demo-button").hover(timeout=1200)
    elif key == "button-looks":
        preview.locator("button.premium-action").click(timeout=1200)
    elif key == "glass":
        preview.locator(".glass-card").hover(timeout=1200)
    elif key == "icons":
        preview.locator('button[data-action="icon"]').first.click(timeout=1200)
    elif key == "input":
        field = preview.locator(".md-field input")
        field.focus(timeout=1200)
        field.fill("Where is my order?", timeout=1200)
    elif key == "blur":
        preview.locator('[data-action="blur-mode"][data-mode="liquid"]').click(timeout=1200)
    elif key == "split":
        preview.locator('[data-action="split-menu"]').click(timeout=1200)
    elif key == "chips":
        preview.locator('[data-action="filter-chip"][data-chip="retail"]').click(timeout=1200)
    elif key == "image-glow":
        preview.locator('[data-action="image-glow"]').click(timeout=1200)
    elif key == "gradient":
        preview.locator('[data-action="grain"]').click(timeout=1200)
    elif key in actions:
        preview.locator(f'[data-action="{actions[key]}"]').first.click(timeout=1200)
    else:
        # The motion replay is intentionally below the preview, on its card.
        card = preview.locator("xpath=ancestor::article[contains(@class, 'card')]")
        replay = card.locator('button[data-action="replay"], button[data-action="pair"]').first
        if replay.count():
            replay.click(timeout=1200)


def record_one(page, entry, output, fps=FPS, seconds=SECONDS):
    from playwright.sync_api import TimeoutError as PlaywrightTimeout
    card = page.locator(f'.card[data-id="{entry["id"]}"]')
    if card.count() != 1:
        raise RuntimeError(f"Card {entry['id']} did not render exactly once")
    preview = card.locator(".preview")
    preview.scroll_into_view_if_needed()
    # Give the browser a frame before taking the opening static composition.
    page.wait_for_timeout(75)
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "image2pipe", "-framerate", str(fps),
        "-c:v", "png", "-i", "pipe:0",
        "-vf", "scale=512:320:force_original_aspect_ratio=decrease,"
               "pad=512:320:(ow-iw)/2:(oh-ih)/2:color=0x132127,format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "32",
        "-movflags", "+faststart", "-f", "mp4", str(output),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        total_frames = max(15, round(seconds * fps))
        for frame in range(total_frames):
            # Study 068: move the native range across several browser frames.
            # Study 069: hold the pointer down to capture thumb compression,
            # then release for each genuine checkbox state change.
            if entry["preview"] == "slider":
                if 2 <= frame <= 20:
                    value = round(10 + 78 * (frame - 2) / 18) if frame <= 11 else round(88 - 62 * (frame - 11) / 9)
                    preview.locator('[data-range]').evaluate(
                        """(el, value) => {
                          el.value = String(value);
                          el.dispatchEvent(new Event('input', {bubbles: true}));
                        }""", value
                    )
            elif entry["preview"] == "toggle":
                if frame in (2, 14):
                    toggle = preview.locator('.squishy-toggle input')
                    bbox = toggle.bounding_box()
                    if not bbox:
                        raise RuntimeError('Cannot locate native switch for press capture')
                    page.mouse.move(bbox['x'] + bbox['width']/2, bbox['y'] + bbox['height']/2)
                    page.mouse.down()
                if frame in (5, 18):
                    page.mouse.up()
            elif frame == 2:
                try:
                    act(preview, entry)
                except PlaywrightTimeout:
                    # A missing local action is not a reason to fabricate motion.
                    pass
            if frame == round(total_frames * .58):
                if entry["preview"] in ("pill", "carousel", "icons", "input", "header", "blur", "split", "chips", "image-glow", "button-looks", "gradient"):
                    try:
                        if entry["preview"] == "pill":
                            preview.locator('[data-index="2"]').click(timeout=800)
                        elif entry["preview"] == "carousel":
                            preview.locator('[data-action="next"]').click(timeout=800)
                        elif entry["preview"] == "icons":
                            # Record the repaired OFF state as well as the new ON state.
                            icons = preview.locator('button[data-action="icon"]')
                            icons.first.click(timeout=800)
                            icons.nth(1).click(timeout=800)
                        elif entry["preview"] == "input":
                            preview.locator(".md-field input").evaluate("(el) => el.blur()")
                        elif entry["preview"] == "blur":
                            preview.locator('[data-action="blur-mode"][data-mode="android"]').click(timeout=800)
                        elif entry["preview"] == "split":
                            preview.locator('.split-menu-items [data-action="split-choice"]').first.click(timeout=800)
                        elif entry["preview"] == "chips":
                            preview.locator('[data-action="filter-chip"][data-chip="travel"]').click(timeout=800)
                        elif entry["preview"] == "image-glow":
                            preview.locator('[data-action="image-glow"]').click(timeout=800)
                        elif entry["preview"] == "button-looks":
                            preview.locator('button.premium-action').click(timeout=800)
                        elif entry["preview"] == "gradient":
                            preview.locator('[data-action="grain"]').click(timeout=800)
                        else:
                            preview.locator('[data-action="header"]').click(timeout=800)
                    except PlaywrightTimeout:
                        pass
            png = preview.screenshot(type="png", animations="allow", timeout=5000)
            proc.stdin.write(png)
            page.wait_for_timeout(round(1000 / fps))
        proc.stdin.close()
        proc.stdin = None
        stderr = proc.communicate(timeout=25)[1]
        if proc.returncode:
            raise RuntimeError(f"ffmpeg exited {proc.returncode}: {stderr.decode()[-700:]}")
    finally:
        if proc.poll() is None:
            proc.kill()
        if proc.stdin and not proc.stdin.closed:
            proc.stdin.close()


def ffprobe(path):
    proc = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration,nb_frames",
        "-of", "json", str(path),
    ], check=True, capture_output=True, text=True)
    streams = json.loads(proc.stdout).get("streams", [])
    if len(streams) != 1:
        raise RuntimeError("The captured asset has no single video stream")
    video = streams[0]
    if video.get("width") != 512 or video.get("height") != 320 or path.stat().st_size < 1500:
        raise RuntimeError("The captured asset is empty, tiny or incorrectly sized")
    return video


def write_manifest(rows):
    # Only validated, actually present, MP4 files are included.
    live = {}
    for e in rows:
        if e["family"] == "Research-only":
            continue
        output = ASSETS / f"{e['id']:03d}.mp4"
        if not output.exists():
            continue
        try:
            ffprobe(output)
        except Exception:
            # Never advertise a missing, corrupt or incorrect recording.
            continue
        live[str(e["id"])] = {
            "path": f"./assets/{e['id']:03d}.mp4",
            "kind": "browser-recorded",
            "durationSeconds": SECONDS,
        }
    content = (
        "// Generated by tools/capture-motion-atlas.py from real browser previews.\n"
        "// Assets may only be listed after ffprobe validation.\n"
        f"export const clips = Object.freeze({json.dumps(live, ensure_ascii=False, indent=2)});\n"
    )
    MANIFEST.write_text(content, encoding="utf-8")
    return len(live)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ids", nargs="*", type=int, help="Only these study IDs")
    parser.add_argument("--limit", type=int, help="Limit eligible records for a rehearsal")
    parser.add_argument("--force", action="store_true", help="Re-record existing clips")
    parser.add_argument("--list", action="store_true", help="List eligible visual studies")
    args = parser.parse_args()

    rows = catalogue()
    targets = [e for e in rows if e["family"] != "Research-only"]
    if args.ids:
        unknown = set(args.ids) - {e["id"] for e in targets}
        if unknown:
            parser.error(f"These IDs are not visual studies: {sorted(unknown)}")
        targets = [e for e in targets if e["id"] in args.ids]
    if args.limit is not None:
        targets = targets[:max(0, args.limit)]
    if args.list:
        for e in targets:
            print(f"{e['id']:03d} {e['title']}")
        return 0
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        parser.error("ffmpeg and ffprobe must be installed, e.g. brew install ffmpeg")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        parser.error("Python Playwright is missing: python3 -m pip install playwright")
    ASSETS.mkdir(parents=True, exist_ok=True)
    successes = []
    failures = []
    with local_site() as url, sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 960},
            device_scale_factor=1, reduced_motion="no-preference",
            color_scheme="dark",
        )
        page = context.new_page()
        page.goto(url, wait_until="networkidle")
        page.wait_for_selector('.card[data-id="75"]', timeout=20000)
        for e in targets:
            final = ASSETS / f"{e['id']:03d}.mp4"
            if final.exists() and not args.force:
                try:
                    ffprobe(final)
                    successes.append(e["id"])
                    print(f"KEEP {e['id']:03d} {e['title']}")
                    continue
                except Exception:
                    pass
            temp = ASSETS / f".{e['id']:03d}.tmp.mp4"
            try:
                # Cleanly reload to reset each effect to its authored initial state.
                page.reload(wait_until="networkidle")
                page.wait_for_selector(f'.card[data-id="{e["id"]}"]', timeout=20000)
                record_one(page, e, temp)
                ffprobe(temp)
                temp.replace(final)
                successes.append(e["id"])
                print(f"PASS {e['id']:03d} {e['title']} ({final.stat().st_size} bytes)")
            except Exception as ex:
                failures.append((e["id"], str(ex)))
                print(f"FAIL {e['id']:03d} {e['title']}: {ex}", file=sys.stderr)
            finally:
                temp.unlink(missing_ok=True)
        context.close()
        browser.close()
    total = write_manifest(rows)
    print(f"Published manifest: {total} existing verified clips; "
          f"this run {len(successes)} pass/keep, {len(failures)} failed")
    if failures:
        print("Failures:", json.dumps(failures, ensure_ascii=False), file=sys.stderr)
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
