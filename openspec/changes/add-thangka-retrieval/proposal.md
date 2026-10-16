# Change: Thangka database retrieval

## Status

Selected for refinement on 2026-10-16, item 4 of 8, on `feat/add-thangka-retrieval` based on merged `main` at `0490ac9`. Interface, text conversation, and page-local image submission are implemented, accepted, archived and merged. The owner approved implementation on 2026-10-16. The server retrieval service, incremental SQL and local tests are implemented; the owner completed remote setup and anon smoke checks now pass for all eight tables and the RPC; live-generated type and final metadata/access checks pass; the owner has reviewed and accepted the implementation; archival remains pending. See [verification.md](verification.md).

## Why

Future grounded answers and image interpretation need relevant archive records and field-level supporting evidence. Retrieval must distinguish an empty archive, ambiguous records, missing evidence and an actual database failure without inventing an answer.

## Confirmed Archive Eligibility

On 2026-10-16 the owner confirmed that this database was created specifically for retrieval and the demo: all current archive records and contents are eligible for retrieval/use at this stage. There is no private/internal-only collection or publication filter to design. Do not exclude records or otherwise relevant fields merely because their review status is pending, disputed or unspecified, or because a field is named notes/collected_by. Project only fields needed by the retrieval contract for relevance and payload control, not as an invented confidentiality rule.

Retain review, attribution and evidence states so later answers can express uncertainty; eligibility does not turn an unverified or disputed claim into established fact. The application retrieval boundary remains server-only/read-only; database read configuration must still be verified technically rather than assumed from this product decision.

## Intended Scope

- Provide a server-only retrieval service over the existing eight `thangka` tables. Use structured lookup/search inputs rather than model-generated SQL.
- Retrieve artists/artworks and their related artist associations, image metadata and source relationships. Preserve entity/source UUIDs and source-link IDs, `supported_field`, `locator` and `evidence_notes`. Preserve each `artwork_artists` association by its actual composite key `(artwork_id, artist_id, role)`; this table has no standalone `id`.
- Support exact record identity and a bounded initial lexical/filter search over explicitly selected names/titles/aliases, subjects, styles, collection names and accession numbers. Use literal case-insensitive exact/contains matching, AND filters, deterministic rank/UUID ordering, default 5 and maximum 10 candidates; no embeddings/vector service is assumed.
- Keep identically named records separate. Return candidates and their match reasons without claiming a unique artwork identity, authorship certainty, or sufficient evidence from lexical similarity.
- Preserve review/attribution/rights states, original date wording, missing values and conflicting evidence. Do not turn an unrelated source attached to a record into support for every field.
- Define matched/no-match/error outcomes, a 5-second operation deadline, explicit graph/response budgets, and downstream evidence contracts. Expand root associations once, image metadata and field-scoped sources; any incomplete or oversized evidence expansion fails without a usable partial graph.
- Add a narrowly scoped, validated SECURITY INVOKER candidate-search function through incremental SQL after approval. Runtime operations remain read-only; the setup artifact creates a function and establishes only the reviewed SELECT/exact-function access, without modifying business records.
- Verify actual schema, generated types and intended read permissions before claiming live integration. No initializer rerun, business data mutation, broad grants or private-key exposure.

## Boundaries

This requirement does not add a search UI or public archive endpoint, change the existing conversation/AI-unavailable behavior, integrate DeepSeek, extract search terms from arbitrary conversational language, identify images, fetch arbitrary external sources, provision artwork Storage, import a dataset, or write visitor images to Storage. Later orchestration maps conversation intent to structured retrieval input.

The owner has already confirmed empty existing tables and no artwork images/buckets. No real dataset is requested for routine implementation/testing. Use explicitly synthetic related fixtures in tests; do not seed them into the user's database or product. All-record eligibility does not mean returning the entire archive for every search; bounded relevance-based retrieval is still required. Empty tables are a valid live empty-result case once schema/access are verified, not proof that lexical relevance or image matching works with real data.

## Dependencies and Consumers

No new UI dependency. Current project/database conventions are in [project.md](../../project.md) and [database.md](../../../docs/database.md). The existing source schema is a reference for verification, not an incremental migration.

`add-grounded-answers` consumes structured evidence; `add-image-interpretation` consumes candidate/rights-aware image metadata; `add-answer-sources` consumes exact record/source relationships. This requirement must not assert that any of those consumers is already implemented.

## Refined Decisions

[design.md](design.md) fixes query/result/error types, permitted fields, literal Unicode matching, ranking, root probing, finite graph traversal, projections, numeric budgets and cancellation behavior. [docs/retrieval-setup.md](../../../docs/retrieval-setup.md) specifies schema/grant/RLS inspection, incremental setup, type generation and live smoke verification. [review.md](review.md) records how consistency gaps were resolved. No owner product choice remains open.

An API empty list establishes no visible matches, not unrestricted visibility: RLS can filter rows without an error. SQL function tests must exercise the real function with isolated synthetic fixtures; mocked SDK tests do not establish SQL or live access correctness. No remote permissions, functions or credentials have been changed during refinement. The owner subsequently approved implementation and applied the reviewed setup. Final table/RPC metadata, anon smoke checks and live-generated type comparisons now pass.

## Verification

Add isolated SQL function tests and deterministic unit/service tests for identities/duplicate names, Chinese and alternate names, literal filter handling, subjects/styles, ordering/limits, relation/source mapping, missing evidence, disputed attribution and rights metadata, empty results, timeouts and query failures. Inspect Supabase boundary calls to verify explicit `thangka` selection, bounded reads, safe structured inputs and no writes/provider calls.

Use an explicit, separately reported read-only live verification for deployed schema/access when the environment supports it; mocked tests cannot establish actual grants or RLS behavior. Keep the existing browser/production checks when integrating with the application, and do not create an unrequested public test page just to demonstrate server retrieval. Follow the normal `npm run check`, production build and strict OpenSpec validation workflow.
