# Motion Atlas — 77 referenced techniques

Standalone, public-static, **originally implemented** experimental kit at `/kits/shorts-lab/`. It is not part of `demos.json`, is not a customer journey, has no Genesys/IVA/AVA binding, and does not modify any of the customer demos.

## Purpose and stage/product distinction

The user explicitly prioritises **one-off presentation impact** as well as product UI quality. An effect can be worth rehearsing for a stage moment while still being a poor default in an everyday tool. Use the **One-off presentation** and **Everyday product** modes to judge the same 77 references with different expectations. The initial verdict remains in both modes so it is not silently rewritten. 'Stage candidate' is a review invitation, **not** approval to use or ship.

The atlas holds:
- The original **75** named research rows plus two later screenshot-led studies (76–77), including incomplete titles and the Facebook odometer reel.
- **64** candidate studies with original HTML/CSS/JS visual or functional experiments, including speculative examples explicitly marked as hypotheses.
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
- `effects-data.mjs` — one labelled row for all 77 references
- `lab.mjs` — original preview composition, event delegation, accessible state and filtering
- `lab.css` — responsive gallery and one-shot visual effects with reduced-motion overrides
- `../../shorts-lab.test.cjs` — smoke and register coverage checks

## Screenshot-led refinements · 22 November 2026

The following studies were refined from reference screenshots supplied during the review. This improves specificity of the initial catalogue, **not** authorship of or access to the creator's full source code. Their CSS and interactions were independently authored.

| Study | Reference interpretation | Working kit implementation | When it earns its place |
| --- | --- | --- | --- |
| 74 · Modern carousel | The frame shows width 60%, aspect ratio 3/4, centre scroll snapping and animation-timeline view(inline). | Portrait cards scale up as they cross the centre, stay keyboard/arrow navigable and use a class-based fallback for unsupported scroll-driven CSS. | A project gallery or one-off presentation; avoid replacing an ordinary comparison grid without reason. |
| 73 · Material-style input | Focus reveals an accent bar beneath the field; the label floats instead of colliding with text. | Native labelled input, focus-within underline wipe and persistent filled-state label. No new framework. | Forms and controls when focus clarity improves. |
| 72 · Mobile collapsing nav | Navigation compresses once scrolling makes it sticky. | Sticky header with a scroll-state(stuck: top) container query and a scoped scroll-listener fallback. Links remain visible. | Mobile browsing with enough vertical content. |
| 71 · Icons that fill | Outlined symbols fill when activated. | Original heart, star and bookmark SVGs; clipped colour rises on toggle; keyboard and aria-pressed reflect the saved state. | Selection feedback or a deliberate stage reveal. |

The carousel screenshot included a **partial on-screen CSS snippet**, not its complete keyframes or source. Browser support for view(inline) and scroll-state queries is feature-dependent; fallback and reduced-motion presentation are required.

### Recording consistency

A code change invalidates the older video for that study. Regenerate **only IDs 71, 72, 73 and 74** using the existing capture pipeline with --force; check all four MP4 files, inspect their visible transitions and commit the regenerated assets. Leave the other 58 recordings and source links unchanged. Product-wide instructions and the Co-op demo should remain untouched until review.


## Screenshot-led refinements — second batch (22 November 2026)

These are independent implementations prompted by user-supplied video screenshots, not recovered creator source. Stage-first presentation choices can be more theatrical because most audiences will see the scene once or twice. All decorative animation is short and controlled, and all product actions retain semantic HTML.

| ID | Study | Treatment and reuse decision |
| --- | --- | --- |
| 066 | Gemini-inspired moving/blurred background | **Adapt for stage**: indefinite gentle motion (9-second drift) becomes more energetic while the activity control is held (2-second period), then returns to ambient pace after a 2-second delay. Includes Pause/Resume and static reduced-motion presentation. Best behind a one-off presentation title or AI sequence; do not imply actual processing or use constant background motion throughout an ordinary workflow. Original Gemini source/branding is not copied. |
| 067 | Thinking-bar colour sweep | **Adapt**: multicolour bar animates for two short cycles only when explicitly played, with a truthful illustrative label. Never treat the animation as proof of background processing or completion. |
| 068 | Expressive sliders | **Adopt selectively**: a native range input owns its value, keyboard controls and accessible label. The custom segmented track, narrow thumb, press feedback and live output are visual enhancements, with a static fallback. |
| 069 | Squishy toggle | **Adopt selectively**: a real checkbox/role switch determines on/off; CSS :has and the sibling checked selector control thumb position, while :active briefly compresses its shape. Its off state must always be unambiguous. |

After changing the live studies, recreate **only** the seven assets 060.mp4, 061.mp4 and 065.mp4 through 069.mp4; leave the other 55 clips, original video links and unrelated routes unchanged. Verify each new MP4 shows several visually distinct frames, inspect behaviour in Chromium and WebKit mobile emulation, check keyboard and reduced-motion scenarios, then merge and verify GitHub Pages for the exact commit. The shared product-authoring skills remain unchanged until this kit has been reviewed.


### Three further screenshot-led comparisons in this batch

| ID | Technique | Decision and implementation |
| --- | --- | --- |
| 060 | Android frosted blur vs Liquid Glass-inspired treatment | **Prototype both.** Keep one underlying composition and switch between soft translucent blur and a brighter optical lens with specular edge highlights. Both are original CSS illustrations, not official platform widgets or true physical refraction. Contrast, mobile Safari performance and readable fallback take priority. |
| 061 | Split button with popover | **Adopt selectively.** Primary action always works directly. A separate chevron reveals alternative actions through the native Popover API when supported, with fallback, keyboard arrows, Escape and explicit accessible state. The kit only displays simulated actions. |
| 065 | Pixel squeeze | **Stage-only prototype.** A bounded, stepped squash with a brief pixel grid is interesting for a theatrical reveal. It should not become routine confirmation or navigation. The reference screenshot did not expose all of its original CSS, so the implementation is independently authored and labelled speculative. |

All original video links and case IDs are retained. The Android/Liquid comparison is intentionally about the optical treatment, not a promise of an Apple or Google component implementation. Check both alternatives on a real mobile browser before promotion; the existing CSS fallback must stay readable without backdrop-filter. This batch's successful capture and publication are separate from the source code changes.


## Screenshot-supplied filter and image glow (current review)

The **Screenshots supplied** gallery filter is a separate evidence dimension, not an approval verdict. It currently highlights studies **36, 50, 52, 57, 60, 61, 65, 66, 67, 68, 69, 71, 72, 73, 74, 76, 77, 78, and 79**. The user provided short-form video frames or visual references for these techniques. The underlying video files and the creator's original complete CSS are not claimed to be recovered. A screenshot marker is not proof of cross-browser compatibility or licence rights.

Study 076 contains genuinely filtering horizontal category chips, with single selection, keyboard arrow navigation and mobile overflow. Study 077 uses an **original** transparent SVG illustration twice: one sharp visible asset and one blurred copy behind it to create a reversible colour halo. All still content remains visible with JavaScript disabled; neither example includes customer accounts or external media dependencies.

Study 057 now compares a smooth gradient against the identical gradient with an original SVG `feTurbulence` texture mixed at low opacity. The grain can be toggled without altering the source gradient. Update only changed study recordings (52, 57, 60, 61, 65–69, 76 and 77); preserve the other video assets and all customer routes. Keep the broader product and presentation standards unchanged until visual selection is reviewed.

### Validated reference-batch acceptance

The screenshot-backed review branch holds **77 studies**, including **17 with user-provided screenshot evidence** and **64 browser-recorded MP4 clips**. The full repository test suite passed **80/80**, and Chromium/WebKit mobile checks covered screenshot filtering, visual controls and native slider/switch interaction. Eleven affected or new clips were re-recorded and validated; the other recordings remain intact.

See the review pull request for the exact source revision and the final GitHub Pages deployment receipt. The original creator's full CSS was not recovered. Screenshots are evidence references, not proof that her exact implementation has been reproduced.

### Study 066 correction — ambient, not one-shot (23 November 2026)

The user correctly identified that the screenshot's `animation: drift ... infinite alternate` and registered `--fast` custom property produce **ongoing** motion, with a fast state while a button is active and a delayed return to the slow period on release. The first Motion Atlas interpretation incorrectly used a single 2.1-second scene reveal. Study 066 now demonstrates continuous ambient movement, a press-and-hold activity trigger, a pause toggle and a static reduced-motion fallback. Other screenshot-backed studies remain visually accepted in the kit and are intentionally unchanged; this does **not** promote them automatically into product design standards.

The existing recorded Study 066 MP4 is invalidated by this correction; regenerate only `assets/066.mp4`, check the changing frames and preserve the other 63 recordings. Include a real mobile interaction test before publishing. 


### Visual baseline and two additional references (23 November 2026)

The other screenshot-backed effects were favourably reviewed and should remain unchanged in the kit. Approval applies to the appearance of these **kit studies**, not automatic adoption into every product, or proof of original creator-code fidelity.

**Study 050 — premium card shine:** A revised dark-teal hero card uses a short directional light sweep and restrained surface depth. Hover/focus on desktop or a direct tap on the card can replay the glint. All text remains readable without animation. Use selectively in presentation cover or portfolio card, not every control.

**Study 078 — neon text:** A new screenshot-supplied *optional prototype* with cyan/pink layered shadows and a brief "ignition" when the labelled button is selected. The unlit text remains readable and the on/off state is reversible. A plausible effect for an occasional stage headline or avatar introduction, not ordinary interface typography. The original creator's exact code has not been recovered.

Re-record only the updated 036, 050 and 066 clips and the new 078 and 079 clips; verify that all 66 visual studies have matching MP4s. Preserve the other 62 recordings and all customer-demo integrations.


### Study 079 — holographic conference-ticket concept

A new screenshot-supplied **stage-first prototype**, implemented independently: a fictional event pass with static legible information, a colourful iridescent foil layer, controlled tilt/light-angle change and an explicit **NOT VALID FOR ENTRY** label. Intended for workshop openers, event landing pages or a one-off presentation reveal, not ticket sales or authentication. This is a visual concept, with no barcode, customer data, external asset or entry claim. Tap/click to tilt; reduced-motion shows a static ticket with the same content. The creator's original code and exact video frames were not recovered in this build.

The user judged all *other* screenshot-backed effects positively. Preserve their current appearance as the kit baseline, not as an automatic instruction to ship them into unrelated products. Validate the new holographic ticket and the corrected Gemini activity behaviour independently before publishing.

### Study 036 — original Apple-style superellipse icon geometry (23 November 2026)

This screenshot-led refinement compares a standard CSS rounded icon with a continuously curved superellipse icon. Both use **original artwork**, not Apple's application assets. A native range input adjusts the curve; `corner-shape: superellipse()` is preferred where supported, and a generated high-resolution polygon approximates the shape in browsers where the experimental property is missing (including relevant WebKit builds). With JavaScript disabled a static fallback polygon remains visible. No client branding or app icon asset changes are made.

Because `corner-shape` is not yet Baseline across major browser engines, keep this effect in the experimental kit. The screenshot is evidence of the technique, not proof that this CSS is the creator's original stylesheet or that Apple uses this exact implementation.

Regenerate only Study 036's recorded MP4 alongside the current release acceptance; leave all unrelated screenshot-backed studies unchanged. The user has positively reviewed the other screenshot-backed kit examples.
