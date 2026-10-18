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

Pending. A compatible code change and local SQL artifact do not establish an applied database migration. Record exact application revision, deployment, SQL application and live read/type verification separately before completion.

## Reversal

Before restoring an older application, add back the nullable text thumbnail column with its original SQL comment and notify PostgREST. Confirm actual projection access before routing to that application. The guarded migration requires zero image rows; it does not discard existing thumbnail values. Never remove later data to recreate this empty-state condition.

Schema-cache refresh uses the documented [PostgREST notification](https://docs.postgrest.org/en/stable/references/schema_cache.html#schema-cache-reloading-with-notify). Application reference permissions remain empty unless separately reviewed for future real material.
