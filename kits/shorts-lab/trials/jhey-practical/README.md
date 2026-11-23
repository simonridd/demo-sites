# Issue 96 · practical pattern trials

**Review-only branch. Not approved, published or installed in an application.** [Issue 96](https://github.com/simonridd/demo-sites/issues/96) requires component-owner acceptance before publication or shared-standard adoption. The already approved scroll-object correction is a separate release.

Serve the repository with `python tools/serve-motion-preview.py --port 56829`, then visit `/kits/shorts-lab/trials/jhey-practical/`. There are three trials, zero new Atlas IDs and no new runtime packages. No customer, Co-op, Relay, Demo Studio or presentation route is changed.

## Working components

1. **Content-sized composer.** A labelled native textarea, min 88 / max 224 px, up to 2,000 characters, genuine internal scrolling and a separate action. `mountComposer(root,{engine:'auto'})` prefers supported native `field-sizing:content`; `setEngine('fallback')` compares event-based measured sizing and `'static'` retains a fixed native control. Fallback runs on input and changed width, without a frame loop or focus replacement. `destroy()` aborts listeners, disconnects measurement and restores native sizing. The preview action sends/stores nothing. Without JavaScript the field is resizable, complete and usable; script-only comparison/save controls are disabled and the stale character counter is hidden.
2. **Hover-intent navigation.** `mountIntentMenu(root,{openDelay:260,closeDelay:420,safetyDelay:500})` enhances native disclosures and ordinary links for fine mouse pointers. Fast passes do not open a topic. A bounded triangular corridor gives diagonal movement towards the current panel more grace, and entering that panel cancels a pending row change. Keyboard focus prevents hover from removing focused content. Click, touch and Enter work immediately; Escape closes and returns focus. There is no ARIA application-menu role or focus trap. Narrow and no-script layouts use inline details; all links have real local destinations. `destroy()` cancels both timers and aborts listeners, restoring inline layout.
3. **Native disclosure.** Semantic details/summary works without JavaScript. A deliberately unchecked comparison enables a short 240 ms height transition only when both `interpolate-size` and `::details-content` are supported. Unsupported engines stay native and instant, rather than clipping or measuring essential text. Initial/changed reduced motion and the global motion-off class remove transitions; print expands the content. Shared styles remain untouched.

Use the host renderer's own content/IDs and mount only the relevant helper. Mount once and destroy before removing a scene. These native contracts are trial APIs, not a promoted cross-product standard. An existing application owner must verify its current workflow and approve adoption. The independent CSS is scoped under `.jp` on this dedicated route; do not import its page/body rules into another app.

## Source comparison and credit

Concepts are credited to **Jhey Tompkins**. No prototype source code, artwork, photos, UI copy or dependencies are copied.

| Actual source page | Observed comparison | Our bounded change |
| --- | --- | --- |
| [Content-sized field](https://www.jhey.dev/prototypes/2026/field-sizing/index.html) | Opened in Chromium, filled the actual textarea; height changed from 88 to 256 px. Source also exposes a mechanism selector. | Owned presenter-note content, a 224 px cap, explicit native/fallback/static comparisons; no source backdrop, audio or send integration. |
| [Hover intention](https://www.jhey.dev/prototypes/2025/hover-intention/index.html) | Opened and hovered the actual intention button; source explains a short delay to avoid activation while passing. | Native navigation disclosures with dwell, keyboard/focus protection and touch/click alternatives. |
| [Safety triangles](https://www.jhey.dev/prototypes/2025/safety-triangles/index.html) | Primary-source page exposes nested option groups; used as a conceptual reference. | Independent bounded geometric corridor and cancelled timer when the destination panel is reached; acceptance verifies our diagonal path. This is not a source-code reproduction. |
| [Native disclosures](https://www.jhey.dev/prototypes/2025/apple-disclosures/index.html) / [morph disclosures](https://www.jhey.dev/prototypes/2025/morph-disclosures/index.html) | Opened the former in Chromium; found five real details and toggled the first. Both primary pages describe native details-based progressive enhancement. | Complete text-first FAQ, instant baseline and optional supported height animation; no phone imagery or morph graphics. |

Technical references: [field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing), [details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content), [interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size). Feature detection and rendered checks determine this trial's behavior; a 2026 support label does not qualify an older device.

## Acceptance and remaining candidates

Run `python tools/verify-jhey-trials.py --url http://127.0.0.1:56829 --output /absolute/evidence`. The checks cover growing/shrinking/capped text, forced fallback, rapid pointer passes, intentional dwell, diagonal protection, keyboard focus, real destinations, touch, no-script, narrow/enlarged layouts, reduced motion, native disclosure and cancelled teardown work. Inspect screenshots and the actual transitions before accepting. WebKit on this Mac uses **Option+Tab** to include ordinary links in sequential focus; tests preserve the native platform behavior. Firefox still cannot launch the installed profile and physical device/virtual keyboard qualification remains open.

The other #96 candidates remain research: responsive drawer/sidebar needs an actual owner workflow; progressive blur needs a specific hero benefit and low-power qualification; matrix highlighting explicitly needs headed visual inspection; section colour crossfade is stage-only. Existing progress, marquee, border/glass, counters, skeletons, toggles and reveals remain mapped to their current studies. The issue remains open for owner review; no duplicate tickets are created.


Current acceptance: **90 browser assertions** pass in Chromium 159 and WebKit 27.2; **92 repository tests** and **2 skills / 9 capability mappings** pass. Actual source pages and our desktop/narrow states were visually inspected. Source screenshots stay in private authoring evidence, not the public site. Remaining physical-device/Firefox and owner-review gates above are unchanged.
