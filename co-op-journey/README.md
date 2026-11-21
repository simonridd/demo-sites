# Connected support journey: operator and reuse notes

This authored explanation follows a missing-item question through customer,
assistant, knowledge and adviser stages. The order reference and receipt item
come from the existing Co-op page. Guidance reuses that page's missing-item
advice. The story describes a useful intended journey; its authored messages and
context are not a captured conversation, successful retrieval, refund or native
handover receipt. This page does not load Genesys or inspect live order status.

## Motion experiment

GSAP 3.15.1 core is pinned in `assets/vendor/gsap/`. Its npm tarball SHA-512 was
verified before extracting the library; `source.json` retains the source and
SHA-256. The original copyright and licence header remain in the file. HTML
pins its SHA-384 integrity. It uses the standard GSAP licence linked below,
not MIT. No package install hooks or remote runtime CDN calls are required.

One timeline sequences the SVG connector traces and selected panel entrance.
Each transition lasts less than a second. Rapid selection kills the old timeline
and settles the new state. Changes to reduced-motion preference and backgrounding
settle motion without changing the selected explanation. There is no timed
rotation, continuous loop or decorative replay control.

The core file is 73,357 bytes uncompressed. This dependency belongs only to the
companion page; Co-op's customer help page keeps its native implementation. The
navigation/controller still works if GSAP is unavailable. Without JavaScript,
ordinary anchors and all four authored panels remain. Print also includes all
panels. Tests cover these state boundaries, the actual sequencing API and asset
integrity; Chrome review covers the visible interaction separately.

## Presentation reuse

This is a standalone website route and a reference pattern, not a second slide
renderer. A later presentation change should use `presentation-authoring` and
the selected presentation's canonical source. Adapt the four story beats and
short connection/emphasis timeline within that owner, preserving its navigation,
guided moments, static/print output, audience/operator split and native context.
Do not infer that the installed presentation runtime includes this feature.

For Voice Demo Builder, visual progression must remain separate from actual
build readiness and dial-link admission. No native runtime change is implied by
this website experiment. A future Rive experiment needs an authored asset and
real state mappings before claiming application integration.

Sources reviewed 21 November 2026:

- https://gsap.com/docs/v3/GSAP/gsap.timeline()/
- https://gsap.com/standard-license/
- https://registry.npmjs.org/gsap/3.15.1

No usability improvement, video export, Safari/device test or live Genesys
acceptance is claimed by the source and browser checks.
