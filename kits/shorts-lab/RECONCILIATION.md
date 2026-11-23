# Motion Atlas reconciliation · 23 November 2026

Base: `b5f9bde` on `main`, **80 studies, 67 recorded visual studies, 13 research-only references**. The earlier review mentioned a release branch; inspection found that release already merged into main. The existing 80 title/ID/preview mappings are frozen in `tools/fixtures/motion-atlas-original-ids.json` and checked by a regression test. Approved screenshot-backed compositions outside this batch are preserved.

| Review / backlog | Existing study | Implementation in this change |
| --- | --- | --- |
| #71 patterned backgrounds | 34 pattern | Extend same row: checker, graph, diamond, dot; static/one-pass/loop, tile/direction/speed and quiet treatment |
| #72 listening orb | 32 voice-orb | Two opposing rotating layers, state inputs, supplied level, bounded SVG lens; later no-blur correction respected |
| #73 bend behind glass | 60 blur | Preserve existing Android and Liquid Glass-inspired options; add verified authored-scene displacement/plain/frost comparison |
| #74 seamless marquee | 27 marquee | Preserve one pass; add two-tile loop, resize/font measurement, direction/spacing/duration and hover/focus pause |
| #75 pulsing dot | 26 pulse | Steady dot with expanding halo; simulated states and bounded/active-only loops |
| #76 scroll-driven objects | 25 reveal | Co-op once-only entrance plus reversible CSS entrance, deliberate exit and static fallback |
| #77 loading skeletons | 24 shimmer | Card/rows/message, pending/success/empty/error/cancel/retry and external owner adapter |
| #78 animated sprites | 23 pixel | Original eight-frame vector gesture; preserve pixel bounce as a variant, single/loop/still and cleanup |
| #79 sibling index / waves | 22 stagger; 70 wavy | Extend 22 with native/fallback/static indexing, dynamic children and 36-bar wave; preserve distinct 70 |
| #80 before/after | No existing matching study | New **81**; reuse Co-op presentation native comparison recipe, white divider, aligned images/inert DOM, keyboard/touch and side-by-side |
| Aurora-inside-text review | No existing matching study | New **82**, text-clipped gradient and optional hidden glow duplicate; readable static/forced-colour fallback |
| #70 media hotspots | Research-only 35 / 37 | Link to separate native image/video prototype with allowed local project links; preserve original research classification |

Total: **82 stable studies**, with two new rows rather than duplicating the nine existing effect families. Thirty rows now carry screenshot-intake provenance. Earlier counts in issue descriptions (75/77) reflect their intake time and do not override the current catalogue.

## Checked before building

- Co-op website: `co-op/motion.js`, `motion.css`, guided help and order-support recipes. Reused its once-only observer, focus cancellation and reduced-motion approach; retained the customer source unchanged.
- Co-op presentation: `presentation-construction`, `presentations/co-op-everyday/{runtime.mjs,style.css,visual.mjs,sources.md}` at `0786711`. Reused its native-range/percentage clipping/divider approach, including pinned Dice UI provenance and MIT notice. No Three.js, GSAP, React or Radix dependency copied.
- Previous Atlas: existing tile artwork (34), stage stagger (22), pixel bounce (23), shimmer bars (24), one-shot reveal (25), sample status (26), one-pass marquee (27), single orb (32) and blur/optical highlights (60). Their identities are kept; new capabilities are configurable variations.
- Previous approved captures/implementations: premium shine (50), superellipse (36), Gemini ambient background (66), neon (78), holographic ticket (79), ImageKit avatar (80), icon/input/navigation/slider/chip studies and all other unchanged original rows. Their original source, recording and functionality remain intact.
- Review evidence: 23 November “Assess Video Effect” and “Add Shoppable Links Backlog” intake, plus repository issues 70–80. Partial screenshots and previously resolved video links retain their provenance. No source video or creator CSS was downloaded or claimed as recovered.

## Reuse and release boundaries

The new `effects/` directory is a portable native library and working example collection, with configuration/API documentation and a machine-readable registry. The shared website/experience instructions link to it and explain selective target integration. No effect is added to a customer's task flow, another application's renderer or real call/readiness gate by this change. The only maintained personal guidance updates mirror the new scoped source guidance; other skill content is preserved.

Authored-scene SVG refraction is working; arbitrary native HTML backdrop refraction is **deferred**, since parsing backdrop URLs is insufficient proof of cross-browser pixel capture. ImageKit beta player/commerce/private-account integration is **deferred**; the optional native hotspot interaction works with our own public example media and local allowed anchors. Research-only topics such as payments, calendars, agents and location sharing retain their original exclusions.

A PR is the requested delivery. This task does not merge it or claim a new GitHub Pages deployment. Physical iPhone/Safari, low-power GPU/battery and 60/120 Hz device qualification remain target-integration checks, separate from desktop engine evidence.

## Verification

Final acceptance:

- **90/90 Node tests** passed, including all pre-existing repository checks and three new preservation/library/isolation checks. `node tools/check-skill-parity.mjs` passed **2 skills / 9 mappings**. The PR workflow now runs repository regressions as well as parity.
- **174 Playwright assertions** passed on Chromium **159.0.8154.6** and WebKit **27.2**. Covered initial/dynamic reduced motion, exact three-cycle marquee wrapping, opposing orb rotation/seams, eight sprite frames, native scrolling/reversal, all skeleton shapes/outcomes, cancellation/retry, native keyboard and touch input, 320/390 px and 200% text reflow, multiple instances, teardown, real MP4 playback, media-link time windows, and no-script comparison. Browser errors were checked.
- Firefox was attempted twice (temporary and explicit isolated profiles); the installed engine failed before loading a page with **“Could not find profile folder”**. No Firefox acceptance is claimed. WebKit is engine evidence, not a physical iPhone test.
- **11 affected browser recordings** were regenerated and ffprobe-validated at **512 × 320**, **141,309 bytes total**. Study 27 runs **4 seconds** to show repeated one-second wraps; the other affected clips run 2.5 seconds. The manifest uses measured duration and now contains **69 verified recordings**. The remaining original recording files are unchanged.
- Visual inspection covered the combined effect contact sheet, individual Chromium/WebKit optics/wave/scroll/comparison screenshots, mobile gallery and enlarged text. Refraction visibly bends the grid/curves; the optical foreground stays sharp. No live customer account or Messenger test was run.
- Core controller + CSS + optional example markup generator: **43,409 uncompressed bytes**, plus **4,319 bytes** of original SVG sample assets. These are measured source sizes, not a device-GPU/battery benchmark. No visitor packages were added. Animate only selected components and measure the real target before adding live audio or large assets.
- The self-contained export (`tools/package-motion-effects.py`) includes the retained licence, assets and sample video. A source-only hotspot example needs its approved media URL; the export includes a local sample automatically.

 The original regression baseline passed **87 tests** before changes. The final suite retains those tests with only intentional catalogue/screenshot count updates and adds preservation/portable-library checks. Source checks, browser behavior, captured MP4 validity and Pages publication remain separate evidence.
