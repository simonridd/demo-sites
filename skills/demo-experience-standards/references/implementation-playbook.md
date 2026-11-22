# Implementing the core experience stack

Working approach agreed on 22 November 2026: deepen CSS motion, selected 21st.dev patterns, GSAP, Blender and Three.js, building on the approved Co-op results. New animation products remain optional research. This is a set of reusable implementation recipes, not an installed cross-application runtime.

## Choose by the job

| Need | First choice | Implementation approach |
| --- | --- | --- |
| Clear hover, selection, disclosure, drawer and step feedback | Native HTML, CSS/SVG motion and small JavaScript controllers | Keep semantic controls and complete content first; animate the change in state. |
| A better component or layout starting point | Reviewed 21st.dev pattern | Review source, licence and dependencies; adapt to the client and existing framework, or implement natively. |
| Several elements must move together through an explanation | GSAP | Use one scoped timeline driven by the existing user/presenter event. Cancel and clean up on interruption. |
| Distinctive visual depth without visitor manipulation | Blender | Author the subject, camera and lighting offline; ship an optimised still and a resilient fallback. |
| A visitor benefits from inspecting or configuring an object | Three.js plus an approved model | Show a poster first; load a bounded interactive scene on demand, with HTML alternatives. |

Do not make every page load the whole stack. A simple customer support page can be complete with native UI and one Blender render. A presentation can benefit from a coordinated SVG explanation. An interactive product viewer can justify Three.js separately.

## Native interaction recipe

Use semantic HTML for the real state and action: buttons, links, radio groups, details and native dialogs where appropriate. Start with the usable static composition, then enhance it. Apply short opacity/transform transitions to make selection, entry and hierarchy clear. Animate in response to actual state; do not wait for an animation to enable an otherwise ready action.

Co-op's source recipes are `co-op/help-guide.js`, `help-guide.css`, `order-support.js`, `order-support.css`, `motion.js` and `motion.css`. They cover guided help, a receipt → item → issue → guidance flow, natural artwork entry and static fallbacks. Preserve keyboard navigation, focus return, earlier choices, no-script content and dynamic reduced-motion behavior when adapting them. Scope selectors, events and IDs to the new component so copies can coexist. These are example sources, not a general-purpose mounted component API yet.

Useful starting motion values are the existing Co-op 180–280 ms interface transitions and ease-out curve; tune to the interaction rather than enforcing a single duration everywhere. Decorative entrances finish promptly with no replay/watch-again control. Purposeful media and task navigation retain their own controls. Keep focused content in view, including enlarged-text layouts; a sticky preview/header must not cover the next control.

## Curated 21st.dev recipe

Search when a new interaction or composition would improve the brief. Choose a pattern for its information hierarchy and behavior. Rework its typography, spacing, corner geometry, icons, copy and motion to fit the client. A visually impressive reference is not a reason to add its whole dependency stack.

For a buildless demo site, prefer a native adaptation when the interaction is small. For an application already using React and the component's dependencies, reuse can be more direct after review. Preserve attribution and actual licence notices. Record origin, reviewed source, dependencies retained/removed and accessibility behavior in operator notes. If no reviewable example fits, proceed with an appropriate custom solution. The inspected Arc animated-tabs reference and Co-op's native port are the first example.

## GSAP recipe

Reach for GSAP when sequencing or synchronizing several visual changes earns the library. Keep the existing DOM, native navigation and final composition independent from it. Keep one active timeline per interaction, cancel obsolete motion on rapid input and resolve into the latest selected state. Scope work to the component and provide cleanup on removal or route/slide changes; `gsap.context()` is a documented way to collect and revert animation work.

The existing pinned core is `assets/vendor/gsap/gsap.min.js`, with source/licence metadata. The original file is 73,357 bytes before transfer compression; measure the actual route cost separately. The reviewed standard licence is not MIT and does not automatically cover every animation-authoring product. Keep the dependency local to the pages that need it.

`kits/connected-support/` supplies connector traces, stage emphasis and static/print content. Its architecture narrative belongs in presenter-led material. Reuse the technique with relevant customer content only when that customer actually benefits from the explanation. Presentations should drive it through their existing navigation/renderer owner, not a second competing player or patched generated HTML.

## Blender asset recipe

Use Blender to establish an original visual subject, depth, material and lighting that fit the brand. Keep an editable scene/recipe and repeatable render settings. Ship an optimised WebP or another measured suitable image format at the required display size; reserve its dimensions so loading does not move the layout. Keep source tooling and intermediate renders separate from public audience assets.

The Co-op example ships a 960×960 transparent WebP of 37,680 bytes. Its original SVG remains available when JavaScript or image loading fails. This is evidence that a custom 3D appearance can be delivered as a small image; it is not evidence that every client needs grocery artwork or a live 3D engine. The reproduction source is `tools/artwork/co-op-groceries.py` with its pinned offline dependencies.

## Three.js recipe

Use live 3D for a defined task such as rotating an object to inspect a feature, switching a real configuration, or explaining a spatial relationship. Keep labels, specifications, selections and primary actions in ordinary HTML. A Blender-rendered poster is a useful initial view and fallback.

Load the pinned engine, model and textures only on the route and interaction that need them. A normal “Explore in 3D” action is a task control, not decorative replay. Export an appropriate glTF/GLB model, inspect its actual extension requirements and include only the required decoders. GLTFLoader documents Draco, Meshopt and KTX2 integration; compression decisions need measurements of total transfer and decode cost.

Size the canvas to its container, update the camera aspect on resize and bound the drawing-buffer pixel count. Prefer rendering on changes for a static object viewer; if damping or a purposeful animation needs successive frames, request only the frames needed. Stop work when the scene is hidden or backgrounded. Keep page scrolling usable, supply keyboard-accessible controls, honor reduced motion and preserve a poster if the graphics context cannot be created or is lost. Dispose owned geometry, materials, textures, controls and renderer resources when the scene is removed. A small .glb file alone does not establish a cheap GPU/memory footprint.

No Three.js scene has been qualified in the current kit. The first prototype should exercise this complete asset/loading/interaction/fallback lifecycle on a bounded object, then be adopted for a client task that benefits from it.

## Apply across outputs

| Surface | Apply the recipes through |
| --- | --- |
| Customer websites | The client's customer task, existing native page/component structure and `build-demo-site` owner. |
| Presentations | Existing storyboard/layout/motion controls and the presentation renderer. Use Blender assets and coordinated SVG explanation where they help the audience. |
| Voice Demo Builder | Existing application status and verified readiness gates. Use native state feedback first; motion never creates progress, success or call availability. |

For each new brief, record the audience/task, selected treatment and benefit, added runtime/assets, static alternative, source/licence and owner integration point. Compare desktop/narrow/enlarged text, keyboard, initial/changed reduced motion and failure behavior on the changed component. Measure cold-load transfer and interaction/render cost when adding a library or 3D scene. Record what is observed separately from intended gains; do not claim conversion, performance or live delivery improvements from appearance alone.

## Implementation order

1. Carry the Co-op interaction and Blender recipes into the next demo brief and the next presentation through their existing owners.
2. Curate a small set of approved component patterns as they prove useful: guided help, order/task drawer, natural artwork entry and presenter-led connection traces. Keep client copy/art distinct from reusable behavior.
3. Add one on-demand Three.js viewer when a scoped object/task and suitable model are available. Compare it against the poster-only version before broader use.

Primary references checked 22 November 2026: [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/), [GSAP standard licence](https://gsap.com/community/standard-license/), [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html), [responsive design](https://threejs.org/manual/pages/responsive.html), and [resource cleanup](https://threejs.org/manual/pages/cleanup.html).
