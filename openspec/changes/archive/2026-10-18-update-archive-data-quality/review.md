# Proposal Review

## Scope and Result

Reviewed on 2026-10-18 at the owner's request. Pass one checked review-state semantics and existing application contracts. Pass two checked shared-database rollout, privileges, rollback and the proposed verification evidence. The resulting proposal is ready for owner scope review, not implementation approval. No application code, reference SQL, migration, remote configuration or business data was changed in this review.

The earlier connected archive review remains the source of the eight-table/124-column/empty-data baseline. This proposal review did not refresh remote counts or claim that the database is still empty at a later migration time.

Later owner instruction on the same date explicitly authorizes physical unused-field removal with matching code. The earlier R03 retention resolution below is historical and superseded for thumbnails by [the independent cleanup](../2026-10-18-remove-unused-image-thumbnail/proposal.md). Its matching-reader-first rollout remains mandatory; the review ledger and other ingestion changes are still unapproved.

## Findings and Resolutions

| ID | Priority | Original gap and concrete consequence | Proposal resolution |
| --- | --- | --- | --- |
| R01 | P1 | Requiring any matching verified event would allow an older approval to be reused after a later disputed/pending decision on the same revision. Snapshots and history immutability were insufficiently specified. | Add a current-decision pointer, database ordering, entity/revision validation, database-derived snapshots and append-only history guards; prohibit replay and direct verified insertion. Q01–Q04. |
| R02 | P1 | Expected content revision alone cannot detect two competing reviews of unchanged content. A row lock serializes writers but does not express which prior decision the reviewer saw. | Compare both expected revision and expected current review ID under the row lock; require genuine competing-session tests. Q05. |
| R03 | P1 | A protected Preview still shares the Production database. Dropping a column breaks old explicit projections, and a new digest does not revoke grants evaluated by an older runtime. | Narrow this increment to thumbnail deprecation with the column retained; use additive SQL before new-app promotion and inspect every reachable old reader/grant. Physical deletion is deferred. Q13–Q14. |
| R04 | P1 | Generic advice to inspect security omitted new functions' default PUBLIC execution and possible inherited/default object grants. | Fix invoker semantics, qualified SQL and empty search path; revoke new-object exposure in the creation transaction and test effective privileges/RLS separately from admin success. Q08. |
| R05 | P2 | Rejecting null elements alone still admits multidimensional arrays that the runtime parser refuses. | Require empty or one-dimensional arrays of non-null strings and explicit empty/literal-NULL cases. Isolated current-schema probe confirms nested arrays are accepted today. Q07. |
| R06 | P2 | The catalogue iterates entity descriptors. Adding revision/pointer fields without filtering could offer operational metadata to the model and produce references without valid product labels. | Preserve full retrieval/digest rows but exclude new managed fields before evidence-key assignment and from public references/source-field support. Q06, Q11–Q12. |
| R07 | P2 | Existing SQL tests count all columns in thangka, and release inspection expects eight tables. Adding a ledger invalidates those assumptions; blindly changing eight to nine would obscure the evidence boundary. | Separate business and operational inventories, detect unknown objects, and compare a preserved pre-change baseline with fresh initialization including installation order. Q09–Q10. |
| R08 | P2 | The draft listed concurrency and rollback checks without distinguishing PGlite's single connection or defining retained state after rollback. | Make independent PostgreSQL 17 connections a separate open implementation gate; prefer old-app rollback with additive schema retained and rehearse any full state restoration. Q05, Q16. |

The new [acceptance matrix](acceptance.md) also covers invalid-data preflight, decision atomicity, unknown objects, role denials and stale image grants. These cases describe future required results, not tests already passed.

## Evidence Used

- Current [row parser](../../../../src/lib/retrieval/rows.ts) requires flat string arrays. An in-memory PGlite instance initialized from the unchanged reference schema accepted a two-dimensional `artists.aliases` array and returned nested JSON. Only that isolated database received synthetic data; it was closed afterwards.
- Current [catalogue construction](../../../../src/lib/answers/catalogue.ts) iterates all runtime fields, and [reference validation](../../../../src/lib/answers/contracts.ts) requires a supported product field label. This establishes the integration work behind R06 without modifying the implementation.
- Current [read setup](../../../../database/migrations/20261016_archive_read_access.sql) grants SELECT on named tables, not individual columns. [Release inspection](../../../../scripts/inspect-archive-release.sql) inventories the schema, while its tests assume eight tables; [SQL tests](../../../../src/lib/retrieval/sql.test.ts) count all schema columns. These are explicit implementation update targets.
- [PostgreSQL 17 arrays](https://www.postgresql.org/docs/17/arrays.html#ARRAYS-DECLARATION) confirms that declared dimensionality is not enforced; the isolated probe demonstrates the resulting application mismatch in this repository.
- [PostgreSQL 17 function definitions](https://www.postgresql.org/docs/17/sql-createfunction.html) documents invoker authority and new functions' default PUBLIC execution. Privilege changes must be transactional with creation; a source-code review alone cannot certify actual deployed grants.
- [PostgreSQL 17 row locks](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS) explains serialization and updated-row behavior. The installed PGlite README lists single-user/connection operation, so a sequential embedded SQL suite is insufficient evidence for Q05.

## Preserved Boundaries

- Review certifies only the entity-row version. Linked source accuracy and per-candidate authorship evidence remain independent; there is no transitive evidence-graph review claim.
- Review snapshots preserve collection responsibility at review time. This is not a full history of every collection/edit handoff before the first review.
- Existing business records remain eligible regardless of review status. The operational ledger adds no private/public business-record split, model call or application account.
- New reference grants must follow the existing permission process. Metadata review never grants image use.
- `add-demo-release` A evidence remains historical for its recorded revision. The eventual final candidate needs affected checks refreshed; real-data B is still open.

## Validation

- `openspec validate --all --strict --no-interactive`: nine active changes/specifications passed, zero failed, including this revision and `add-demo-release`.
- Parsed deltas: eight requirements across three capabilities, each with scenarios; the modified retrieval requirement retains its original unverified/disputed scenario.
- Local document checks: eight files, valid relative links, English documentation, clean whitespace and exactly sixteen acceptance case IDs.
- `git diff --check`: passed. Because this new proposal directory is untracked, the independent document whitespace check also covered all eight files rather than relying on tracked diffs alone.
- One isolated current-schema nested-array probe completed; the disposable in-memory database was closed. No remote database or paid API was used.

No application suite, implemented SQL feature test or real concurrent-session test ran in this proposal review. Q01–Q16 remain future implementation gates; strict proposal validation does not establish their correctness.
