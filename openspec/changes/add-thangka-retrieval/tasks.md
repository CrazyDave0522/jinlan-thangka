## 1. Refine Before Implementation

- [x] 1.1 Review the roadmap, existing eight-table schema/relations, archive eligibility and Supabase helpers.
- [x] 1.2 Define strict inputs, literal matching, rank tiers, caps, finite traversal, typed result/error envelopes and evidence completeness scenarios.
- [x] 1.3 Document the SECURITY INVOKER search function, stateless anon reader, incremental setup and live schema/access/type verification procedure.
- [x] 1.4 Synchronize proposal, design, delta, review, project context and database setup documentation; run strict OpenSpec validation.
- [x] 1.5 Obtain approval of the refined proposal before feature implementation or remote setup.

Refinement and implementation were approved by the owner on 2026-10-16 on `feat/add-thangka-retrieval`, based on main at `0490ac9`. Local implementation and verification are complete. The owner applied the function/read-access SQL and configured Data API exposure/row limits after supplying matching column/constraint and pre-setup role/policy inspections. Repeated anon API smoke checks now pass for all eight tables and the RPC (HTTP 200). The owner supplied final table grants/policies matching the approved read boundary. RPC signature/result/security/EXECUTE metadata also matches the code; live CLI-generated types have now been saved and compared successfully, as recorded in [verification.md](verification.md).

## 2. Implement Query and Database Contracts After Approval

- [x] 2.1 Inspect actual schema/access with the read-only checklist in `docs/retrieval-setup.md`; record unavailable checks as integration gates. Do not rerun the initializer or seed the owner's database.
- [x] 2.2 Add strict domain query validation, normalized inputs, discriminated results/errors and the named shared budget constants from the design.
- [x] 2.3 Add a separate incremental SQL artifact for the bounded literal candidate function, mirrored argument validation, deterministic rank/reasons and SECURITY INVOKER/empty-search-path behavior; use no dynamic SQL.
- [x] 2.4 Prepare scoped SELECT/exact-function grants and SELECT-policy setup based on inspected existing permissions, with a reviewed reconciliation/rollback plan for conflicts. Do not grant broad routines/writes or blindly replace existing policies.
- [x] 2.5 Generate/compare database types from the actual project including the installed RPC where available. Label reference-derived provisional types and leave live verification outstanding otherwise.
- [x] 2.6 Implement the isolated server-only anon archive reader, explicit `thangka` and explicit projections, no session cookies/elevated key/shared cache, and a bounded-response fetch wrapper before SDK JSON parsing.

The owner supplied all 124 matching column definitions, 42 matching constraints, final effective anon grants/RLS SELECT policies and matching RPC signature/security/execution metadata. Actual anon API smoke checks pass. After the owner completed CLI login, Supabase CLI 2.121.0 generated the real `thangka` types into `src/lib/retrieval/database.generated.ts`. The SDK now uses that generated Database type, including real relationships and Insert/Update definitions. Compile-time checks compare every row field/type/nullability and RPC Args/Returns against runtime descriptors; separate domain CHECK-state narrowing is preserved. No further database setup or owner schema submission is needed for the approved retrieval acceptance. Live primary-image index/update-trigger inspection and populated-data relevance were not independently performed and are not claimed by these read-only checks.

## 3. Implement Finite Retrieval

- [x] 3.1 Implement lookup/search, candidate probing, ranked root rehydration and honest no-match semantics.
- [x] 3.2 Expand root associations, counterpart rows, images, source links and distinct sources in bounded deterministic stages, retaining original identities, scope, uncertainty, rights and null values.
- [x] 3.3 Enforce all graph/call/byte budgets and required-reference completeness. Fail whole operations without partial successful evidence on overflow, missing referenced records or stage failures.
- [x] 3.4 Implement shared deadline/caller cancellation, late-work guards, cleanup, safe error mapping and final result-size checks; retain current product chat/UI behavior.

## 4. Verify and Record Acceptance

- [x] 4.1 Add deterministic query/ranking fixtures covering every permitted field/mode, AND/OR semantics, Unicode, literal special characters, invalid input before I/O, homonyms, UUID ties and candidate boundaries.
- [x] 4.2 Test the actual search SQL against isolated disposable PostgreSQL/Supabase synthetic fixtures, including arrays/aliases, all eligibility states, validation, rank tiers and literal punctuation. Report inability to run these checks separately from mocked tests.
- [x] 4.3 Add service tests for explicit projections/schema/RPC inputs, composite relations, shared/distinct sources, unscoped/absent/missing evidence, primary-image absence, metadata fidelity, all caps and all error codes.
- [x] 4.4 Test raw streamed response-byte limits, cumulative/result sizing, deadline/caller abort including ignored abort and late completion, timer/listener cleanup, and absence of business writes, AI/Storage calls or session authority.
- [x] 4.5 Perform and record actual anon schema/type/grant/RLS/eight-table/RPC smoke verification after scoped setup. Empty-table success is not proof of full row visibility; leave unavailable checks outstanding.
- [x] 4.6 Run `npm run check`, production build, strict OpenSpec and whitespace checks. Retain existing Chromium regressions for application/dependency integration; introduce no public search test page.
- [ ] 4.7 Write verification results and remaining SQL/live limitations, obtain user acceptance and archive only after required gates are satisfied.
