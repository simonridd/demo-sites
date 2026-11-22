# Motion Atlas — 75 referenced techniques

Standalone, public-static, **originally implemented** experimental kit at `/kits/shorts-lab/`. It is not part of `demos.json`, is not a customer journey, has no Genesys/IVA/AVA binding, and does not modify any of the customer demos.

## Purpose and stage/product distinction

The user explicitly prioritises **one-off presentation impact** as well as product UI quality. An effect can be worth rehearsing for a stage moment while still being a poor default in an everyday tool. Use the **One-off presentation** and **Everyday product** modes to judge the same 75 references with different expectations. The initial verdict remains in both modes so it is not silently rewritten. 'Stage candidate' is a review invitation, **not** approval to use or ship.

The atlas holds:
- All **75** named rows in the 22 November 2026 assessment, including incomplete titles and the Facebook odometer reel.
- **62** candidates with original HTML/CSS/JS visual or functional experiments, including speculative examples explicitly marked as hypotheses.
- **13** non-CSS or out-of-scope research references, retained as explanation cards. They are not claimed as working implementations of translation, commerce, calendar, payment, AI agents or location sharing.
- Zero third-party animation packages, CDN imports, analytics scripts, credentials, actual audio, video or live account actions.

This is a **working visual comparison kit**. It is **not** a faithful source-code archive of Ania Kubów's original implementations and does not establish that each source video was watched frame by frame. Most rows came from an indexed titles catalogue without deep-link verification; "Creator channel" intentionally links to the channel, not an invented exact Short. The Facebook odometer has the direct source link; that original CSS was not recovered.

## Included interactions

These can be used hands-on: checkbox, buttons, emphasis, reserved media footprint, accessible focus-within, sample progress, zoom without page-scroll hijacking, palette mixing, slide/reveal/replay, metaballs, headline count-up, pixel typography, temporary shimmer, one-shot marquee, glass, softened corners, waveform-style orb, original pattern art, aspect-ratio switch, keyboard-operable pill navigation, individual rolling-price digits, temporary celebratory tick, vector mark, card shine, themed gradient, floating menu, split button with keyboard escape, nudged notification, squeeze, bounded moving backdrop, illustrative pending indicator, native slider, native toggle, icon state, collapsible header, labelled input, scroll-snap carousel and a second odometer.

Most previews **do not autoplay**: select the local Play control. Controls in a preview are interactive but never submit a form, write a record or claim a real customer outcome. Placeholder prices, figures and statuses are clearly fictional; a numeric motion cannot authorise a value.

## Verification and boundaries

1. Run the repository's existing tests `node --test *.test.cjs quote/*.test.cjs`, plus `node --test shorts-lab.test.cjs`.
2. Run `python3 -m http.server 8791 --bind 127.0.0.1` at repo root and open `/kits/shorts-lab/`.
3. Inspect desktop, narrow mobile, 200% zoom, keyboard focus and tabbing, stage/product mode, search and filters, every preview, especially the roll, carousel, pill navigation and split menu.
4. Test `prefers-reduced-motion: reduce` both initially and when changed; stable values and real controls remain available. No animations should persist when the browser prefers reduced motion.
5. Check the collection, Co-op and existing kit routes to ensure nothing regressed. This route must not load customer SDKs or reach external animation APIs.
6. Verify actual GitHub Pages publication separately from commit, build and browser-local observations. Until a successful Pages build is checked, treat a branch as source only.

### Promotion discipline

**Do not update the portfolio-wide design instructions yet.** The next phase is human selection from the atlas. For each accepted effect, record: intended audience, effect benefit, no-animation state, keyboard and mobile behaviour, exact original source if recovered, licence, runtime/performance impact, owner of the target component, regression evidence and appropriate target product. Then update shared experience standards and the relevant specialist skills in the same reviewed change, without changing unrelated functionality.

Avoid copying a client's branding, a TV programme, media-player visuals or copyrighted assets. The techniques and original demonstrator graphics belong to this kit; reproduction of the creator's actual CSS is not claimed.

## Sources

- Creator channel: https://www.youtube.com/@aniakubow/shorts
- Referenced original odometer Facebook reel: https://www.facebook.com/reel/2025089661358011
- Review baseline: 22 November 2026, 75-row local research register (verdicts migrated to `effects-data.mjs` with the evidence caveats). Titles truncated in the source remain deliberately truncated. Do not invent full names or video URLs.
- Existing design decisions: `skills/build-demo-site/references/website-design.md` and `skills/demo-experience-standards/references/implementation-playbook.md`. These are **not modified** by this experimental page.


## Side-by-side video comparison — second iteration

The interface now has three distinct objects for each study:

1. **Original video link.** A direct individual link is shown **only** when title and source are verified. The initial commit contained three independently resolved source links: the YouTube modern slider tutorial, the YouTube toggle tutorial and the original Facebook odometer reel. The other cards say **Find this video (unverified)** and link to a title-scoped YouTube search, not the creator home page. `source-videos.mjs` holds the verified originals; `resolved-videos.mjs` is the machine-audited extension.
2. **Recorded implementation.** Once a real browser capture has been created, `clip-manifest.mjs` points to a committed local MP4 asset and displays an ordinary accessible `<video>` player. Until then the card explicitly reads **Recording pending**. Never silently substitute GIFs, stock video or the creator's copyrighted recording.
3. **Live implementation.** The authored preview remains in a separate panel with interactive controls; once a real clip exists, **Compare both** starts its playback alongside the preview's original animation.

A video only enters the manifest after `ffprobe` confirms dimensions and a playable video stream. There is no browser-side uploading, tracking or external playback runtime. This is a review aid, not a media redistribution catalogue.

### Running the video-link resolver on the Mac

Requires public metadata access via `yt-dlp`, installed separately (for example `brew install yt-dlp`). It **does not download video content**.

```sh
python3 tools/resolve-motion-videos.py --limit 8
python3 tools/resolve-motion-videos.py
```

The resolver first enumerates the creator's own Shorts tab, then searches individually when an entry is missing; it accepts a YouTube URL only when the originating creator and video title match strongly. It writes `kits/shorts-lab/resolved-videos.mjs` and an auditable `video-link-resolution.json`. Truncated titles and low-confidence matches stay unresolved and retain their exact-title search fallback. Review new links in a browser before committing; do not override the three manually verified ones.

### Capturing *our actual site*, not a separate mock-up

Requires `python3` with `playwright` and a Chromium browser, plus `ffmpeg` and `ffprobe`. This remains a local authoring task, not a dependency of visitors to GitHub Pages.

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
brew install ffmpeg
python3 tools/capture-motion-atlas.py --list
python3 tools/capture-motion-atlas.py --ids 40 41 68 69 75
# After reviewing that batch, capture every remaining visual study:
python3 tools/capture-motion-atlas.py
node --test shorts-lab.test.cjs
node --test *.test.cjs quote/*.test.cjs
```

The capture command starts a temporary **loopback-only server**, opens the actual `kits/shorts-lab/` application in headless Chromium, triggers its existing effect controls, captures the real rendered `.preview` frames, encodes a ~2.5-second, 512×320 H.264 MP4 for each visual study and validates each file. It deliberately skips the 13 non-CSS research references. Existing clips can be regenerated using `--force`. Videos are generated under `kits/shorts-lab/assets/`; the manifest is rewritten to include only validated files. Commit source, recorded assets and manifest together as a reviewed change.

**Capture acceptance (22 November 2026):** GitHub Actions run [45054054867](https://github.com/simonridd/demo-sites/actions/runs/45054054867) passed its browser-capture and full repository tests. It committed 62 H.264 MP4s (387,455 bytes total) and a manifest containing 62 verified file references. Exact source matches: 45 additional creator-validated YouTube links plus three separately verified originals, yielding **48 direct links** and **27 labelled title-search fallbacks**. Media capture and test execution are verified; original frame-for-frame CSS fidelity is not established, and real iPhone/Safari playback remains a separate acceptance check.

### Acceptance before main

- At least the first five high-value clips (IDs 40, 41, 68, 69, 75) play next to functioning live previews; their exact source links are checked individually.
- Complete the 62 applicable clips or explicitly document and fix individual capture failures before claiming full video coverage.
- Search/video-evidence filters distinguish verified source URLs from title searches; no channel-level source substitutes.
- Inspect mobile stacking, Chrome and Safari MP4 playback, keyboard controls, reduced motion, repeated playback and the original Co-op/Github Pages routes.
- Record the complete test output and final published Pages URL after merge. Shared product standards remain unchanged until the visual review is accepted.

## Repository files

- `index.html` — gallery layout, scope/attribution notice and filters
- `effects-data.mjs` — one labelled row for all 75 references
- `lab.mjs` — original preview composition, event delegation, accessible state and filtering
- `lab.css` — responsive gallery and one-shot visual effects with reduced-motion overrides
- `../../shorts-lab.test.cjs` — smoke and register coverage checks
