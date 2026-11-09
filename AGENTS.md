# Working in demo-sites

`main` is the reviewed source of the public GitHub Pages demo collection. Keep existing customer demo routes, reusable shared assets, query/hash navigation, pinned SDK/license files and publication behavior intact. Work in a clean isolated branch; do not accidentally publish personal data, private source files, credentials, browser state or unapproved assets. A local build, commit or push is distinct from successful Pages deployment and from real Genesys interaction.

## Portable website authoring skill

The canonical source skill is `skills/build-demo-site/SKILL.md`. On every change to site schema (`demos.json`), shared template, SDK/Messenger integration, static build, accessible UI, preview, OAuth callback, public route or Pages release workflow, review and update the source skill and its references **in the same PR**. Include a small site example or regression test for materially new functionality; do not describe an unsupported native feature as working.

A cross-application demo coordinator may delegate a requested customer website to `build-demo-site`, but the website repository remains owner of the public artifact. Return actual source commit, selected public integration references, deployed URL and checks; do not create or activate Genesys configuration, send messages or claim live delivery from this static skill.

## Cross-Mac installation and updates

The complete `skills/build-demo-site` directory, not only SKILL.md, must be available to the installed Codex user skill. Prefer the current Codex user directory `$HOME/.agents/skills` and check for stale duplicates in `$HOME/.codex/skills` and any repo-local `.agents/skills`. Verify source SHA, actual host discovery, and that related file paths resolve. A Git pull does not update a copied skill or grant GitHub Pages publishing rights.

When changing this skill's supported abilities or installation contract, update the corresponding owner entry in the demo-production portfolio catalogue as part of the same release process. Source/version alignment and site/publishing acceptance remain separate: run current local static tests and inspect the deployed Pages revision only when publication is within the user's task scope.

See [Skill maintenance](SKILLS_MAINTENANCE.md) for the owner matrix and PR gate.
