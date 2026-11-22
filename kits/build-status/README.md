# Build signal: reusable status prototype

This kit is an original three-state Rive source plus a semantic HTML/static SVG preview. It is reserved for operator-facing Voice Demo Builder and related build-status interfaces; it is not part of the customer-site catalogue.

## Current delivery state

The original RML compiles and renders through official Rive CLI 1.10.0. The CLI requires account sign-in to export the playable `.riv`; that sign-in is pending. `assets/export.json` records `ready: false`, so this preview uses its static SVG and does not load a runtime or request a missing asset. Do not describe it as a shipped Rive animation or a deployed builder integration before export and runtime acceptance.

The runtime loader and readiness adapter are prepared for the exported asset. The preview controls select explicit example receipts; there is no automatic transition to ready, native build request, receipt token, phone action, provider API or browser storage. The example number in the source is fictional and is never rendered as a call link.

## State contract

`state-model.mjs` reads the existing website-receptionist front-door contract inspected in the installed Environment Builder 0.94.0 source:

- `queued`, `preparing`, `publishing`, `activating`: preparing.
- `active` with the existing valid `tel:+…` dial-URL contract: ready visual.
- `blocked`, `released`, `superseded`, `retiring`, missing or unknown responses, or unverified active data: attention.

This is a visual projection only. The existing owner still verifies ingestion, unchanged AVA identity, selected mapping and call readiness. It alone controls the actual dial link. The adapter never returns an action or phone value; an animation callback cannot change application state. Feed each fresh status response to the adapter, and clear a previous ready visual on polling errors or superseded data.

## Optional Rive layer

The authored asset uses `BuildSignal` / `BuildStatus` and numeric view-model property `mode` (0 preparing, 1 attention, 2 ready). It contains no scripts, text, external assets, URL listeners or outbound events. The hand-authored SVG is the static alternative. Do not invent a static file's provenance or extract the CLI's internal build bytes to bypass its export requirement.

The runtime candidate is pinned `@rive-app/canvas-lite` 2.54.0. Review and retain the MIT runtime licence, npm SHA-512 and per-file integrity before packaging it with an actual exported asset. JS/WASM cost must be measured independently of the tiny `.riv` file; a simple status icon may be better served by native code in production. This remains a kit experiment, not a portfolio-wide dependency.

The optional player uses self-hosted, integrity-checked JS, WASM and Rive bytes, disables CDN fallback and pointer listeners, and uses the current view-model API. Rendering is paused offscreen, in background tabs, on page suspension, by user pause and under reduced motion. The HTML status and static SVG update immediately and remain usable when the animation fails. A completed loading animation never creates readiness.

## Finish export and acceptance

1. Sign in through `rive login` and the official browser device flow. Do not commit credentials or the device code.
2. Build the source under `tools/artwork/build-status/` using the authorised account's normal `--publish` export. Preserve any required free-plan watermark; no plan purchase is part of this kit.
3. Add the exported file and pinned runtime/wasm with provenance, licence, SHA-384 descriptors and `ready: true` in `assets/export.json`.
4. Verify all three actual runtime states, rapid reversals, static failure, keyboard controls, changed reduced motion, visibility and page recovery in Chrome; compare loading cost before adopting it in the builder.
5. Integrate through the builder's owning source and normal frontend release workflow. Do not patch an installed plugin cache or native readiness logic. This kit does not deploy that separate frontend.
