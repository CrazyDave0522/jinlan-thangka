# Thangka Retrieval Proposal Consistency Review

## Outcome

Refined on 2026-10-16 against the active proposal, design, delta, tasks, project context, roadmap, database guide, setup checklist and reference SQL. The review established readiness; the owner subsequently approved implementation. Local service/SQL/tests are now implemented, with results in [verification.md](verification.md). The owner subsequently applied the approved function/read-access setup; final metadata and anon smoke checks pass, as recorded in verification.md. No owner product decision remains unanswered.

The owner-approved direction is unchanged: all dedicated archive contents are eligible, including notes and uncertain records; runtime retrieval is server-only/read-only; current chat behavior remains unchanged. Empty existing tables do not require owner-provided sample data. The new database function is a planned incremental setup change, not a business-data write; the owner deployed it and supplied matching function metadata.

## Supplied Table Structure Recheck

Rechecked `docs/database.md` and all eight CREATE TABLE definitions, constraints and relationship notes in `database/schema.sql`. The existing documentation supplies the fields/types required by the proposal; there are no outstanding field-definition questions for the owner. Search-field mappings, array handling, composite association identity, source-link scope and separate attribution states match that baseline. No additional schema export or real data is requested.

Deployment/access verification is a separate integration check, not a reason to treat the documented structure as missing or block local implementation after approval. Request a specific clarification only when a concrete discrepancy is found.

## Resolved Refinement Items

| Area | Selected rule |
| --- | --- |
| Input | Artist/artwork UUID lookup or 1–3 structured, distinct filters; name/style for artist, plus subject/collection/accession for artwork; exact/contains; 200-code-point values |
| Literal matching | PostgreSQL lowercase equality/strpos over fixed scalar/array fields, no model SQL, dynamic SQL or concatenated filter expressions |
| Ranking | Best field tier per filter, sum then UUID; per-column literal match reasons; no confidence or unique-identity claim |
| Root bounds | Default 5, maximum 10; one extra probe; honest candidate cap flag, no exact count/cursor |
| Projection and graph | Explicit current columns of eight tables; root associations once, counterpart entities, images, scoped source links and deduplicated sources |
| Identity | UUIDs for records/source links; composite `(artwork_id, artist_id, role)` for associations; same names/titles never imply identity |
| Budgets | 100 entities, 100 associations, 200 links, 100 sources, 12 calls; 2,000,000 bytes per response/final result, 8,000,000 cumulative response bytes, 5,000 ms shared deadline |
| Completeness | Only root truncation succeeds; oversized/incomplete/failed graph expansion fails without usable partial evidence; finite traversal explicitly identified |
| Empty and failure | No visible matches differs from invalid/configuration/access/schema/timeout/abort/budget/incomplete/query errors; RLS can hide rows without an error |
| Application boundary | New stateless server-only anon reader, public URL/key, explicit schema, no user cookies/shared cache/elevated secret; no new product route/UI or AI/Storage operation |
| Database setup | Incremental validated STABLE SECURITY INVOKER function and scoped read access after existing metadata inspection; no initializer rerun, broad write/routine grants or silent policy replacement |
| Verification | Actual SQL tests on isolated synthetic fixtures; live schema/types/grants/RLS/Data API smoke checks separately from mocked tests; no artificial data in the owner's database |

Detailed normative scenarios are in [spec.md](specs/thangka-retrieval/spec.md); implementation decisions and numeric budgets are in [design.md](design.md); executable delivery work is tracked in [tasks.md](tasks.md). [retrieval-setup.md](../../../../docs/retrieval-setup.md) provides the read-only inspection/type-generation procedure.

## Accepted Limits and Outstanding Execution

- This phase uses structured lexical retrieval; later orchestration owns conversational intent extraction, AI answers, visual matching and citation presentation. No real-data relevance evaluation is claimed from empty tables.
- Application server-only code does not privatize Supabase's intentionally anon-readable Data API. Eligibility does not establish factual certainty or image usage permission.
- Completeness covers only the selected visible finite graph. Expanded neighbors' other associations are not traversed; separate HTTP reads are not a database snapshot.
- HTTP cancellation limits application waiting but does not guarantee immediate SQL cancellation. Query performance/index work follows actual evidence.
- Owner-supplied deployed columns/constraints, final grants/RLS and function metadata match the approved contract; anon table/RPC smoke checks pass. The owner completed CLI login and live-generated types are now saved, used by the SDK and compared successfully. Defaults/indexes/triggers have not been independently inspected.
- SQL function tests must run the real SQL; mocked SDK tests cannot validate its matching behavior. Existing application checks/Chromium regressions remain relevant when integrating; no invented browser search page is needed.

These are specified implementation/acceptance tasks rather than unresolved requests for owner data or secrets. No remote setup is performed by this review.
