# Archive Retrieval Incremental Setup

These files are manually reviewed incremental setup artifacts, not automatically applied migrations. Do not run `database/schema.sql` against the existing database. No artifact imports artwork data.

## Apply Order

1. Follow [the setup guide](../../docs/retrieval-setup.md): inspect the actual schema, constraints, privileges (including inherited/PUBLIC privileges), policies and Data API exposure.
2. Apply `20261016_archive_search.sql` once. It creates the exact candidate function and removes default PUBLIC execution. It uses SECURITY INVOKER and fixed SELECT expressions; it does not write archive records or change table definitions.
3. Apply `20261016_archive_read_access.sql` only after confirming its preconditions. It deliberately fails if any existing `thangka` policy or effective anon INSERT/UPDATE/DELETE/TRUNCATE grant exists. Such a failure rolls back the entire file; do not bypass it by deleting policies blindly. Prepare a targeted reconciliation using inspected grants/policies if needed.
4. The read artifact grants `anon` schema USAGE, SELECT on the eight named tables, and execution on the exact search signature; it enables RLS and creates one SELECT policy per table. It grants no write/sequence/all-routine privileges.
5. Configure `thangka` as an exposed Data API schema, verify the API row limit supports probes of at least 201 rows, generate/compare live types, and run the read-only smoke check. Exposing the schema is intentional demo read access; server-only application imports do not make that API private.

Both SQL files are transactional and intentionally use CREATE rather than silently overwriting existing objects. If their objects already exist, inspect versions rather than treating the error as permission to replace them.

## Reconciliation and Rollback

Keep the inspected pre-change grants/policies/RLS flags with the deployment record. If write privileges already exist, identify their origin (direct role grant, PUBLIC or inherited role). Revoke only the reviewed conflicting grants and rerun inspection; an inherited grant cannot be removed by merely revoking a direct anon grant. This repository cannot infer the correct reversal of unknown deployment-specific privileges.

To roll back this installation, first remove its consumer use and revoke anon execution on `thangka.search_archive_candidates(text,jsonb,integer)`, then drop that exact function. For each of the eight tables, remove only `archive_retrieval_select` policies known to have been created by this artifact. Restore SELECT/schema-USAGE grants and RLS flags to the recorded pre-change state; do not blindly revoke preexisting reads or disable preexisting RLS. Remove `thangka` from Data API exposure only if this installation introduced it and no other consumer needs it. No business records need restoring because installation does not modify them.

## Local SQL Verification

`npm test -- src/lib/retrieval/sql.test.ts` executes the original schema and actual function/access artifacts in a disposable in-memory PostgreSQL (PGlite). It tests matching, caps, schema descriptor agreement, grants and invoker RLS with synthetic data. It does not certify the deployed Supabase schema, collation, PostgREST configuration or privileges.
