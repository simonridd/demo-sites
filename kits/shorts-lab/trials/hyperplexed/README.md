# Hyperplexed practical pilots · issue 101

**Isolated review work. Not deployed, approved for product use or installed in an app.** [Issue 101](https://github.com/simonridd/demo-sites/issues/101) prioritises two pilots; the card-choice-to-deck sequence remains a specialised stage candidate. No per-video tickets or duplicate catalogue IDs are added.

Serve with `python tools/serve-motion-preview.py --port 56837`, then open `/kits/shorts-lab/trials/hyperplexed/`. The [spotlight](./spotlight.html) compares three treatments on the same cards. The [utility dock](./bubbles.html) compares ordinary inline tools with optional bubbles. All examples contain original fictional content. No customer route, Co-op support flow, actual demo-phone call state, Messenger binding, presentation key/timing or existing ready/call action changes.

## Shared card spotlight

The same semantic cards offer static, thin-border light, and restrained face + border treatments. One pointer coordinate field is mapped into each card. Geometry is read only after entering/changing the layout, with cached per-card offsets invalidated by resize/scroll; pointer movement schedules at most one frame and writes two shared CSS variables. There is no continuous loop or per-card measuring on every pointer event. Leaving the grid, hiding the page, changed reduced motion or teardown clears the light.

`mountSpotlight(root, {radius:270, faceAlpha:.075})` returns `{update, reset, destroy}`. `update('static'|'border'|'face')` selects a treatment. Radius is bounded to 120–420 px and face alpha to 0–0.1. Dark/light tokens keep body/link contrast stable under the brightest face treatment. The glow is a background/edge decoration, never a status. Every card has equally prominent keyboard focus. Touch/non-hover and initial/changed reduced motion retain static surfaces and working links. Unsupported border masking keeps the ordinary outline rather than covering content with a gradient.

This is the pointer-spatial extension of Atlas 50/18/77, not another shine sweep or rotating border. The original studies and registry remain unchanged until a target accepts this variant. Use only for a portfolio/project index or another justified card collection, not an operational table by default.

## Confined utility dock

`mountUtilityDock(root, {count:3, side:'right', vertical:.45})` returns `{setEnabled, dock, restore, configure, open, close, dismiss, destroy}`. Keep 1–3 utility definitions in the root's static details markup; their `data-utility`, label and letter are trusted author configuration. Use unique source input/details IDs when composing multiple roots. Generated panel/title/help IDs are unique per mount.

- **Off by default.** The example checkbox is the feature flag. Native inline details and the scratchpad work without JavaScript; script-only comparison controls stay disabled. Enabling the dock adds no required function.
- **Real, singular content.** Opening a utility moves the same DOM node into a labelled nonmodal region. Close, dismissal, disabling or teardown returns it inline with its actual textarea value intact. Use inline returns directly to the original disclosure. No cloned form, storage, message send, real notification or transaction is involved.
- **Scoped movement.** Drag the closed dock to either edge; a short ease settles it without momentum or physics. Dock-left/right buttons provide a non-dragging alternative. The open dock uses a row above its panel. The layer is absolutely positioned inside an isolated workspace boundary; primary navigation/header/actions are outside it and cannot be covered. It is not a document/body portal, phone OS overlay or push-delivery system.
- **Keyboard and focus.** One tab stop enters the utility toolbar. Up/Down/Home/End moves focus between available tools; Left/Right changes edge; Enter/Space uses native button activation; Delete/Backspace dismisses; Escape closes and returns focus. These handlers run only on the owned buttons/panel. Page keys, text editing and presenter shortcuts elsewhere remain untouched. No focus trap, modal claim or consumed outside click is installed.
- **Restore and containment.** Dismissed utilities remain inline and can be restored. Count changes retain a valid focus target. Pointer cancellation, disabling and teardown stop owned drag work. Resize reclamps the dock. The underlying workspace scrolls normally, and pointer handling is confined to the handles. Actual primary links remain usable while a panel is open.
- **Reduced motion.** Initial/changed OS or global reduction removes the settling transition while direct manipulation and functional tools stay available. Teardown aborts listeners, cancels queued work, restores original nodes and removes generated controls. A mounted instance is not a screen-reader-user audit.

This narrower implementation deliberately omits the original library's spring/momentum physics, chained drags, magnetic fling-to-dismiss, dynamic manager events, framework wrappers and full-screen overlay behavior. It is not API-compatible or a replacement for the full package. A product-specific evaluation must demonstrate a benefit over the inline disclosure/drawer baseline before any migration.

## Source and licence review

**Concept credit: Hyperplexed.** The [creator site](https://www.hyperplexed.io/) and [public bubbles demo](https://bubbles.hyperplexed.io/) were opened. The latter's actual Settings/Docs/Shortcuts row and panel were visually inspected in Chromium. The source review examined the core README, package metadata, index, options and panel implementation at commit [`9fb99cd36ca1df8cf32e2e43f175e77a47297c15`](https://github.com/githyperplexed/bubbles/tree/9fb99cd36ca1df8cf32e2e43f175e77a47297c15).

The pinned source's panel uses **`role=region`**. Its README still describes a nonmodal dialog in one section; code and docs must not be treated as interchangeable evidence. The README expressly says the accessibility implementation has not been audited with real screen-reader users. Our own tests likewise do not establish that qualification.

The published `@hyperplexed/bubbles` **0.8.1** archive was inspected without installing or executing it. It has zero runtime dependencies and **110,263 unminified JavaScript bytes across 31 dist modules**; the whole archive is **105,860 bytes** including non-runtime material. Those are distribution/source-inspection measurements, not an optimised bundle or a fair feature-equivalent performance comparison. Our smaller dock is an independent implementation with a different feature set. No vendor runtime is shipped. The original [MIT licence](./source-notices/Hyperplexed-bubbles-MIT.txt), including Hyperplexed's copyright notice, is retained as source-review attribution; it does not relabel our entire repository as MIT.

Spotlight references: [creator tutorial](https://www.youtube.com/watch?v=htGfnF1zN4g) and [community demonstration](https://codepen.io/AThorne/pen/ZEjGZrV). The latter's source shows pointer coordinates applied to radial gradients; it is **community code, not the creator's original source**, and no code/assets are copied. Our cached shared-coordinate controller and original cards are independently authored. Existing Atlas premium-card, border/image-glow and Co-op focus/inline-support recipes were checked first. Source inspection does not claim frame-by-frame tutorial validation.

[Pinned source review](./source-review.json) · [Original browser recordings](./recordings.json). Both clips are silent, use real pointer/native controls and are ffprobe-validated; the playback UI loads no video until requested. Before printing, an open utility returns inline so its content remains available in the static output.

## Acceptance and review gate

Run `python tools/verify-hyperplexed-trials.py --url http://127.0.0.1:56837 --output /absolute/evidence`. The checks exercise both themes, cached pointer geometry, focus and actual card links, pointer leave, initial/changed reduction, 320/390 px and enlarged layouts, real dragging/docking, keyboard dismissal/restore, nonmodal outside actions, singular content state, touch, no-script and teardown. The cold route budget is **<55 KB uncompressed** and **CLS <0.01**; inspect exact local observations separately from physical-device performance. This trial adds no framework, physics, GSAP, canvas, CDN or visitor dependency.

Screen-reader-user testing, physical iPhone/Android keyboard/safe-area behavior, GPU/battery measurements and any demo-phone/Messenger integration remain unqualified. The installed Firefox engine is attempted in acceptance; a launch failure is recorded separately from passing engine checks. Do not promote source or browser claims beyond the actual evidence.

The specialised card-choice-to-deck candidate and lower-priority glitch/texture/trailer/nav effects remain reserved/rejected as described in #101. Existing Jhey trials are in [PR 98](https://github.com/simonridd/demo-sites/pull/98), Codegrid trials in [PR 100](https://github.com/simonridd/demo-sites/pull/100). This branch does not merge them, replace their functionality or promote these pilots to shared design standards.


## Current measured acceptance · 23 November 2026

**158 browser assertions** pass in Chromium 159 and WebKit 27.2, plus **92 repository tests** and **2 skills / 9 capability mappings**. Firefox was attempted and could not launch the installed engine; qualification is not claimed. Current desktop, pointer/focus, both themes and narrow panel states were visually inspected. The conservative body/link contrast bound across both themes and face alpha 0 / 0.075 / 0.1 is **5.372:1 minimum**; the theme-specific 3 px focus outline is **6.041:1 minimum** against the card surface.

| Engine | Spotlight cold bytes | Dock cold bytes | Initial CLS (spotlight / dock) |
| --- | ---: | ---: | ---: |
| chromium | 18,167 | 25,718 | 0.00000 / 0.00000 |
| webkit | 18,167 | 25,718 | 0.00000 / 0.00000 |

Each final cold measurement uses a separate fresh browser context/cache. These local uncompressed observations are not field-performance predictions or a feature-equivalent vendor benchmark. Pointer geometry remains cached across repeated moves, invalidates on scroll/resize and has no idle component loop. Two owned silent recordings (6 s / 60 frames and 8 s / 80 frames) were ffprobe-validated and retain native playback. Videos are excluded from cold transfer until requested. Private source screenshots and raw tool evidence are not published. Physical-device, screen-reader-user and product-owner acceptance remain open.
