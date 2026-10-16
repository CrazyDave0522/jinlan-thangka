## Context and Status

This is the refined design for roadmap item 4 on `feat/add-thangka-retrieval`. The owner approved implementation on 2026-10-16; implementation, remote setup and technical verification are complete; the owner has reviewed and accepted the implementation; archived at the owner's explicit request on 2026-10-16. The owner confirmed that all current dedicated archive records and contents are eligible for retrieval/use, including pending/disputed/unspecified review states and relevant notes. The existing eight tables are empty; synthetic tests need no real artwork data. An initial smoke attempt returned `PGRST106`; after owner configuration all eight tables and the RPC return HTTP 200. Live-generated type and final table/RPC metadata comparisons pass; the owner has reviewed and accepted the implementation; archived at the owner's explicit request on 2026-10-16.

## Documented Schema Baseline

The supplied table structure is already documented in [database.md](../../../../docs/database.md) and fully defined, including column types/defaults/nullability/checks and relationships, in [schema.sql](../../../../database/schema.sql). Use that structure as the implementation baseline; no table-field clarification or repeated schema submission is currently needed from the owner.

The eight tables and all search fields in this design have been checked against those definitions. Artist aliases/styles and artwork alternative titles/styles are text arrays; multilingual names/titles and subject/collection/accession fields are text. `artwork_artists` uses its composite key, source relationships have UUID IDs plus owner/source foreign keys and field/location/evidence columns, and primary-image status exists only on `images`. Overall artwork attribution and per-artist association attribution use different allowed values and must retain distinct types.

Live verification means checking deployment agreement and working access, not an unresolved question about the supplied field definitions. Proceed from the documented schema after proposal approval; ask the owner for a specific table/column only if an actual discrepancy or undocumented semantic issue is discovered, naming the expected and observed difference. Type generation and the new candidate function's installation remain implementation tasks rather than missing owner input.

## Goals / Non-Goals

- Goals: bounded server-only structured retrieval, deterministic literal matching, real identities and field-scoped evidence, explicit no-match/error/cap behavior, and a verifiable read-only database integration.
- Non-goals: AI generation, conversational intent extraction, visual matching, embeddings/vector infrastructure, public application search endpoints/UI, external-source downloading, archive imports, Storage provisioning, visitor-image persistence, login or administration UI.

## Server Boundary and Inputs

Implement `retrieveArchive(query, { signal? })` in a server-only module. Domain validation/mapping can be pure modules for unit tests; database/network orchestration and configuration must not enter client bundles. Retain current `/api/chat` behavior; later generation calls this service deliberately.

```typescript
type ArchiveQuery =
  | { kind: "lookup"; entity: "artist" | "artwork"; id: string }
  | { kind: "search"; entity: "artist" | "artwork";
      filters: Array<{ field: "name" | "subject" | "style" | "collection" | "accession";
        value: string; mode: "exact" | "contains" }>;
      limit?: number };
```

Validate before any database call: known keys/variants only, canonical UUID identity (accept uppercase hex and normalize to lowercase), 1–3 filters, distinct fields, nonblank outer-trimmed values of at most 200 Unicode code points, well-formed Unicode and no control characters. Preserve internal spacing/text; no stemming, accent folding, transliteration, synonym invention or punctuation removal. `limit` defaults to 5 and must be an integer 1–10, without string coercion. Artist filters support `name` and `style` only; artwork supports all listed fields. Invalid input returns `invalid_query`, not an empty archive result. An empty query never becomes a browse-all operation.

Filters combine with AND. Alternative columns/elements within a filter combine with OR. There is no cross-entity search or standalone source/image keyword search in this increment; sources/images are expanded as evidence/metadata. A UUID lookup is authoritative only about the requested record identity, not about artistic attribution or image identification.

## Literal Matching and Ordering

Use a small new database function `thangka.search_archive_candidates(p_entity text, p_filters jsonb, p_limit integer)` for search. It returns candidate UUID, integer rank and ordered match reasons; it never returns or executes SQL supplied by a caller. Add it via a separate incremental SQL file after implementation approval, not by rerunning `database/schema.sql`.

The function is `STABLE`, `SECURITY INVOKER`, with an explicit empty `search_path` and fully qualified relations. It performs only SELECTs and fixed allowlisted expressions; use JSON parameters/`CASE`, not dynamic SQL. Mirror input validation so direct RPC calls cannot remove its caps or select arbitrary columns. It respects caller grants and RLS and cannot elevate access. Return at most `p_limit + 1`, with p_limit restricted to 1–10. UUID lookup uses direct typed equality and no RPC.

Case-insensitive matching uses PostgreSQL `lower` under the deployed database collation, consistently for scalar and array elements. `exact` means full-value equality after lowercasing, not approximate similarity. `contains` uses literal `strpos(lower(stored_value), lower(value)) > 0`; `%`, `_`, `*`, quotes, commas, parentheses and backslashes have no filter-language meaning. Do not concatenate values into PostgREST `.or()` strings or LIKE patterns. SQL NULL never matches; arrays are examined element by element using their real values.

| Filter | Fields and priority |
| --- | --- |
| Artist name | `display_name` primary; `name_bo`, `name_en` translated; `aliases` array |
| Artwork name | `title` primary; `title_bo`, `title_en` translated; `alternative_titles` array |
| Artwork subject | `subject_primary`, then `subject_details` as primary scalar fields |
| Style | `styles` array for either entity |
| Artwork collection | `collection_name` primary scalar |
| Artwork accession | `accession_number` primary scalar |

For each filter, keep one match reason per matched column in the above fixed order, with that column's actual exact/contains match information. Use its best rank: primary scalar exact 0, translated scalar exact 1, array-element exact 2, primary scalar substring 3, translated substring 4, array-element substring 5. In contains mode a full-value equality still earns the exact tier. Sum best ranks across filters and sort ascending, then by UUID ascending. Neither review state, evidence availability nor rights flags alter eligibility/rank. Scores are match-order values, never confidence probabilities.

Probe one extra candidate. Remove only the probe from returned roots and set `candidateLimitReached=true`; use no exact total or universal-match claim. Preserve same-name distinct UUIDs, including two exact matches. Later consumers must not infer unique identity from a single capped result. No pagination/cursor is exposed now; refine search or exact-lookup the desired UUID. Exact-ID lookup returns zero or one root and no candidate truncation.

## Budgets and Graph Expansion

| Boundary | Initial cap |
| --- | --- |
| Returned root candidates | Default 5, maximum 10, plus one database probe |
| Distinct artist/artwork/image entity rows across the expanded graph | 100, including roots and counterpart entities |
| Artwork-artist association rows | 100 |
| Total artist/artwork/image source-link rows | 200 |
| Distinct source rows | 100 |
| Database HTTP calls per operation | 12, including the candidate RPC |
| Per-response bytes before SDK JSON parsing | 2,000,000 |
| Cumulative database response bytes | 8,000,000 |
| Final result bytes | 2,000,000 UTF-8 JSON bytes |
| Whole operation deadline | 5,000 ms, shared across all calls, mapping and serialization |

Batch IDs with typed `.in()` values from validated UUIDs; query an entire relevant stage with at most remaining budget plus one probe, with deterministic primary-key ordering. Any graph/byte/request-count cap overflow returns `budget_exceeded` and no usable partial graph. Do not discard some evidence, shorten notes or omit an artist just to fit. Only root candidate truncation is a successful bounded result. This deliberately makes consumer completeness rules simple.

Expand a finite graph in stages:

1. Search candidate IDs/ranks/reasons or exact-lookup a root, then fetch complete selected root rows. Restore candidate rank order after an `.in()` fetch.
2. Read `artwork_artists` where the root artist/artwork IDs match, preserving `(artwork_id, artist_id, role)` as identity. Fetch counterpart artworks or artists by ID. Follow associations only from roots, not recursively from newly discovered neighbors; do not traverse cycles or expand all artists' other works.
3. Read image metadata for every selected artwork, ordered by `artwork_id`, `is_primary DESC`, then image UUID. A missing primary image is valid. Return all image records within budgets with rights/review metadata, not image bytes, public/signed URLs or a claim of usage permission.
4. Read source-link rows for all selected artists/artworks/images, preserving link UUID, owner kind/ID, source ID, `supported_field`, `locator`, `evidence_notes`, timestamps and original null/empty states.
5. Fetch referenced sources by unique UUID and deduplicate source records by UUID only. Keep every distinct link, even when several links share a source. Distinct same-title sources/editions remain distinct.

Returned rows include explicit columns from the existing schema, not `.select('*')` drift. Initial entity/source/link projections include all current columns of the eight documented tables; list them explicitly in typed constants during implementation. All contents are allowed; this projection preserves notes/collection details and avoids an unrequested confidentiality filter. Whole-result/response budgets prevent oversized text from producing unbounded successful output; no per-field silent truncation. Keep numeric/null/array/date values faithful to confirmed generated types.

No source links is a valid empty evidence collection. A link with a missing/hidden source, missing counterpart row or missing selected root is `data_incomplete` and fails the operation without a usable partial graph. A source with empty bibliographic fields is still returned as recorded; an empty supported field or page is explicitly unscoped/unspecified, not universal support. A database-stage error also fails the whole operation. Concurrent archive changes can produce `data_incomplete`; do not pretend separate Data API reads form a transaction-consistent snapshot. No automatic retry is performed in this increment; the consumer may deliberately try again.

## Result and Failure Contract

```typescript
type RetrievalResult =
  | { status: "matched"; query: NormalizedArchiveQuery;
      candidates: Array<{ entity: "artist" | "artwork"; id: string;
        rank: number; matches: Array<{ field: string; column: string; mode: "exact" | "contains" }> }>;
      graph: { artists: ArtistRow[]; artworks: ArtworkRow[]; images: ImageRow[];
        artworkArtists: ArtworkArtistRow[]; sourceLinks: EvidenceLink[]; sources: SourceRow[] };
      candidateLimitReached: boolean; traversal: "root-associations-v1";
      evidenceCompleteForReturnedGraph: true }
  | { status: "no_matches"; query: NormalizedArchiveQuery; candidates: [];
      candidateLimitReached: false }
  | { status: "error"; error: { code: RetrievalErrorCode } };
```

`EvidenceLink` is a discriminated union by owner kind (`artist`, `artwork`, `image`), with `entityId` and the original typed source-link row. Preserve the row's real owner foreign-key column and UUID; do not replace the relationship with only a source ID. Match reasons follow input-filter order and then the fixed column order; multiple matching elements in one array produce one reason for that column, using its best exact/contains tier.

Runtime `*Row` validation descriptors and CHECK-state constraints derive from the supplied SQL and match the live-generated row types; the SDK uses `database.generated.ts`, generated from the actual project after CLI login. For exact lookup, the root candidate has rank 0 and an explicit ID match reason. In the implementation type, permit `field: "id"`, `column: "id"`, `mode: "exact"` for that reason.

`evidenceCompleteForReturnedGraph` only means successful complete expansion of the selected visible graph under the approved finite traversal. `traversal: "root-associations-v1"` identifies the finite expansion contract: association completeness applies to roots only. An expanded artwork from an artist search must not be assumed to have no other artists merely because those other associations were not traversed. It does not assert full database visibility, exhaustive search when `candidateLimitReached`, independent factual verification, source correctness, image rights or a globally consistent database snapshot. Nullable pending/disputed review states and attribution uncertainty remain in row metadata for downstream interpretation.

| Error code | Meaning |
| --- | --- |
| `invalid_query` | Rejected shape/field/value/UUID/limit, before querying |
| `configuration_error` | Missing/malformed public Supabase URL or publishable key |
| `access_denied` | Explicit grant/authentication/permission failure |
| `schema_mismatch` | Missing table/column/function or incompatible row/result shape |
| `timeout` | Shared deadline expired |
| `aborted` | Consumer signal canceled |
| `budget_exceeded` | Noncandidate cap or response/result budget exceeded |
| `data_incomplete` | Required referenced root/counterpart/source not returned |
| `query_failed` | Other network, database or unexpected processing failure |

Return no raw SQL, credential-bearing messages or hidden partial rows in errors. Keep the stage and safe code available to local verification without recording secrets. Preserve the original cause only server-side if needed for debugging; do not log user conversation/image contents. Schema and data-shape validation failure is not a no-match result.

Use a single AbortController composed with the caller signal and operation timer; pass its signal to every SDK query/RPC and bounded-response fetch wrapper. Clear timer/listeners on settlement and guard late work even if a mocked fetch ignores abort. The deadline covers mapping and result sizing too; check between stages. Aborting HTTP does not guarantee immediate database execution cancellation, so do not claim a hard SQL-runtime ceiling. Query caps do not prove optimal query plans; real-data/index tuning can follow measured evidence.

## Client and Access Configuration

Create a new server-only archive reader using the existing public URL/publishable key, explicit `thangka`, `persistSession:false`, no cookie/user-session propagation and no provider/service-role secret. The intended demo reader is the unauthenticated `anon` database role. Each operation has isolated signal/budget tracking; do not reuse the session-refresh helper as an implicit authority or shared user cache. Avoid Next.js shared caching for this service initially.

The application module is server-only and no public application route is added. The proposed database read/RPC permission for anon is intentionally usable through Supabase's Data API by a holder of the public key; server-only imports are not an access restriction on the database API. This is consistent with the confirmed all-content eligibility. Do not grant INSERT/UPDATE/DELETE, broad routine execution, or modify unrelated schemas. Do not use elevated keys to hide a misconfigured read policy.

The implementation includes separate incremental setup artifacts for the one SECURITY INVOKER search function and scoped read grants/RLS SELECT policies. Inspect existing grants/policies first; do not blindly drop existing policies or use the initializer. Existing write privileges/policies that conflict with the intended read-only role must be identified and reconciled explicitly before certifying access. The owner's product decision authorizes all records for retrieval but is not proof that live settings already match. No remote setup occurs during proposal refinement.

See [docs/retrieval-setup.md](../../../../docs/retrieval-setup.md) for the exact read-only verification checklist, type generation and environment instructions. No sample dataset or secrets in chat are required. If live verification/setup is unavailable, local implementation and synthetic tests may proceed, but completion must explicitly report the integration gate as outstanding rather than claim a working real archive reader.

## Testing and Completion

- Pure/query tests: strict inputs before I/O, all supported field/entity/mode combinations, AND versus OR, Unicode/internal whitespace and literal special characters, deterministic ranking/UUID ties, homonyms, candidate probe boundaries and ID lookup.
- Database-function tests: run the actual incremental function against synthetic data in an isolated local/disposable PostgreSQL/Supabase instance where available, including aliases/arrays, punctuation and ties. Mocks alone cannot validate SQL matching. No fixtures in the owner's database.
- Service tests: exact schema/projections/RPC parameters, bounded staged reads, composite identities, shared/same-title sources, all review states, original/null values and rights metadata, missing source/neighbor, zero relations, image primary handling, caps plus one, raw response-byte limits, deadlines/caller abort/late results and every error code, no writes/provider/Storage access.
- Live acceptance: record schema/RLS/grant/type comparison and actual anon metadata/empty-query smoke results separately. An RLS-filtered empty response is not global emptiness; no exact visibility claim from empty tables alone.
- Existing product/build regression: `npm run check`, production build, strict OpenSpec and whitespace checks; retain existing Chromium regressions when integrating dependencies/configuration. No invented public search test page or new responsive screen. Later AI integration owns browser tests of consuming this evidence.
- Record which tests ran, SQL/live checks that could not run and remaining gates. Passing mock unit tests is not a substitute for SQL/access validation.

## Deferred Work and References

No owner product choice remains open. Model/intent planning, provider/image matching and real-data relevance evaluation remain later work. A material change to the explicit traversal/caps/result semantics must update the proposal rather than be hidden during implementation.

Official documentation reviewed during refinement:

- [Supabase abortSignal](https://supabase.com/docs/reference/javascript/using-modifiers-abortsignal)
- [Type generation](https://supabase.com/docs/guides/api/rest/generating-types)
- [Custom schema access](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Grant versus RLS empty-result semantics](https://supabase.com/docs/guides/getting-started/api-keys)
