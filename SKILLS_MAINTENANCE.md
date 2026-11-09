# Skill maintenance

This repository owns `$build-demo-site`.

For changes to a user-facing workflow, API, UI, CLI, schema, package or permission boundary, update the owning instructions, references, examples and capability mapping in the same PR. Review any change outside the tracked source paths for the same effect. Record compatibility for already installed users and keep shared IDs and handoff contracts stable. Update the central catalogue when routing or installation changes.

Run `node tools/check-skill-parity.mjs`. The PR job also checks tracked source changes against skill or matrix changes. Use the owner test and package commands for release, and record package identity and fresh host checks separately from provider or attended acceptance.

See the [portfolio Mac guide](https://github.com/simonridd/demo-resources/blob/codex/portfolio-skills-audit-20261109/docs/skill-fleet/MAC_INSTALL.md) for the cross-repository install and routing contract.
