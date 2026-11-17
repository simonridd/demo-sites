# Westbridge Messenger status delivery receipt

Status: Needs acceptance
Issue: https://github.com/simonridd/demo-resources/issues/160
Repository / canonical branch: simonridd/demo-sites, main
Working branch / tested source commit: codex/westbridge-messenger-status-20261115, 57a089edf3287d279cb1b05208f3d670d530ff9b
PR: https://github.com/simonridd/demo-sites/pull/31
Hosted service PR and full operator receipt: https://github.com/simonridd/demo-resources/pull/216

Goal and scope: keep the canonical website launcher aligned with the hosted copy, correcting the false availability warning visible in the first banking web recording.

Implementation: retain SDK plugin readiness, set journey context before opening, recognize the exact already-open response, follow native opening and closing, and isolate overlapping or expired attempts. Preserve actual context failures and deliberate retries. The launcher sends no customer message.

Validation: all 28 repository checks pass on the source commit above. The bank.js file is identical to the hosted copy covered by seven focused regression tests, all passing. Native SDK acceptance, visual review and the replacement recording remain pending normal Mac unlock. Source tests do not prove agent delivery. Hosted full application checks and deployment are tracked by the linked service receipt.

Deployment / current runtime state: reviewed merge and existing GitHub Pages workflow are pending. The canonical redirect to banking.simonridd.com is preserved. This source update does not activate Messenger or change a flow, queue, deployment, service record, SDK configuration or credential.

Security / permissions / data / cost: only public launcher code and this operator receipt are included. No keys, message bodies or recordings are published. No paid audio or call is made.

Known defect and disposition: the first web take visibly includes the old warning and is retained privately. A clean replacement take is required after native acceptance. No recording publication or Chapter 8 work is included.

Rollback: revert this PR together with the matching hosted launcher change; retain the existing canonical redirect and all provider references. The hosted adapter must be redeployed using its then-current deliberate rehearsal binding rather than its default run ID.

Remaining action: finish source review and integration, verify the Pages-returned asset revision and canonical redirect, then finish hosted/native checks and the clean recording. Preserve prior service ledgers and take evidence.

Evidence: public source checks and hosted regression tests are linked above. Private capture evidence, provider readbacks and service snapshots stay in their existing production operator directory.
