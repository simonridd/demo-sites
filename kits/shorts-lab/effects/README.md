# Reusable Motion Atlas effects

Twenty-three native study families plus an optional media-hotspot adapter, with no runtime packages, CDN requests, microphone capture or automatic integration into another product. [Working examples](./index.html), [registry](./registry.json), [media hotspots](./hotspots.html) and [static comparison](./static-comparison.html).

Export a self-contained copy with `python tools/package-motion-effects.py --output /absolute/motion-atlas-effects.zip`. The export includes our sample video; in a source-only copy of the optional hotspot example, supply your own approved video URL (the repository example references the sibling study 81 MP4).

Copy this **complete directory**, including assets and `DICE-LICENSE.txt`, to the target project's owned assets. Keep its original navigation, data, audio, readiness and publishing owners. Import only the controller(s) required. `atlas.mjs` does not mount anything on import. Example generation is optional authoring code; a product can author the same semantic markup in its existing renderer so complete content exists without JavaScript.

```html
<link rel="stylesheet" href="/assets/motion/atlas.css">
<!-- Render one selected study's markup here, or author its semantic equivalent. -->
```

```js
import {renderStudy} from '/assets/motion/studies.mjs';
import {mountEffect} from '/assets/motion/atlas.mjs';

// Optional playground composition; IDs are sanitized and SVG IDs are unique per mount.
container.innerHTML = renderStudy('pattern', 'chapter', {
  assetBase: '/assets/motion/assets/'
});
const motion = mountEffect(container.firstElementChild, {
  pattern: 'graph', mode: 'once', duration: 6, tile: 32, intensity: 'product'
});
// Existing presenter or interaction owner decides when an enhancement is helpful.
motion.play();
// On slide leave, route removal or component unmount:
motion.destroy();
```

Serve over HTTP. Keep URLs appropriate to the deployment prefix; the included examples use relative paths and work under GitHub Pages' `/demo-sites/` prefix. `renderStudy` accepts **trusted author configuration**, not untrusted HTML or arbitrary external asset destinations. Use real semantic content in the host, rather than injecting inaccessible decorative copies.

## Common contract

`mountEffect(root, options)` returns `{root, play, pause, stop, update, setState, setComparison, setLoading, destroy}`. `mountEffects(scope)` mounts each `[data-atlas]` descendant and returns `{controllers, destroy}`. Mount each root once. Destroy before replacing its DOM, and remount fresh markup after removal. Calls after teardown should be avoided.

- `update(name, value)` applies bounded numeric configuration or a documented preset. Size, duration, colour presets, geometry and data stay local to the component. CSS variables are documented below for deliberate visual adaptation.
- `play()` restarts a one-pass animation; after Pause it resumes. `pause()` toggles suspension; `stop()` settles on the static state. Functional comparison, loading and optical controls have their own actions instead of decorative playback controls.
- No effect starts moving on mount. A state change to an active orb or pulse is a deliberate owner input. Offscreen and hidden documents suspend CSS animation; there is no per-frame JavaScript scroll/animation loop. Resize/font completion only remeasures marquee tiling when necessary.
- CSS and the controller both respect initial and changed reduced-motion preferences. Print and forced-colour fallbacks preserve content. Turning motion off does not disable task controls or turn pending work into success.
- `destroy()` aborts owned event listeners, disconnects observers, clears delayed demo loading and settles motion. Pass any real request cancellation to its existing owner separately.
- Keep `aria-hidden` on decorative layers, stable real text outside them, visible keyboard focus and native controls. The animated examples are explicitly simulated. To supply real activity: `motion.setState('listening', {label:'Listening', simulated:false})`; this must follow the real voice bridge, not an animation timer. `update('level', actualRms)` bounds a supplied level to 0–1; no microphone is requested.
- For production loading, use `setLoading('pending')`, then `setLoading('loaded', actualText)`, `setLoading('empty', message)` or `setLoading('error', message)` from the real request owner. The example's Load/Retry buttons are an explicitly simulated 800 ms flow; do not retain synthetic delay in a real product. No HTML is accepted as loading text.

## Pattern

Study **34**, issue **71**. `pattern`: checker / graph / diamond / dots; `mode`: once / loop / static; `duration`: seconds; `tile`: 16–64 px; `direction`: normal / reverse; `intensity`: stage / product. CSS: `--ma-tile`, `--ma-duration`.

The oversized tiled layer moves exactly one tile diagonally and repeats without changing geometry. Its foreground is independent and pointer events pass through the decoration. Use as a chapter or creative hero frame; use quiet/static treatment behind application content. Avoid high-frequency patterns, thin text over patterns and blanket site backgrounds.

## Voice-orb

Study **32**, issue **72**. `state`: idle / listening / thinking / speaking; `size`, `duration`, `palette`: mint / violet, `level`: 0–1. Active states run opposing transform rotations; idle is still. Small gradients and a clipped SVG lens provide depth **without blur**. The lens displaces an original bounded scene, not arbitrary DOM pixels. This follows the user's later “bend, not blur” correction while retaining the two-layer motion idea.

Use for a real voice surface or a clearly labelled stage simulation. Palette and motion do not establish microphone access, AVA activity or a connection. Keep all call controls in the real owner.

## Refraction

Study **60**, issue **73**. `optics`: bend / plain / frost; `distortion`: 0–70. The exact original SVG scene is referenced twice; the lens copy is clipped and passed through `feTurbulence → feDisplacementMap`. Foreground text sits outside the filter. Inspect actual displaced contours against plain and frosted variants.

This is portable **authored-scene refraction**, not a universal liquid-glass component for arbitrary HTML behind a pane. Native `backdrop-filter: url(...)` with real arbitrary backdrop capture remains deferred; a parsed declaration is insufficient evidence. Use bounded optical illustration for stage/hero artwork. Keep task text and controls sharp.

## Marquee

Study **27**, issue **74**. `mode`: once / loop / static; `direction`: normal / reverse; `duration` in seconds; `gap`: px; `use`: title / projects / announcement. A ResizeObserver fills two equal visual tiles to at least the visible width. Translation is exactly one tile; font completion remeasures. Hover/focus **on the visual strip** pauses it; outside playback controls remain useful.

Only nonessential text moves. Keep one accessible static label, hide cloned visual text and leave meaningful links/actions outside the track. Duration determines the time to travel one measured tile, so adjust for content length.

## Pulse

Study **26**, issue **75**. `state`: idle / active / busy / offline; `mode`, `duration` (default 1.8 s), `halo`: radius in px. The 10 px dot stays fixed while a pseudo-element scales and fades; use the adjacent text for meaning. One attention pulse or continuous active state is optional. Never invent live recording, readiness or urgency.

## Reveal

Study **25**, issue **76**. `scrollMode`: once / entry / exit / static; `travel`: 28 px everyday or 100 px stage. The once-only observer/650 ms ease-out recipe is adapted from `co-op/motion.js`; scroll modes use CSS view timelines with explicit entry and exit keyframes. Unsupported timelines leave the subject visible. No fallback scroll listener runs per frame. Static content remains in normal flow, including fragments and focus.

Use to explain selected editorial objects, not every form control or content block. Drive presentation lifecycle through the existing renderer. Browser support is capability-detected; test the actual target engine rather than assuming support from the browser name.

## Shimmer

Study **24**, issue **77**. `shape`: card / rows / message; `treatment`: shimmer / static / progress; simulated `outcome`: loaded / empty / error. Geometry is reserved across all outcomes. Only pending sets `aria-busy` and animates; one status region reports changes. Cancel and Retry invalidate prior demo completion. Use real `setLoading` calls in integrations, and content immediately when available.

## Pixel

Study **23**, issue **78**. `variant`: sprite / pixel (preserves the original text bounce); `art`: smooth / pixel; `size`, `duration`, `mode`. Original sheet: eight 64 × 64 cells in a **512 × 64 SVG**, stepped with `steps(8,end)`. One-shot playback settles on cell seven; a loop returns to cell zero. The sheet is small vector artwork with no image decoder package. Its image URL is declared directly in the element’s inline background style, so it resolves against the host document in both gallery and portable paths; do not move that relative URL into a custom property consumed from another stylesheet.

Keep a representative still under reduced motion. Use for a justified chapter cue or authored gesture, not arbitrary mascots or implied speech/listening. A pixel-rendering option does not change the original illustration's licence or provenance.

## Stagger

Study **22**, issue **79**; cross-reference unchanged wave study **70**. `variant`: list / wave; `index`: native / fallback / static; `count`: 3–12; `delay`: 50–150 ms; `duration`, `direction`, `amplitude` .1–1. A homogeneous list uses native `sibling-index()` when supported, with variables and a child-list observer for additions/reorder. First entrance starts immediately. Reverse lists use the variable path. Thirty-six coloured bars illustrate a travelling phase wave, independent from DOM or reading order.

The wave is decorative, not measured audio. Keep real data and controls available. Scope repeated motion to one relevant stage or voice demonstration.

## Comparison

New study **81**, issue **80**. Reuses the native range/percentage-clipping/divider recipe from Co-op's `co-op-everyday` presentation, adapted from Dice UI Compare Slider (MIT notice included). No React/Radix/Tailwind or borrowed example images are shipped. `compare`: images / dom; `setComparison(0…100)` or `update('position', n)`; Before/After/Reset shortcuts and static side-by-side mode.

Use two owned, co-registered images of the same aspect/crop, width and height; retain their actual alt text and visible captions. DOM copies have identical layout geometry, are inert/hidden from assistive technology, and have one real description. Preserve the white 2 px divider and small handle. Keyboard arrows/Home/End/PageUp/PageDown and pointer/touch work; page scroll remains available elsewhere. Physical before/after orientation is deliberately left-to-right, including in an RTL host.

Without enhancement the authored comparison markup shows both images side by side. The playground itself is generated with JavaScript; [static-comparison.html](./static-comparison.html) separately verifies the no-script presentation. A product should render its fallback markup in its own server/static renderer. No automatic slider sweeping.

## Aurora-text

New study **82**, 23 November review. `mode`, `duration`, `palette`, Glow toggle (`data-glow`). One accessible heading, gradient clipped into glyphs and an optional explicitly hidden duplicate behind it. Readable static colour if text clipping is unsupported; solid forced-colour/print text. The glow is optional blur and is distinct from the optical **refraction** technique.

Use short hero/project/chapter names on a sufficiently dark local panel. Avoid body text, form labels, navigation and buttons. Do not require movement to read a word.

## Media-hotspots

Applied extension to research studies **35 / 37**, issue **70**, without duplicating their IDs. [Native prototype](./hotspots.html) uses our still and the recorded study 81 video. `mountHotspots(root, {items, allowedTargets})`, from `hotspots.mjs`, accepts labelled percentage coordinates, start/end seconds and explicitly allowed local fragment destinations. It returns `destroy()`. Video time/seek events own visibility; static link lists remain available. Focused hotspots stay stable when a time window ends; following a hotspot pauses video.

This demonstrates accessible still/video context links, not purchases or an account-connected ImageKit implementation. ImageKit's beta player/checkout, uploads, remote product destinations and private account integration remain deferred to their own scoped integration and licence/API review. No reason was found to put shopping hotspots on Co-op's support/receipt page.

## Evidence and limits

For native media seek tests, serve with `python tools/serve-motion-preview.py --port 8791` (loopback only, byte-range support). Run `node --test *.test.cjs quote/*.test.cjs`, `node tools/check-skill-parity.mjs`, and `python tools/verify-motion-effects.py --url http://127.0.0.1:PORT --output /absolute/evidence`. Python Playwright and its engines are authoring requirements, not site dependencies. Capture affected studies with `tools/capture-motion-atlas.py --ids 22 23 24 25 26 27 32 34 60 81 82 --force`; validate MP4s with ffprobe.

The reconciliation and exact acceptance results live in `../RECONCILIATION.md`. Playwright WebKit is useful engine evidence, not physical iPhone/Safari hardware qualification or measured battery/GPU performance. These original studies do not establish frame-for-frame fidelity to creator videos.

Primary technical references: [CSS sibling-index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index), [view timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/view), [SVG displacement](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap). Retained comparison source: [Dice UI pinned source](https://github.com/sadmann7/diceui/blob/08b00b9cb68848535cd81bd6c934903ebb3918ae/docs/registry/bases/radix/ui/compare-slider.tsx).

## Second intake: existing studies extended

The portable collection now has **23 study families**. These twelve additions extend existing IDs; the catalogue remains **82 studies**. The aurora issue (#82) maps to the already-created study 82, with additional glow radius/intensity and text-scale controls. The issue number and the study number happen to match here; they are otherwise separate identifiers.

The common controller methods for these families are `play`, `pause`, `stop`, `update` and `destroy`. State/loading adapters belong only to the relevant orb/pulse/skeleton families. Form/layout/delivery examples use functional controls rather than invented motion or system state. `practical.css`, `practical.mjs`, `practical-studies.mjs` and `image-fixtures.mjs` are local parts of this library, not external dependencies.

## Tv-intro

Study 21, issue 81. One-image reveal: `shape` horizontal / diagonal / reverse-diagonal / circle / diamond / fade; `duration`, `easing` ease-out / linear, `ratio` wide / tall, `focal` 10–90%. `variant` image / type preserves the original “Next chapter” typography. Reserve image geometry and retain its true alt text. An explicit Play/Reveal introduces the asset and leaves it visible; reduced motion, Stop, unsupported animation and print retain complete content. Use in an intentional image introduction, separately from the two-image comparison. No original television identity or footage is shipped.

## Count-up

Study 20, issue 83. `method` js / css / static and `target` large (0→24,800) / small (0→100) / descending (75→20) / negative (−20→50); configurable duration. The JS mode retains the existing ease-out, locale formatting, bounded frame loop, cancellation and exact final value. CSS registers `--ma-number` as an integer and renders a presentational counter. CSS integers do not replace locale/decimal formatting. The stable accessible label always contains the correct final number. Never infer verified metrics from a count animation; production values must come from their real source. A missing registered-property API falls back to static final text.

## Typewriter

Study 17, issue 84. `text` original / chapter / terminal / unicode; `cursor` bar / block / none; `duration`; once/static. The original full headline is preserved, actual font width is measured and `Intl.Segmenter` counts graphemes when available. The example intentionally uses monospace; an arbitrary proportional-font production variant needs its own per-glyph timing or a quiet reveal. If the heading would wrap, show the complete static text. Do not type long paragraphs, loop a blinking cursor or substitute this staged effect for real demos, live transcripts, streamed messages or word-synchronised output.

## Border

Study 18, issue 86. `variant` thin / bold / glow; `method` angle / rotate; `width` 1–6px, `radius` 8–40px, duration, once/loop/static, `trigger` manual / focus. The registered angle travels around a thin border; the rotating-layer option is a fallback comparison. Content and its keyboard ring stay sharp and independent from the clipped decorative ring. Use on a single justified spotlight, not every task card. Continuous previews pause and settle under reduced motion.

## Metaball

Study 19, issue 85. Five small white dots on a dark field, with the original two-green-dot alternative. `variant` five / two; `filter` goo / none; diameter, spacing, blur, contrast, travel, duration and playback. Blur/contrast creates small bridges as adjacent dots approach. Keep the filter on the small illustration; do not turn it into a full-screen lava lamp. Large blur relative to diameter can make isolated dots vanish; calibrate the supplied controls rather than copying a screenshot's number blindly. The label explicitly denies real loading; any production activity must be connected to the real owner.

## Progress

Study 15, issue 87. Preserve the known-value 45↔80% sample with `variant` value; `variant` scroll uses a real contained article and `method` native / fallback. Native CSS binds to the nearest scroller; fallback uses a passive scroll listener and one scheduled frame per event burst, with content/resize observation and teardown. No overflow gives zero position. [Document-scroll example](./reading.html) uses `scroll(root block)` and the same restrained fallback. Label it scroll position, never loading, comprehension or task completion. Under reduced motion the plain position indicator may still track the user's scrolling; the whole content remains readable.

## Focus-within

Study 14, issue 88. `variant` basic / search / fields / toolbar preserves the original email field and adds native groups. CSS `:focus-within` accents the group while each child keeps its own clear focus ring; no scale, translation or validation claim. Search Clear changes only the local sample. Portalled popovers are not DOM descendants; integrate their focus through the actual component owner rather than assuming containment. Preserve labels, validation and normal focus order.

## Palette

Study 11, issue 89. `brand`, `other` colour inputs; `space` srgb / oklch / oklab; `mix` percent; `surface` light / dark; `alpha` opaque / transparent. Component tokens derive surfaces, borders and badges from the approved base instead of arbitrary new hex values. A copyable CSS textarea shows the expressions; actual rendered pairs are composited into an sRGB canvas and checked using relative luminance. The 4.5:1 table is a normal-text check, not an automatic accessibility or brand approval. Failing pairs remain plainly labelled; adjust them before target use. Static precomputed fallback colours remain if colour-mix is unsupported. Keep approved brand assets/base colours unchanged.

## Layout-shift-2

Study 9, issue 90. Preserve media reservation with `variant` media; `variant` gutters compares auto / stable / stable both-edges native scroll containers. Long-content toggle, auto/hidden overflow, LTR/RTL and native/classic-width requests are local. The classic request styles actual native scrollbars where the engine supports it; it does not insert fake padding. Measurements show client width and consumed gutter, including zero on overlay-scrollbar platforms. WebKit 27.2 did not reserve stable space for the opt-in custom classic-width scrollbar before overflow; the measured limitation is displayed. Native overlay mode remains unchanged. Qualify the actual OS/native scrollbar policy before adopting this as a width-stability fix. Apply a gutter to the actual scroll owner, root or nested, only when it fixes a demonstrated layout shift. Do not hide scrollbars to create a cosmetic result.

## Mobile

Study 8, issue 91. `unit` vh / svh / dvh, `sizing` fixed / min, embedded portrait/landscape frame. [Full-size example](./viewport.html) reports innerHeight, visualViewport and the three actual probe heights. Reuse of Co-op's `height:100vh; height:100dvh` fallback and safe-area padding is explicit. Fixed app shells scroll their content; min-height allows a long document to grow. In an iframe or headless browser the units may all be equal. Real phone toolbar collapse, virtual keyboard, notch and home-indicator behavior still require device testing. Existing shared guidance already covers the underlying strategy; this experiment does not change customer drawers.

## Reduced-motion

Study 6, issue 93. Compare a complete arrival message, bounded ambient dot and scroll-linked object using `preference` normal (follow system) / reduce / paused. Local Normal never overrides a system reduction. A behavioral matrix now covers all library components and all 69 visual gallery rows, including CSS, typed properties, the JS counter, recorded media and functional controls. Preference changes pause recordings; the gallery's paired playback respects reduction, while deliberate native media controls remain available. Do not depend on near-zero durations or animationend events to expose essential final state.

## Formats

Study 47, issue 94. [Selective loading](./image-delivery.html) and [all-eager baseline](./image-delivery-eager.html) contain identical original fixtures and geometry. A discoverable, responsive picture/img is always eager; the selective example adds high priority only to its one hero and lazy-loads gallery images well below the initial viewport. Native picture/srcset chooses AVIF/WebP/JPEG and 600/1200 widths. Format sizes are measured; AVIF is larger than WebP for this fixture, so compare actual assets and quality rather than assume a winner.

Run `tools/verify-motion-delivery.py` for cold desktop/mobile, 1×/2× observations: actual requests/priority, transferred bytes, likely LCP element and CLS where the engine exposes them. Chromium uses a documented controlled network profile; WebKit's local observations are separate. These are lab fixtures, not measured gains for an unrelated site or field Core Web Vitals. Native no-script media remains available. Preload only when real discovery is delayed; do not pair lazy loading with a high-priority hero hint.

Technical references: [CSS typed properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property), [scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter), [LCP image discovery](https://developer.chrome.com/docs/performance/insights/lcp-discovery), [native img loading](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img). See `../RECONCILIATION-REVIEW-2.md` for exact acceptance and limits.
