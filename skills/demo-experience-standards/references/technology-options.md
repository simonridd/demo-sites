# Technology candidates for demo experiences

Reviewed 21 November 2026. These are proposed experiments, not portfolio
dependencies. Prefer one bounded prototype with a clear task and measurable
loading, interaction and authoring outcomes before adopting a tool broadly.

## Reference website

`https://typereach-fratelli.netlify.app/` was rechecked in Chrome on 21 November.
It still displays Netlify's usage-limit pause notice. Its design, animation,
implementation stack and performance could not be inspected. Do not attribute
effects or technologies to it from this unavailable page.

## Current implementation focus

Simon refocused the work on 22 November on CSS motion, curated 21st.dev patterns, GSAP, Blender and Three.js, following the approved Co-op results. Use the [implementation playbook](implementation-playbook.md) for the active approach. Rive and Remotion remain reserved research, not the next required integrations.

| Tool | Current role |
| --- | --- |
| Native CSS/SVG and JavaScript | Default for task feedback, small entrances and accessible components. |
| 21st.dev | Optional source of reviewed patterns, adapted to the existing brand and stack. |
| GSAP | Selective coordinated motion for a clear explanation or interaction. |
| Blender | Original optimised image assets and, when useful, model authoring. |
| Three.js | A bounded on-demand 3D interaction when the task benefits from manipulating an object. |
| Rive / Remotion | Reserved trials; no production runtime or paid pipeline adopted. |

Sources checked:

- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): scroll-linked timelines, callbacks and viewport-triggered playback. For a slide, use an explicit presenter event rather than forcing a scrolling interaction.
- [Rive Web runtime](https://rive.app/docs/runtimes/web/web-js): JavaScript/WASM integration, renderer choices and state-machine playback.
- [Rive data binding](https://community.rive.app/c/announcements/data-binding-is-now-live-for-all-users): state/data connections between a runtime and authored view models.
- [Remotion rendering](https://www.remotion.dev/docs/render) and [licensing](https://www.remotion.dev/docs/license/pricing): programmatic video production with a separate commercial licensing decision.
- [Spline code export](https://docs.spline.design/exporting-your-scene/web/exporting-as-code) and [self-hosted project export](https://docs.spline.design/exporting-your-scene/web/exporting-as-self-hosted-project): available integration formats and differing export contracts.

## Current component example

The first GSAP prototype is now `kits/connected-support/`: a reserved authored explanation
with user-selected stages and coordinated connector/panel emphasis. The core
library is pinned and self-hosted, with functional navigation when it is absent.
It is a website/reuse experiment, not an installed presentation integration or
evidence of live support behavior. Its operator notes carry the exact dependency
identity and verification limits.

Co-op's guided help panel is informed by Arc's animated-tabs pattern on
[21st.dev](https://docs.21st.dev/@kuratlielia/components/tabs). The source and MIT
licence were inspected. The original uses React/Radix/Motion; Co-op uses a new
native implementation to fit its existing buildless site. Its source review and
keyboard/fallback contract are retained in `tools/components/co-op-help-guide.md`
in the demo-sites repository. This validates an integration approach, not an
engagement or conversion improvement.

On 22 November, Simon approved the component but rejected this particular explanation for customer-facing website use. It is now reserved in the kit bag and removed from customer-demo discovery. Reuse the motion pattern for the audience’s task; the architecture narrative belongs with presenter material.


## Rive source checkpoint, 22 November 2026

The original `tools/artwork/build-status/scene.rml` compiles with official Rive CLI 1.10.0 and renders the three intended symbols. It uses current view-model conditions, not deprecated state-machine inputs. Rive's first-sibling draw order is opposite to SVG; compiler success did not reveal an initially hidden glyph, which visual captures caught and corrected.

The playable export requires Rive account sign-in. Simon subsequently asked to reserve this bounded trial because of cost and move on. The kit at `kits/build-status/` labels its HTML/SVG state preview as static; no export or production integration is queued. No `.riv` or runtime adoption is claimed. The candidate Canvas Lite 2.54.0 package has roughly 571 kB of JavaScript and 905 kB of primary WASM before compression, independently of the 1.7 kB compiled source reported locally. Measure actual browser delivery and rendering before using that cost for simple status symbols. Source and runtime licences/export terms are separate checks. A fallback or a successful local render is not a deployed Voice Demo Builder upgrade.


## Remotion evaluation checkpoint, 22 November 2026

An unfinished private title-sequence study remains in the local `remotion-trial/` workspace, outside public customer sites. Its Studio composition opened, but CLI still/video rendering timed out while resolving the root composition. No successful MP4, rendering pipeline or production integration is claimed. The user redirected the work to the core stack; the Studio process was stopped and the unfinished source was retained.

The [published licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) includes evaluation before commercial use in free eligibility. [Company pricing](https://www.remotion.dev/docs/license/pricing) distinguishes creator seats and automation, and needs a fresh intended-use review before any adoption. No subscription or paid render service was purchased. This research is reserved rather than an active implementation prerequisite.
