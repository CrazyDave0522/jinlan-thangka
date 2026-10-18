# Archive Retrieval Incremental Setup

These files are manually reviewed incremental setup artifacts, not automatically applied migrations. Do not run `database/schema.sql` against the existing database. No artifact imports artwork data.

## Apply Order

1. Follow [the setup guide](../../docs/retrieval-setup.md): inspect the actual schema, constraints, privileges (including inherited/PUBLIC privileges), policies and Data API exposure.
2. Apply `20261016_archive_search.sql` once. It creates the exact candidate function and removes default PUBLIC execution. It uses SECURITY INVOKER and fixed SELECT expressions; it does not write archive records or change table definitions.
3. Apply `20261016_archive_read_access.sql` only after confirming its preconditions. It deliberately fails if any existing `thangka` policy or effective anon INSERT/UPDATE/DELETE/TRUNCATE grant exists. Such a failure rolls back the entire file; do not bypass it by deleting policies blindly. Prepare a targeted reconciliation using inspected grants/policies if needed.
4. The read artifact grants `anon` schema USAGE, SELECT on the eight named tables, and execution on the exact search signature; it enables RLS and creates one SELECT policy per table. It grants no write/sequence/all-routine privileges.
5. Configure `thangka` as an exposed Data API schema, verify the API row limit supports probes of at least 201 rows, generate/compare live types, and run the read-only smoke check. Exposing the schema is intentional demo read access; server-only application imports do not make that API private.

Both SQL files are transactional and intentionally use CREATE rather than silently overwriting existing objects. If their objects already exist, inspect versions rather than treating the error as permission to replace them.

## Unused Thumbnail Removal

`20261018_remove_image_thumbnail.sql` removes only `images.thumbnail_locator`, following the owner's development-stage cleanup authorization. Deploy its compatible reader first: the new projection works on both schemas, while an older reader still requests the removed field. Do not rerun the initializer or the installed search/read setup.

The migration locks images with bounded timeouts, verifies the original nullable text column and requires images to be empty. Populated images or dependent objects cause rollback; it never uses CASCADE or deletes rows. The transaction preserves existing grants/policies and requests PostgREST schema-cache reload. Compare actual live types and anonymous eight-table/RPC reads after application. See the [cleanup verification](../../openspec/changes/archive/2026-10-18-remove-unused-image-thumbnail/verification.md).

To restore an older reader after successful removal, first add back the nullable text column and its original comment, refresh the schema cache and verify that reader's projection. Do not roll an old reader onto the post-removal schema directly. No thumbnail values were discarded when the empty-table guard passed.

## Reconciliation and Rollback

Keep the inspected pre-change grants/policies/RLS flags with the deployment record. If write privileges already exist, identify their origin (direct role grant, PUBLIC or inherited role). Revoke only the reviewed conflicting grants and rerun inspection; an inherited grant cannot be removed by merely revoking a direct anon grant. This repository cannot infer the correct reversal of unknown deployment-specific privileges.

To roll back this installation, first remove its consumer use and revoke anon execution on `thangka.search_archive_candidates(text,jsonb,integer)`, then drop that exact function. For each of the eight tables, remove only `archive_retrieval_select` policies known to have been created by this artifact. Restore SELECT/schema-USAGE grants and RLS flags to the recorded pre-change state; do not blindly revoke preexisting reads or disable preexisting RLS. Remove `thangka` from Data API exposure only if this installation introduced it and no other consumer needs it. No business records need restoring because installation does not modify them.

## Archive Review and Ingestion Integrity

`20261018_archive_data_quality.sql` is the owner-approved post-thumbnail increment. It retains the eight business tables, adds two managed fields to artists/artworks/images and a separate operational review ledger, and constrains source fields and flat text arrays. See [collection/review maintenance](../../docs/archive-curation.md) for review calls and recovery boundaries.

Apply only after fresh target/data/ACL inspection and local SQL/concurrency/build/browser checks. Existing verified/disputed rows or invalid source/array values require explicit reconciliation; do not invent historical reviewers or rewrite evidence. This transactional artifact creates/revokes only its own operational objects and preserves current business SELECT policies/search grants. It is intentionally not idempotent; stop on unexpected routines or pre-existing objects.

The initialized reference now contains these definitions for new databases. On an existing database, apply the incremental file once rather than rerunning the initializer or historical read setup. Verify live generated types and eight-business-table reads separately from ledger/function denials, then deploy the compatible reader before resuming administrative writes.

`npm run test:db-concurrency` uses a pinned development-only PostgreSQL 17 engine on loopback, with synthetic credentials and an automatically removed cluster. It checks true two-connection races, old-reader compatibility and exact review-history restoration. PGlite remains the routine isolated SQL engine and does not replace this concurrency gate.

## Local SQL Verification

`npm test -- src/lib/retrieval/sql.test.ts src/lib/retrieval/archive-quality.test.ts` executes the current schema, preserved pre-quality fixture and actual incremental artifacts in disposable PGlite instances. It tests matching, caps, schema agreement, review guards, field/array constraints, grants and invoker RLS with synthetic data. It does not certify deployed Supabase schema, collation, PostgREST configuration, privileges or true multi-connection locking.
