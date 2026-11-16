# Claims Service website handoff

Status: Needs acceptance

Goal: a separate Claims Service web-messaging page on the existing demo-sites GitHub Pages hosting. The user selected a new isolated channel and asked to use the current Holcim hosting. The intended public route is `/demo-sites/claims-service/`, with allowed hostname `simonridd.github.io`.

The new page provides repair-estimate enquiry guidance and a deliberate Message Claims Service control. The checked-in binding is disabled with no deployment ID. In this state it loads no Genesys bootstrap and starts no conversation. The page gives an ordinary unavailable message. It contains no Case binding, OAuth client, secret, live receipt state or copied Holcim deployment.

After EBv3 independently verifies the new Claims deployment and its restricted hostname, select that exact public deployment identity in `claims-service/messenger-config.js`. Only then enable the launcher. Keep the region eu-west-1. A deployment/client ID is public configuration, not a credential, but it must still be the exact selected Claims dependency. Never put private Salesforce record or conversation bindings in this public repository.

The loader starts on a deliberate click only. It waits for Messenger.ready before opening; duplicate clicks during loading cannot add another bootstrap. Error/timeout leaves the control unavailable. Late readiness after timeout cannot open a conversation. UI readiness does not establish flow execution, an adviser reply, customer identity, receipt confirmation or closure. Those need the separate EB/provider evidence.

Source checks: `node --test *.test.cjs quote/*.test.cjs` passed 31 tests. The three new loader checks use an isolated JavaScript fixture; they prove local request/ready/error boundaries, not live Genesys behavior. Browser inspection at the normal desktop viewport and 390x844 mobile viewport found no layout overflow or console warnings/errors. The visible navigation reached the contact section, and disabled configuration loaded zero provider scripts. Screenshots are retained in the private Salesforce worktree, not public source.

Native acceptance: NOT RUN. EBv3 saved the Claims environment and initial source but rejected Apply because older runs on the same Genesys target require recovery. Its current static Script support cannot author a Salesforce receipt button, and its Action inspector rejects the native Salesforce integration type. The separately approved native Salesforce fallback remains an external dependency tracked in the same EB project. Do not imply that this website resolves those gaps.

Preservation: the Holcim page, contact helper, SDK, OAuth callback, deployment and quotation workspace are untouched. No customer messages, forms, provider snippets or native API calls were used by browser verification.

Deployment: pending this branch's reviewed PR and Pages readback. No live Claims messaging is available. The resulting public informational page can be published with its disabled binding while native acceptance remains pending; that is not a working messaging channel.

Rollback: revert only the Claims page/catalogue changes. Disabling the website's binding does not disable a Genesys deployment or end existing conversations; use EBv3's exact owned lifecycle for native shutdown.

Disposition: website source and local layout verification are prepared. Native deployment identity, restricted activation, actual conversation/correlation and receipt confirmation still need acceptance. Refer to the Salesforce workstream's current delivery receipt for exact private native evidence and recovery blockers.
