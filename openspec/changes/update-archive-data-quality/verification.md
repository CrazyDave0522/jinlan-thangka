# Archive Data Quality Implementation Verification

## Approval and Baseline

On 2026-10-18 the owner instructed one final check and implementation of the remaining reviewed proposal if clear. Final review retained the approved scope; thumbnail removal is already complete. Work uses `feat/update-archive-data-quality` from main@bf471a9, whose published archive baseline has eight empty business tables and 123 columns. No real-data/source/domain acceptance is inferred from that baseline.

## Implemented Locally

- Added managed revisions/current-review pointers and a typed append-only review ledger. Database-derived snapshots and null-safe expected revision/previous-decision comparisons prevent stale or replayed approvals; content changes clear verification.
- Added target-field constraints and empty-or-flat non-null text-array checks. Migration stops rather than rewriting invalid data or inventing historical reviewers.
- Restricted new table/sequence/functions under invoker authority and ledger RLS. Business reads/search remain separate; operational fields stay in drift/digest checks and out of model keys/public references.
- Preserved the post-thumbnail schema fixture and synchronized initializer, migration, canonical live-generated SDK types, descriptors and synthetic fixtures. The final SDK output matches generation from the migrated live schema exactly.
- Documented collection/review and owner-only recovery; no login, management UI, source-graph review or wider search is added.

## Local Evidence

- `npm run check`: lint, TypeScript and all 432 tests across 38 files pass. Initial test-only readonly/type annotations were corrected before this passing run.
- `npm run test:db-concurrency`: eight PostgreSQL 17.10 checks pass using three independent loopback sessions. Six commit/rollback races exercise edit/review and competing decisions; baseline reads and exact history/snapshot/pointer restoration pass separately. Restored guards reject a history edit.
- Docker Desktop initially could not start within its timeout; it became available later for the standard remote schema backup. The reproducible gate instead uses pinned development-only embedded PostgreSQL, creates no system account and removes its cluster. Its reviewed platform-package hydration script has a version-specific npm approval. Dependency audit findings are in the existing lint/shadcn toolchain, not the new PostgreSQL package chain; no unrelated upgrade was applied.
- Targeted actual-SQL suites initially passed 41 tests; the full run also includes invalid legacy-array/source migration and operational answer/grant regressions.
- Ordinary production build passes. All 45 affected Chromium cases pass across the compact desktop/mobile matrix. The initial browser run exposed the unsynchronized artist fixture (10 failures); updating its managed metadata resolved every failure. Strict OpenSpec validation passes all 10 items; all 10 change/maintenance documents have valid local links.

Ignored artifacts under `evaluation-results/archive-quality/` contain synthetic restore payloads, concurrency results and later metadata. No credentials or real business rows belong in tracked evidence.

## Remote Gates

Applied on 2026-10-18 after fresh preflight of the same Supabase origin (SHA-256 `7ba7959ffd4bbb42f2a384b708a01ec79cb66e1dcdf15d6cee4554fa1db3dd6d`). PostgreSQL 17.11, postgres/BYPASSRLS, eight empty business tables and 123 columns matched the post-thumbnail baseline. The canonical pre-migration types matched main@bf471a9 exactly. Both reachable historical manifest revisions and the current production manifest contain no grants.

Saved a standard 33,072-byte schema dump, exact metadata/ACL/default-privilege inspection and an eight-empty-row-set export. Restoring the actual dump to disposable PostgreSQL 17.10 reproduces logical column definitions/order, constraints, indexes, triggers, functions and grants; the prior dropped-column ordinal gap is naturally compacted. The candidate migration then passes against that actual restored baseline.

The bounded additive transaction succeeded. Fresh inspection finds nine tables, 129 business columns plus 12 ledger columns, 66 constraints, 31 indexes and 15 custom triggers. Original columns and both original function definitions are unchanged. Existing business policies/grants and exact search RPC metadata are identical. Five new helpers use invoker authority and deny PUBLIC/anon/authenticated execution. The ledger has RLS, no policies and no visitor grants; the sequence has no anon/authenticated access. No unexpected tables/functions appear. All business counts and ledger count remain zero; the sequence is unused.

Canonical live types were regenerated and `npm run check` again passes 432 tests/38 files. New and original explicit projections return HTTP 200 on all eight business tables; search RPC also returns 200. Anonymous ledger SELECT and review RPC both return HTTP 401 / SQLSTATE 42501. The nonexistent-entity RPC probe cannot create a review. Concurrent CLI reads raced while initializing the shared temporary login role; one failed authentication. A sequential bounded retry completed and matched the baseline. Further Supabase CLI invocations are sequential; no password extraction or credential change is required.

Protected disabled Preview and compatible Production publication remain required. Administrative writes stay paused during the coordinated transition. No remote fixtures or paid calls were made.

## Release Boundary

Historical release A evidence stays bound to its original revision. New checks must be recorded for this candidate; release B still requires real records, scoped sources, permitted assets and domain judgments. Owner acceptance/normal archival remain separate from implementation evidence.
