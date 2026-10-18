# Thumbnail Removal Verification

## Authorization and Baseline

The owner authorized unused-field removal on 2026-10-18, with matching application/database logic as the condition. Work starts from `main@a5a1b4a` on `feat/remove-unused-image-thumbnail`. The review-ledger proposal is not approved by this instruction.

The connected Vercel project remains `prj_FnmBJHdIVIUQSobZy5EAYNV3lAkF`, owned by `team_p6vs7dieKCGN1MX85ZjTHP3h`, with Production `dpl_GKExoKEWEkUQm3PPMPXydMKfD48T` at inspection. The Supabase target is privately derived from the existing local configuration and matches the recorded origin hash `7ba7959ffd4bbb42f2a384b708a01ec79cb66e1dcdf15d6cee4554fa1db3dd6d`. Fresh administrative metadata/count inspection is saved under ignored `evaluation-results/thumbnail-removal/`; no configuration values or credentials are published.

## Local Results

- Targeted migration/reference suites: 18 tests passed. Cases cover new projection compatibility on both sides, current-schema parity, populated-image refusal, RESTRICT dependency preservation, unexpected/repeated migration rejection and stale old-row grants.
- `npm run check`: passed lint, TypeScript and all 411 tests across 36 files. The added SQL parity case initially exceeded the default five-second test budget under the full worker load; its local setup budget is now explicit at twenty seconds. A missing test-only query result type was also corrected. Neither issue was a runtime application failure.
- `npm run test:e2e -- tests/browser/image-interpretation.spec.ts tests/browser/answer-sources.spec.ts tests/browser/demo-release.spec.ts`: 45 Chromium cases passed, including all eight core viewports, permitted fixture reference matching, source navigation/copy and composed conversation flow. External services remained replaced by guarded synthetic upstreams.
- `npm run build`: ordinary production build passed independently after the fixture build; no paid provider calls.
- Strict OpenSpec validation: all ten current changes/specifications passed; relative document links and diff whitespace checks passed.
- Fresh privileged preflight: PostgreSQL 17.11, postgres/BYPASSRLS, eight exact empty counts, 124 columns including the original nullable text thumbnail, 26 indexes, 42 constraints and eight timestamp triggers. The production reference manifest remains empty.

## Remote Application

1. Fast-forwarded the tested reader into main and published `90ea0104e2757aa7f3efc414a107f211434bd728`. The existing Vercel Git integration built Production `dpl_4jdHL5Pdo8sEvcAuhLXbxbnRVmER`, READY/PROMOTED, with the public alias assigned. Ordinary public page/API GET checks returned 200/405. No environment or protection setting was changed.
2. Before SQL, actual anonymous reads using the new projection returned HTTP 200 for all eight tables and the exact search RPC, proving current read compatibility while the old column still existed.
3. Applied `database/migrations/20261018_remove_image_thumbnail.sql` through the normal authenticated Supabase CLI to the hash-matched existing archive, after checking that exact compatible Production target. The tested empty-image/type/dependency guards remained active; no initializer, row import/deletion, CASCADE, grant rewrite or Storage operation ran.
4. Fresh administrative readback shows exactly 123 business columns and 22 image columns. Comparing before/after snapshots finds only `images.thumbnail_locator` removed. All 42 constraints, 26 indexes, eight triggers, function definitions, table/RLS/grant metadata and exact eight zero counts are unchanged.
5. Official live type generation for thangka matches committed `database.generated.ts` after trimming the final newline and contains no thumbnail field. Actual anonymous eight-table/RPC smoke repeated after migration: all nine endpoints return HTTP 200.
6. Public checks after migration pass: homepage 200, API GET 405, and a text/plain POST returns 415/unsupported_media_type with no-store. The rejection occurs before provider work.

Administrative and SDK/data-API checks are distinct evidence. The archive remains empty; these results establish structural/read compatibility rather than real artwork identity or source accuracy. No paid provider calls were made. Older deployed revisions requiring the deleted column are historical and cannot be a direct rollback target; restore the column first or use this compatible reader.

The accompanying final record commit changes documentation only; it retains the tested runtime source and is published through the existing Git deployment path.

## Reversal

Before restoring an older application, add back the nullable text thumbnail column with its original SQL comment and notify PostgREST. Confirm actual projection access before routing to that application. The guarded migration requires zero image rows; it does not discard existing thumbnail values. Never remove later data to recreate this empty-state condition.

```sql
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
ALTER TABLE thangka.images ADD COLUMN thumbnail_locator text;
COMMENT ON COLUMN thangka.images.thumbnail_locator IS 'Thumbnail address or path. Record an existing thumbnail; collectors need not create one.';
NOTIFY pgrst, 'reload schema';
COMMIT;
```

This reversal is a contingency, not an executed action. Reinspect actual schema and image grants before using it; adding a column changes the full-row digest again.

Schema-cache refresh uses the documented [PostgREST notification](https://docs.postgrest.org/en/stable/references/schema_cache.html#schema-cache-reloading-with-notify). Application reference permissions remain empty unless separately reviewed for future real material.
