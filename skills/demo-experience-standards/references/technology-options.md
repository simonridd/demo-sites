# Technology candidates for demo experiences

Reviewed 21 November 2026. These are proposed experiments, not portfolio
dependencies. Prefer one bounded prototype with a clear task and measurable
loading, interaction and authoring outcomes before adopting a tool broadly.

## Reference website

`https://typereach-fratelli.netlify.app/` was rechecked in Chrome on 21 November.
It still displays Netlify's usage-limit pause notice. Its design, animation,
implementation stack and performance could not be inspected. Do not attribute
effects or technologies to it from this unavailable page.

## Recommended order

| Priority | Candidate | Useful experiment | Adoption considerations |
| --- | --- | --- | --- |
| 1 | GSAP | A customer-message to assistant, knowledge and adviser explanation, with short connection traces and guided emphasis | Keep existing presentation navigation and static/print explanations; compare against native SVG/browser animation before adding a dependency. Never tie readiness to an animation finishing. |
| 2 | Rive | A reusable illustration responding to actual preparing, ready, blocked and idle application states | Requires an authored Rive asset and a JS/WASM runtime. Keep semantic HTML status and actions authoritative, provide a static fallback and stop unnecessary rendering. |
| 3 | Remotion | Branded opening/closing sequences, animated captions and short explainers rendered to video | Use as an asset/export layer for the existing presentation/capture owners. Review company/automation licensing and render infrastructure before commercial rollout. It does not make an authored clip evidence of a live result. |
| Selectively | Spline | A product or service object visitors can meaningfully explore | Evaluate touch/keyboard alternatives, runtime cost and export plan. Fully self-contained project export has a distinct plan requirement. Use a Blender render when interaction adds little. |

Sources checked:

- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): scroll-linked timelines, callbacks and viewport-triggered playback. For a slide, use an explicit presenter event rather than forcing a scrolling interaction.
- [Rive Web runtime](https://rive.app/docs/runtimes/web/web-js): JavaScript/WASM integration, renderer choices and state-machine playback.
- [Rive data binding](https://community.rive.app/c/announcements/data-binding-is-now-live-for-all-users): state/data connections between a runtime and authored view models.
- [Remotion rendering](https://www.remotion.dev/docs/render) and [licensing](https://www.remotion.dev/docs/license/pricing): programmatic video production with a separate commercial licensing decision.
- [Spline code export](https://docs.spline.design/exporting-your-scene/web/exporting-as-code) and [self-hosted project export](https://docs.spline.design/exporting-your-scene/web/exporting-as-self-hosted-project): available integration formats and differing export contracts.

## Current component example

The first GSAP prototype is now `co-op-journey/`: a separate authored explanation
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
