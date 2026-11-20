# Delivery receipt: website design guidance, 20 November 2026

Status: Complete for guidance adoption after PR merge and installed-copy verification. Existing-page implementation is outside this delivery.

- Goal and scope: digest the ten tips in Charles Liu's public reel caption and choose where and when to apply them in future website work.
- Issue: the direct user request in this session; no separate implementation issue.
- Repository / canonical branch: `simonridd/demo-sites`, `main`.
- Working branch: `codex/website-design-guidance-20261120`.
- Guidance commit: `1d168e0`; final receipt commit and merge identity are available in [PR #38](https://github.com/simonridd/demo-sites/pull/38).
- Implemented scope: the existing website skill links to `references/website-design.md`, which records all ten decisions, application order and technical references. No routing, capability or installation contract changes.
- Shipped on main: the skill entrypoint, design reference and this receipt when PR #38 is merged. The PR's merge status is authoritative.
- Validation: skill validator passed using an isolated `uv` PyYAML dependency after the system Python lacked that module; skill parity passed; all 32 existing site tests passed; `git diff --check` passed. Repeat parity and site checks on the final receipt commit before merging.
- Review: author reviewed the guidance for brand preservation, correct viewport tradeoffs, contrast, motion preferences and colour changes from blending. No independent design audit is claimed.
- Live/hardware acceptance: the exact Facebook reel was opened in Chrome and its expanded author caption read. No video-audio transcript was produced. No existing website visual audit, Safari/device check, call or messaging acceptance was part of scope.
- Deployment / runtime: guidance only; no live page markup, assets, integrations or hosting configuration changed. Sync the complete merged skill to the discovered personal location, `/Users/simonridd/.agents/skills/build-demo-site`, and compare file contents. Other Macs require their own source update and installation sync.
- Security / permissions / data / cost: no credentials, customer records, browser exports, paid generation, calls, messages or new permissions.
- Known defects: none identified in the guidance; practical appearance remains subject to review on the page where a technique is applied.
- Rollback: revert PR #38 and restore the previous installed skill directory.
- Remaining action, owner and trigger: future authoring work applies the checks to the components being changed. Existing-page changes require their own brief and validation.
- Evidence: [source reference](../skills/build-demo-site/references/website-design.md), [PR #38](https://github.com/simonridd/demo-sites/pull/38), and the command results in this session.
