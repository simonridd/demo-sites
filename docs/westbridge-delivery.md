# Delivery receipt: Westbridge customer website

Status: website source and public redirect delivered. Full four-channel rehearsal remains Needs acceptance.

Goal: add Westbridge Bank's customer website and searchable collection entry. Use the controlled banking host for the restricted native Messenger deployment. The GitHub Pages entry redirects to that host and preserves only the three authored section anchors.

Source: branch codex/westbridge-banking-20261113, tested implementation commit 44e344a. Reviewed PR29 merged into canonical main as 1a2742db9dee44144b95820c572627da906ab9b3. This later receipt changes documentation only. PR: https://github.com/simonridd/demo-sites/pull/29.

Implemented: responsive banking page, matching profile and cover SVGs, card/address/business entry points, Facebook Page link, and the exact public native Messenger snippet. Intent is set through the official Database plugin before Messenger opens. Opening is bounded by a twelve-second timeout and never sends a customer message automatically. No credentials or operator evidence are embedded in the site.

Validation: all 28 existing site, bridge, contact-template and quote tests pass. JavaScript syntax and git diff whitespace checks pass. The separately hosted copy was visually checked at desktop and 390-pixel widths. A real customer browser message reached the owned Genesys address bot; confirmation invoked the hosted service and an independent read observed the changed address and one bot audit entry. That bot-only check does not prove the agent handoff, other channels, calls or recordings.

Deployment: the customer page is currently served at https://banking.simonridd.com/ by the separate banking service workstream. This PR adds the canonical website source and Pages collection entry. After main integration, a fresh public read returned HTTP200 from https://simonridd.github.io/demo-sites/westbridge/ and confirmed the canonical banking host plus canonical.js redirect. Messenger is currently inactive after the earlier bounded rehearsal campaign; source publication does not activate it. Its lifecycle remains owned by Environment Builder.

Permissions and cost: this change adds no secrets, TTS requests, calls, SMS, public posts or recording publication. The native deployment is restricted to banking.simonridd.com. Provider traffic and any charged rehearsal require their existing explicit scope.

Rollback: revert this website PR through review. Keep the banking service's historical durable ledgers, private evidence, recordings and licensed assets. Website rollback does not disable or delete a native deployment; use its exact Environment Builder lifecycle for that separate action.

Remaining: the complete connected web, Facebook and LinkedIn rehearsals and accepted recording. Chapter8 remains deferred. Private production evidence retains exact native references and provider limits separately from this audience site.
