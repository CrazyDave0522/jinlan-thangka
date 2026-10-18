# Change: Remove unused image thumbnails

## Approval and Scope

On 2026-10-18, after reviewing `update-archive-data-quality`, the owner explicitly authorized physical removal of unused fields while the development archive is empty, provided application logic and database structure match. This approves this focused extraction: remove only `images.thumbnail_locator` and coordinate its consumers and deployed database. It does not approve the separate review-ledger or ingestion redesign.

## Why

The current conversation product does not use separate thumbnails, and the owner has no near-term gallery/list requirement. Retaining an unused compatibility field is unnecessary once the matching reader is ready. The connected preflight still needs to establish the actual empty target immediately before application.

## What Changes

- **BREAKING**: Remove the nullable thumbnail column and its initialization comment/import mapping.
- Update generated/runtime types, explicit projections, answer field labels/exclusions and isolated browser fixtures together. Reject old-shape image grants through the unchanged complete-row digest check.
- Supply an incremental transactional migration with bounded locks, original-column validation, an empty-image-table guard, RESTRICT dependency handling and PostgREST cache notification.
- Test the new reader against both pre-removal and post-removal schemas. Deploy the compatible reader before applying the authorized column removal; retain all other business fields, tables, records, grants and policies.

## Impact

- Affected spec: `thangka-retrieval`.
- Affected code: archive schema/types, answer/image reference field handling, browser fixtures and the incremental migration.
- No review ledger, new search scope, gallery, paid evaluation or fixture import is included.
- Historical deployments are not an application rollback target after removal unless the column is restored first. Current production must use the compatible reader; future data import must not reactivate old readers or stale image grants.

## Rollout and Reversal

Verify the exact existing Vercel/Supabase project, current archive and empty production grant manifest. Complete deterministic tests/build/browser checks, publish the matching reader, verify its deployment revision, then apply `20261018_remove_image_thumbnail.sql`. Compare live generated types and actual anonymous eight-table/RPC reads afterwards. Do not describe a local migration file as a deployed database change.

If application verification fails before migration, leave the column in place. If SQL fails, its transaction preserves the old schema. To return to an older reader after successful removal, first restore `thumbnail_locator text` and its original comment, notify the schema cache, and verify the old projection. The guarded empty-image migration removes no row values to restore. Do not clear later imported data or weaken image grant digests.

The remaining release B obligations continue to depend on real records, sources and permitted pictures; this cleanup does not complete them.
