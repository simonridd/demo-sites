# Original build-status Rive source

A geometric status signal authored for the reusable kit on 22 November 2026. Three glyphs (working bars, attention mark and check) share a circular surface. The `mode` view-model property selects the state machine's animation; nothing transitions to ready on elapsed time.

Authoring tool: official Rive CLI 1.10.0, macOS arm64. Official tarball SHA-256: `33dee37d05f205f82980cc3a2e6a0c10323c0af8d84fef22b5e1c607a9bfc2a6`. Download and installation remain outside the public repository. CLI usage analytics was disabled for this local authoring session.

```sh
rive . --verify
rive inspect . --summary
rive . --screenshot=/absolute/output/preparing.png --advance=1s
rive . --screenshot=/absolute/output/attention.png --data=mode=1 --advance=1s
rive . --screenshot=/absolute/output/ready.png --data=mode=2 --advance=1s
```

The checked source reports one artboard, one state machine, three states and three view-model conditions, with no compiler warnings or inspection problems. First-sibling draw order is front-to-back, opposite to SVG; visual captures are necessary because misplaced layers still compile.

The CLI can compile and render locally while signed out. Saving a playable `.riv` for a website requires its normal account/export workflow. Sign-in is pending at this checkpoint. No copied sample asset, account credential or paid agent-generated artwork is included. The small geometric marks are original authored shapes. Keep build logs, captures and local tooling out of public source. The kit README documents the remaining export/runtime acceptance and integration contract.
