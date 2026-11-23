# Reusable Motion Atlas effects

Eleven native effects plus an optional media-hotspot adapter, with no runtime packages, CDN requests, microphone capture or automatic integration into another product. [Working examples](./index.html), [registry](./registry.json), [media hotspots](./hotspots.html) and [static comparison](./static-comparison.html).

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

Study **23**, issue **78**. `variant`: sprite / pixel (preserves the original text bounce); `art`: smooth / pixel; `size`, `duration`, `mode`. Original sheet: eight 64 × 64 cells in a **512 × 64 SVG**, stepped with `steps(8,end)`. One-shot playback settles on cell seven; a loop returns to cell zero. The sheet is small vector artwork with no image decoder package.

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
