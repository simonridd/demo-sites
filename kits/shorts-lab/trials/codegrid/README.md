# Codegrid practical storytelling · issue 99

**Three isolated review prototypes. Not approved, published or installed in another application.** [Issue 99](https://github.com/simonridd/demo-sites/issues/99) requires a human-reviewed prototype and the target owner's acceptance before promotion. These routes do not change customer demos, simonridd.com, Relay, Demo Studio or any presentation player.

Serve the repository with `python tools/serve-motion-preview.py --port 56833`, then open `/kits/shorts-lab/trials/codegrid/`. All scenes start still and have full no-script content. Select **Explore with scroll** deliberately. The inner frame uses native scrolling, native keyboard movement and real-position checkpoints; page scrolling and browser links remain ordinary. No document keyboard handler, wheel interception, smooth-scroll proxy or second presentation player is installed.

## Trials and comparisons

| Route | Working comparison | Existing overlap retained |
| --- | --- | --- |
| [Project gallery](./gallery.html) | Four owned project concepts: fixed grid versus expanding illustration fields in a semantic project list. Card geometry, titles and links remain stable while art expands near the frame centre. Real project-note URLs and browser Back preserve exploration mode/position. | Extends the research beyond carousel 74 and scroll object 25; no new ID or basic carousel duplicate. |
| [Peeling card stack](./stack.html) | Four original customer-journey stages in a bounded perspective stack; front cards peel away as native scroll advances. The complete reading outline remains outside the animated decoration. | Reuses the pinned GSAP core for a coordinated narrative; Co-op entrance behavior and the original Atlas studies are untouched. |
| [Phased hero](./hero.html) | Two original SVG illustrations move through Observe → Connect → Offer. Its true heading and primary anchor remain static and usable at every phase. Compare the still two-image composition with the explicit scroll mode. | One deliberately bounded stage intro, rather than another text wipe/mask study. |

All images are original code-native SVG art authored for this trial, not creator/client imagery. Intrinsic dimensions reserve their geometry. The illustrative project notes are fictional concepts, not case studies or product-delivery claims. The stack is an authored explanation, not a claim that a real AVA/workflow has been configured or completed.

## API and lifecycle

`mountScene(root, {load, restore:true, peelAngle:-72, peelDistance:115, cardSpacing:10, heroSpread:26})` from `scenes.mjs` returns `{root, setMode, checkpoint, refresh, destroy}`. Use the native static HTML as the host renderer's content. Keep the trial bounded to 3–5 cards; stage names come from the complete reading outline. The peeling angle (−85…−30°), distance (80…140% of card width), spacing (0…16 px) and hero spread (18…30%) are bounded author options; image/text, reserved frame height and card styling belong to the host's markup/CSS. `setMode('explore')` is asynchronous for stack/hero's first local runtime load; `setMode('static')` cancels/reverts the owned timeline. `checkpoint(0…1)` moves the actual inner scroll position instantly. Gallery expansion uses scoped native events/CSS and never loads GSAP. Stack and hero each use one **paused** GSAP timeline; a passive scroll event schedules at most one frame to seek it. There is no continuous component animation loop.

The existing **GSAP 3.15.1** file is loaded on demand only when a stack/hero trial is explicitly enabled. The local file and its source SHA are unchanged. No ScrollTrigger, Next.js, React, Lenis, Locomotive, Three.js, canvas, CDN or new visitor package is added. Runtime load failure and interrupted activation retain the complete still view. Resize updates only the bounded frame height; background/offscreen scenes do not seek until relevant again.

`destroy()` aborts listeners, disconnects observers, cancels a queued frame and reverts only the owned GSAP context. A delayed runtime resolution cannot reactivate a destroyed or settled scene. Before route/slide removal, call teardown through the existing host's lifecycle. Drive this scene through that owner's actual navigation/state; never patch its keyboard shortcuts, deep links, audio timings or readiness gates. The helpers auto-mount only through the separate example module, not when imported.

The dedicated routes remember only their viewing mode and inner scroll offset in a namespaced session-storage key. They do not alter URL/history state, gallery destinations or browser scroll restoration. Storage failure leaves native navigation working. Fresh fragment URLs remain the browser's responsibility. A focused gallery link is kept in view when reduced motion returns the layout to its static grid.

Initial and changed OS/global reduced motion settle to the complete still composition and retain every link/reading stage. Print also removes pinning, expands the cards and retains both hero illustrations. The scene controls do not announce scroll percentages as a live region. Native touch and keyboard semantics remain authoritative. Headless WebKit mobile evidence is separate from physical iPhone toolbar/keyboard and low-power qualification.

## Sources and rights

Concept sources supplied by issue 99:

- [Codegrid expanding project gallery](https://www.youtube.com/watch?v=ORlDTZjXmIU).
- [Codegrid peeling 3D card stack](https://www.youtube.com/watch?v=FW0VdAYF8ro).
- [Codegrid multi-phase hero](https://www.youtube.com/watch?v=t38bIJQqoB8).

The direct YouTube watch/oEmbed fetches were throttled in this session; exact-ID primary searches returned no results. The issue's curated descriptions are the reference brief. These are independent technique prototypes, not claimed frame-by-frame recreations or verified reproductions of the creator's code. No creator repository is cloned/executed, no premium source is imported, and no footage is downloaded or redistributed. Human source comparison remains part of owner review.

The reused GSAP distribution retains its notices and [source metadata](../../../../assets/vendor/gsap/source.json). Its [standard licence](https://gsap.com/community/standard-license/) was checked on 23 November 2026; this is not an MIT distribution. The trial displays authored animation rather than providing a visual animation builder. Adoption in an authoring tool requires its owner's licence/runtime review. Technical references: [GSAP timeline](https://gsap.com/docs/v3/GSAP/Timeline/) and [context/revert](https://gsap.com/docs/v3/GSAP/gsap.context()/).

The [trial manifest](./trials.json) retains sources and overlap mappings without modifying the approved Atlas registry. [Browser recordings](./recordings.json) describe our three 4-second/48-frame captures; they are original implementation evidence, not creator footage.

## Evidence and budgets

Run `python tools/verify-codegrid-trials.py --url http://127.0.0.1:56833 --output /absolute/evidence`. The acceptance checks cover static/active/reverse/parked geometry, native keyboard/checkpoints, real links/Back, mobile touch, 320/390 px and enlarged text, initial/changed reduced motion, runtime failure and teardown. The sticky scene must fit the frame rather than inheriting the full tall track; this is asserted from actual geometry.

Budgets for these local trial routes: **<55 KB initial uncompressed document/resources**, **<135 KB after activation**, **CLS <0.01**, Chromium localhost **LCP <1,500 ms**, and a controlled 60-frame native-scroll sample **p95 interval <40 ms**. Record actual per-engine values; they are local fixture measurements, not field performance or an app's expected gains. Recordings are loaded only when opened deliberately, outside the initial route budget. Physical-device GPU, battery, 60/120 Hz and virtual-keyboard checks remain open. The installed Firefox profile-launch failure is inherited; no Firefox qualification is claimed.

## Remaining shortlist

Route/shared-element transitions, pointer-parallax SVG, fullscreen-menu choreography and frame-sequence canvas remain research, not implementation promises or new dependency requirements. Existing typography, wipe, carousel, counter, skeleton and scroll effects remain under their current IDs. Long page pinning, custom scroll hijacking and novelty-only heavy scenes remain excluded. Reject these trials if they make project navigation or the story harder to follow; owner review should compare their still and exploratory modes before adoption.


## Current measured acceptance · 23 November 2026

**257 Playwright assertions** pass in Chromium 159 and WebKit 27.2, including mobile touch emulation, actual recorded-media play/pause, print, failure and teardown. **92 repository tests** and **2 skills / 9 capability mappings** pass. The pinned runtime SHA-256 remains `3d1bea374ab1b703cc5c4105358eec63c4465efdc573931dc116e34a0a190c1b`.


| Engine / route | Initial bytes | Activated bytes | Initial LCP (ms) | CLS after activation/scroll | Scroll interval p95 (ms) |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium / gallery | 22,748 | 22,748 | 68 | 0.00000 | 17.3 |
| chromium / stack | 22,862 | 96,219 | 28 | 0.00004 | 16.8 |
| chromium / hero | 21,090 | 94,447 | 24 | 0.00001 | 16.8 |
| webkit / gallery | 21,544 | 21,544 | 220 | 0.00000 | 18.0 |
| webkit / stack | 21,247 | 94,604 | 78 | 0.00000 | 18.0 |
| webkit / hero | 20,651 | 94,008 | 73 | 0.00000 | 18.0 |

The initial/activated measurements use a fresh local context before the separate zoom, OS-preference, print and playback checks. Explicit mode changes may rearrange the contents of the reserved frame; ordinary exploration does not change card or frame geometry. No external requests or runtime/same-origin asset errors were observed in the accepted routes. Native Back and mode/scroll restoration were exercised on real project links. Three 4-second, 48-frame MP4s were captured from the actual browser scenes and ffprobe-validated; earlier approved recordings remain unchanged.


These observations meet the stated local budgets and do not establish physical-device performance, field Core Web Vitals, conversion benefits or the advantage of this motion for a particular owner. Source footage comparison and human adoption review remain open.
