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

## Fresh presentation art direction

A blank-canvas brief starts with the audience’s situation, the dramatic idea and a distinct art direction. Give each presentation a reason for its typography, image-making, scale, negative space and pacing. Keep the existing renderer/navigation/private-output owner. A previous deck’s layouts are optional working material; choose composition for the new story.

For the Co-op five-technology trial, the technology allocation is explicit and bounded: original Blender still on the opening, CSS type reveal for the human stakes, a native adaptation of a reviewed 21st.dev comparison slider, GSAP for the request handoff and Three.js for inspecting three service views. Other scenes stay still. This is a creative constraint for one trial, not a checklist for future presentations. Retain the private allocation/source record and verify the actual renderer/controller for each claim.

Three.js’s official SVGRenderer can preserve a real interactive 3D diagram when WebGL is unavailable. It has no textures, shadows or advanced shading, so use a simpler authored material/geometry treatment. Keep the static/HTML alternative and distinguish SVG-renderer evidence from WebGL acceptance. Verify projected geometry changes, keyboard controls, stable idle frame count, offscreen cleanup and the final composition, rather than accepting a loaded library as a working feature.

## Covers and character imagery

Use a quiet client | IPI lockup as part of the cover’s composition. Embed the retained SVG marks, preserve proportions and inspect optical size and contrast on the actual background. Avoid redrawing logos with generation tools. The presentation owner’s `brandLockup` helper and default visual cover header carry this convention into new decks.

Build a short character arc when it improves the explanation: customer + immediate goal, friction, receiving colleague, then a useful next step for both people. Commission portraits as a matching set with a specific lighting, palette, crop and realism brief. Compose silhouettes, scale and negative space with the existing deck typography. Introduce people when relevant instead of adding a generic cast page. Static imagery is enough unless movement explains something. Canonical story text retains names, roles and context; private source retains prompts and generation mode. Do not reuse client characters as a portfolio default or imply real testimony.

## Agent friction to useful help

For customer-service presentations, introduce the agent alongside the customer story. Give the agent an immediate aim, then show the work that makes it harder. Use a later concise visual sequence to connect each friction to the relevant supported capability: searching → relevant knowledge; remembering checks → configured checklist; writing → draft summary. Show the person reviewing or choosing, rather than treating an AI suggestion as an approved action. This is a causal story, not a required feature catalogue. Verify product capabilities from primary sources and keep customer configuration and authored-example status private. Leave the images, typography and pacing consistent with the rest of that client’s deck.

## Finish the human story

Use concrete people, objects and actions in the audience presentation. Instead of “relevant context”, show Sam with Maya’s order and message. Resolve the customer’s request explicitly, then make the record and closing agree with that outcome. Put the notes after the action, rather than summarising an unresolved request. A self-contained read-through catches AI-like filler and missing endings more reliably than a blanket banned-word list. Keep implementation/governance detail private unless a material audience condition needs explaining.

Keep a natural customer portrait when it is enough; avoid forced emotion or celebratory posing. Put the agent in a believable work setting with appropriate employer branding and equipment. Preserve identity and art direction when editing an existing portrait. Retain exact prompts, generated-setting status and any authored resolution assumptions privately, and do not imply an actual employee/office photograph or observed transaction.

## Connect features and performance to the story

Select the features that answer the agent's established frustrations. In one concise map or a short sequence, show feature → agent action → customer benefit. Follow with concrete scenes: the guidance while the customer is there, the action, then reviewed notes. Use a semantic table or similarly readable structure when that makes the comparison clearer; preserve the same relationships in canonical reading content. Avoid an exhaustive feature catalogue or automatic-action claims.

For a performance slide, first check an available primary customer/vendor case. Record the metric definition, unit, qualifier/range, customer scope, contributing changes and direct source link. Put the material context beside the number. Preserve “up to” and reported ranges; do not sum call-time and after-call-work results or convert them into unmeasured local ROI/headcount. Exclude unrelated platform gains. Keep review details and uncertainty private while retaining audience context needed to understand the actual claim. A quiet static metric treatment preserves readability and print. Verify desktop, mobile reading, source links and the story's order separately from the numerical evidence.

## Optional metric count-up

When a headline figure benefits from emphasis, keep a short count-up within the existing presentation scene owner. Retain the exact final value and stable accessible alternative in markup, hide changing digits from assistive technology and reserve the final width. Preserve range endpoints, units and qualifications. Play once on first stage visibility, settle on every interruption, and keep reading, print, reduced motion and no-JavaScript static. Use the presentation owner's native helper rather than introducing a library or independent player. Co-op's 850 ms two-metric treatment is the first requested example; a static number remains the default.
