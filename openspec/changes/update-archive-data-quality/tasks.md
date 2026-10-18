## 1. Proposal Review

- [x] 1.1 Review the live-schema findings, current specifications and active release obligations; incorporate the owner's collection/search/gallery decisions.
- [x] 1.2 Define the bounded review ledger, row-review semantics, ingestion constraints, thumbnail deprecation and compatible rollout.
- [x] 1.3 Complete behavioral and migration/security review, revise discovered gaps, and validate specifications/links; record proposal-only evidence and limits. Two passes resolved R01–R08; strict validation passes all nine active changes/specs, with eight parsed deltas, eight checked documents and sixteen future acceptance cases. See review.md.
- [x] 1.4 Obtain owner approval of the revised proposal before changing schema, application behavior or remote configuration. After thumbnail cleanup, the owner explicitly instructed a final check and implementation of the remaining work if clear; the final check found no scope blocker. Implementation starts on feat/update-archive-data-quality from main@bf471a9.

## 2. Database Changes After Approval

- [x] 2.1 Add and test managed revisions/current-decision pointers, immutable database-generated snapshots and atomic review comparing both expected values; cover stale decision replay, initial INSERT and cross-entity/version guards.
- [x] 2.2 Add target-specific source-field and one-dimensional non-null array validation with failure/rollback tests; preserve empty arrays, unscoped links and literal strings.
- [x] 2.3 Restrict new ledger/sequence/function privileges transactionally, test anon/authenticated denials and preserve post-cleanup business read grants without recreating removed fields.
- [x] 2.4 Compare fresh initialization with migration from a preserved pre-change baseline, including setup order, constraints, triggers and ACLs; prepare preflight, backups and a tested restoration path.
- [x] 2.5 Verify edit/review and review/review races with two independent connections on disposable PostgreSQL 17. Leave this gate open if unavailable; PGlite sequential tests are insufficient.

## 3. Application Compatibility

- [x] 3.1 Synchronize generated types, descriptors, projections and fixtures; keep eight business tables in retrieval and inventory the ledger separately in parity/release inspection with unknown-object detection.
- [x] 3.2 Exclude managed review metadata before model fact-key assignment and from public references; verify business eligibility, source scoping, uncertainty and complete post-cleanup image digests.
- [x] 3.3 Document collection/review maintenance and citation-specific versus source-wide notes; retain optional dates and generated image metadata.
- [x] 3.4 Run `npm run check`, the ordinary production build and any affected real-route browser tests; record actual results and limits.

## 4. Coordinated Application and Verification

- [x] 4.1 Inspect the actual shared target, current data/ACLs and all reachable readers/reference manifests; resolve conflicts and rehearse old-reader compatibility and rollback before approved application.
- [x] 4.2 Apply bounded transactional additive SQL with maintenance writes frozen; verify existing reads, then validate/promote the compatible candidate and resume maintenance. Do not drop columns, import fixtures or make new paid calls.
- [x] 4.3 Verify live schema/types, review authority, ledger denials and read-only eight-table/RPC behavior; record exact database/deployment state and refresh affected release checks without replacing historical A evidence or completing B.
- [ ] 4.4 Obtain owner acceptance and archive only after implementation, coordinated application and required checks are complete.

The earlier deletion-only authorization is historical. The subsequent owner instruction now approves the remaining proposal after final checking; earlier review counts and thumbnail-retention decisions retain their original evidence boundary.
