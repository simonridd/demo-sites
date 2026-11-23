# Motion Atlas · second 23 November intake

This extends PR #92 from `7ffa405`. The catalogue remains **82 studies / 69 recorded visual studies / 13 research-only rows**. No new IDs are needed. The existing aurora study already covers issue 82; its controls now also expose glow radius, intensity and text scale. The screenshot-intake filter grows from 30 to **42** rows.

| Issue | Stable study | What changed / reused |
| --- | --- | --- |
| 81 | 21 tv-intro | General one-image horizontal, diagonal, circular, diamond and fade wipes; original typography mode preserved |
| 82 | 82 aurora-text | Existing implementation reconciled; extra glow/text controls, no duplicate row |
| 83 | 20 count-up | Existing JS ease-out/locale recipe plus registered CSS integer and static comparison; exact accessible final value |
| 84 | 17 typewriter | Full original heading, measured monospace width, grapheme counts, cursor choices and complete wrapped-text fallback |
| 85 | 19 metaball | Five small white dots with actual merging/neck separation and No filter comparison; two-dot option preserved |
| 86 | 18 border | Thin travelling highlight, optional glow, original bold palette; angle/rotating-layer comparison and separate focus ring |
| 87 | 15 progress | Original known-value toggle preserved; real contained/document scroll-position bars and measured fallback |
| 88 | 14 focus-within | Original email field plus search, multi-field and toolbar groups using native focus containment |
| 89 | 11 palette | sRGB/OKLCH/Oklab mixing, reusable token snippets, real rendered pairs and composite contrast checks |
| 90 | 9 layout-shift-2 | Original media reservation plus auto/stable/both-edges gutter measurements; real native classic-width mode and overlay caveat |
| 91 | 8 mobile | Actual vh/svh/dvh and fixed/min-height comparison, separate full-page fixture and safe-area footer |
| 93 | 6 reduced-motion | Local comparison plus behavioral checks across all library and gallery studies; paired recording now honors reduction |
| 94 | 47 formats | Original locally generated 600/1200 AVIF/WebP/JPEG fixtures, measured sizes, responsive picture sources and cold eager/selective delivery comparison |

## Reuse before implementation

Co-op's existing `order-support.css` already supplies `height:100vh; height:100dvh` with safe-area padding. `co-op/index.html` already uses a scoped high-priority hero render. Existing focus and responsive-input recipes and the shared OKLCH/viewport/reduced-motion guidance were inspected. The same reasoning is applied to the isolated library; Co-op and other products are not restyled or made dependent on Atlas.

The newer `main` update to Co-op's separately approved launcher state was merged intact during this task. No live message or customer account action was performed. Preserving that concurrent change is separate from Atlas acceptance.

## Practical integration boundaries

The library now exposes **23 opt-in study families**, plus its native-media extension. Native CSS is primary for layouts, masks, grouped focus, derived colours and scroll timelines. JS counts use a bounded requestAnimationFrame loop; fallback progress uses passive events with one queued frame and cleanup. No new visitor package is added. Pillow is only an optional authoring dependency for regenerating the original raster fixtures; visitors and reuse do not require it.

Five-dot filters remain confined to a small dark field. Static/unfiltered comparison and diameter/blur controls make calibration explicit; the source screenshot's filter values are not blindly copied. CSS counters are an integer comparison, not a locale/decimal replacement. Typewriter headings do not replace actual demos, transcripts or streaming output. Wipes introduce one licensed/owned image, while study 81 remains a purposeful two-image comparison.

Scrollbar gutters reserve classic-scrollbar space, not overlay space. Chromium's real 14px native scrollbar was tested after disabling Playwright's default `--hide-scrollbars`; the experiment does not invent padding to make a difference. WebKit 27.2’s opt-in custom classic-width mode did **not** reserve stable space before overflow; this is displayed from real measurements and remains a qualification limit, not hidden by fake padding. Default native overlay behavior remains unchanged. The viewport frame measures its own actual viewport. All three viewport units can be equal in headless testing; this is reported rather than presented as simulated phone chrome.

The performance pages are byte-identical in imagery and geometry and differ in native delivery attributes. Their original noisy illustration deliberately supports real AVIF/WebP/JPEG byte comparisons. AVIF is larger than WebP for this asset. Native format selection is held constant across the priority/lazy comparison; no universal codec or production speed claim is made.

## Acceptance

Final results:

- **91 repository tests** pass, retaining the original site/Co-op suite and adding a delivery-contract check. Skill parity remains **2 skills / 9 mappings**.
- **224 new-intake browser assertions** pass in Chromium 159 and WebKit 27.2, plus the **174 previous behavioral assertions**, now exercised with all 23 families present. Checks include actual intermediate image masks/counters/typewriter state, five-dot merge/separate pixels across three cycles, grouped focus, actual contrast extremes, native/fallback scroll ratios, viewport geometry, initial/changed reduced motion, media pause and full-gallery state. No browser runtime errors remain.
- **89 delivery assertions / 12 cold page views** cover desktop, mobile and 1×/2×. Both engines requested five images initially in the eager baseline and only the hero in the selective fixture; all four gallery images loaded on scroll. In Chromium desktop, the initial hero request changed from **Low** to **High** priority, initial completed image transfer was **117,906 → 78,378 bytes**, and observed CLS was **0**. Under the controlled 100 ms / 200,000 byte/s profile, desktop observed LCP was **868 → 652 ms**. These are this fixture’s lab observations, not predicted production savings. WebKit’s unthrottled local observations are recorded separately.
- Original raster fixture sizes are explicit: at 1200px, **WebP 36,152 B / AVIF 78,078 B / JPEG 60,188 B**; at 600px, **3,668 B / 9,582 B / 11,748 B** respectively. Native format choice and visual quality are separate decisions from request priority.
- **13 affected MP4s** (studies 6, 8, 9, 11, 14, 15, 17, 18, 19, 20, 21, 47 and 82) were regenerated from the actual gallery, ffprobe-validated and kept under their existing IDs. All 69 manifest references remain real. The scroll-position recording captures actual scrolling; the motion audit recording changes the local preference and settles.
- Visual inspection includes a contact sheet of the twelve refinements plus aurora controls, individual Chromium/WebKit images, focus/contrast/gutter states, enlarged type and the narrow gallery. The exported package is tested independently after extraction, including all 23 study mounts and included-media playback.
- A real resize-observer feedback warning was fixed by scheduling measurement writes in the next frame, observing the relevant scroll content/panels and cancelling that queued work on teardown. A reuse-guide link that worked in the gallery but failed in the portable examples is now resolved from the configured asset base and regression-checked.

 Physical iPhone/Android toolbar, virtual-keyboard, safe-area, low-power rendering and field-performance qualification remain target/device checks. The existing local Firefox profile-launch failure remains unresolved; Firefox acceptance is not claimed.

Original-entry identity and customer-route regressions remain part of the repository suite. Other than the 13 intentionally refreshed recordings (twelve refined existing studies plus aurora controls), prior recordings remain unchanged. Shared guidance links to the new recipes and evidence without duplicating already adopted viewport/motion rules or installing effects into another product's runtime.
