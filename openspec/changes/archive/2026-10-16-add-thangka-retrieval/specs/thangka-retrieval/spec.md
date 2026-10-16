## ADDED Requirements

### Requirement: Archive evidence retrieval

The system SHALL provide structured server-side artist/artwork lookup and search with matched, no-match and error results, stable candidate identities and literal match reasons. It SHALL preserve ambiguous candidates instead of claiming identification from lexical similarity.

#### Scenario: Distinguish homonyms

- **WHEN** different UUIDs have the same matching name
- **THEN** they remain separate candidates with their own records and evidence
- **AND** a single returned candidate does not establish unique artistic identity or attribution.

### Requirement: Complete archive eligibility

The system SHALL consider all current dedicated archive records and contents eligible, without publication/privacy/review-status exclusion. It SHALL preserve recorded uncertainty, attribution, rights, dates, notes and null values rather than equating eligibility with factual certainty or image usage permission.

#### Scenario: Retrieve an unverified or disputed candidate

- **WHEN** an otherwise relevant record has pending, disputed or unspecified review status
- **THEN** it remains eligible with its original review/attribution metadata
- **AND** its status does not change lexical ranking or establish factual truth.

### Requirement: Validated structured queries

The system SHALL validate strict lookup/search variants before database I/O. Lookup accepts a canonical UUID. Search accepts 1–3 distinct supported filters, outer-trimmed nonblank values of at most 200 Unicode code points, exact/contains modes and an integer limit of 1–10 (default 5). Artist supports name/style; artwork also supports subject/collection/accession. Unknown keys, malformed Unicode and control characters SHALL be rejected.

#### Scenario: Reject invalid input without reading the archive

- **WHEN** input has an unknown key, incompatible field, duplicate filter, invalid UUID, empty value, control character, unpaired surrogate or invalid limit
- **THEN** the result is `invalid_query` before any database call
- **AND** empty input never becomes an unrestricted browse query.

#### Scenario: Normalize identity and preserve text

- **WHEN** input contains an uppercase canonical UUID or outer whitespace around a valid search value
- **THEN** the UUID is lowercased or outer whitespace removed respectively
- **AND** internal text, punctuation and spacing remain unchanged without inferred synonyms or transliteration.

### Requirement: Literal matching and deterministic candidate bounds

The system SHALL use database lowercase equality or literal substring matching over the fields defined in the design. Filters combine with AND; columns/elements within each filter combine with OR. It SHALL rank by summed best filter tiers, then UUID, probe one extra candidate and return at most the requested limit with an honest cap flag. Ranking SHALL NOT imply confidence.

#### Scenario: Preserve special characters as literal text

- **WHEN** a supported filter contains percent, underscore, asterisk, quotes, commas, parentheses or backslashes
- **THEN** these characters have only their literal text meaning
- **AND** no caller value is interpolated into SQL or PostgREST filter expressions.

#### Scenario: Order matching tiers

- **WHEN** candidates match primary, translated or array fields
- **THEN** each filter uses its best tier: exact primary 0, translated 1, array 2, then substring primary 3, translated 4, array 5
- **AND** contains-mode full equality earns the exact tier, totals sort ascending with UUID ties, and reasons identify each matching column and its actual mode.

#### Scenario: Report capped candidates

- **WHEN** more matching candidates exist than the requested limit
- **THEN** the extra probe is omitted and `candidateLimitReached` is true without an exact-total or exhaustive-search claim
- **AND** exact-ID lookup returns zero or one root without candidate truncation.

### Requirement: Stable relation identity and scoped evidence

The system SHALL preserve entity/source/link UUIDs and `(artwork_id, artist_id, role)` association identity. It SHALL expand root associations once, counterpart entities, selected artworks' image metadata and all selected entities' source links/sources. It SHALL preserve field/page scope, deduplicate sources only by UUID and identify traversal as `root-associations-v1`.

#### Scenario: Preserve roles and shared evidence

- **WHEN** an artwork/artist pair has several roles and several field-specific links share a source
- **THEN** every composite association and source-link UUID remains separate while the source row is deduplicated
- **AND** same-title sources with distinct UUIDs remain separate.

#### Scenario: Keep finite traversal honest

- **WHEN** an artist search expands related artworks
- **THEN** it does not recursively expand those artworks' other artist associations
- **AND** completeness of root associations is not a claim that expanded neighbors have no other associations.

#### Scenario: Preserve absent and unscoped evidence

- **WHEN** a selected entity has no source links, or a link has empty supported field/locator
- **THEN** retrieval preserves an empty evidence collection or the original unscoped link respectively
- **AND** no unrelated field support, missing page or bibliographic value is invented.

#### Scenario: Return metadata without requiring a primary image

- **WHEN** selected artwork images have no primary image or uncertain rights
- **THEN** available image metadata retains those states without requiring a primary image
- **AND** retrieval returns no downloaded bytes or generated public/signed URLs and makes no permission claim.

### Requirement: Bounded complete graph results

The system SHALL enforce caps of 100 entity rows, 100 associations, 200 source links, 100 sources and 12 database calls. Response bytes SHALL be capped before parsing at 2,000,000 per response and 8,000,000 cumulatively; final UTF-8 JSON at 2,000,000. Noncandidate overflow SHALL fail as `budget_exceeded` without usable partial evidence. Explicit projections SHALL include all current columns of the eight tables.

#### Scenario: Detect expansion or payload overflow

- **WHEN** a graph stage exceeds its remaining row cap, an additional database call exceeds its cap, or a response/result exceeds its byte budget
- **THEN** the whole operation returns `budget_exceeded`
- **AND** it does not silently truncate evidence, notes or related entities to claim completeness.

#### Scenario: Preserve complete selected visible evidence

- **WHEN** all finite graph stages succeed within budgets
- **THEN** the result has `evidenceCompleteForReturnedGraph: true` for that visible finite traversal
- **AND** the flag does not establish global visibility, uncapped search, source truth, rights or a transaction-consistent snapshot.

### Requirement: Honest empty and failed retrieval

The system SHALL distinguish no visible matches from invalid input, configuration, access, schema, timeout, cancellation, budget, incomplete-data and query failures. Missing referenced roots/counterparts/sources or failed evidence queries SHALL fail the whole operation without usable partial rows. Empty API lists SHALL NOT prove unrestricted visibility or global emptiness.

#### Scenario: No visible match

- **WHEN** a valid root query succeeds with zero visible candidates
- **THEN** the result is `no_matches` with no candidate cap claim
- **AND** unrestricted archive visibility still requires separate grant/RLS verification.

#### Scenario: Evidence cannot be resolved

- **WHEN** a required source/counterpart/root is missing or hidden, or a relation query fails
- **THEN** the result is `data_incomplete` or the corresponding query error
- **AND** it exposes no successful partial graph or raw SQL/credential-bearing error message.

#### Scenario: Cancel or time out the operation

- **WHEN** the caller aborts or the shared 5,000 ms deadline expires across reads, mapping and serialization
- **THEN** all pending reads receive cancellation and the result is `aborted` or `timeout` respectively
- **AND** late completions cannot replace that result; timers/listeners are cleared and no automatic retry runs.

### Requirement: Server-only read boundary

The system SHALL use a server-only stateless anon reader with explicit `thangka` selection and the existing public URL/key, without session-cookie authority or elevated keys. Runtime operations SHALL only read. Search SHALL use a bounded validated STABLE SECURITY INVOKER function with fixed qualified expressions, empty search path and no dynamic SQL. Its scoped setup SHALL be incremental and preserve business data.

#### Scenario: Keep application behavior and archive authority separate

- **WHEN** retrieval is integrated
- **THEN** it adds no public application search route/UI, AI call, Storage operation or changed chat response
- **AND** its anon Data API SELECT/RPC permission is intentionally public-key accessible rather than made private by server-only imports.

#### Scenario: Configure scoped read access

- **WHEN** search-function/read access setup is needed
- **THEN** existing grants/RLS are inspected and reviewed incremental setup targets only necessary schema SELECT and exact function execution
- **AND** no initializer rerun, business-row mutation, blanket routine grants or silent deletion of existing policies occurs.

### Requirement: Verified database integration

The system SHALL verify deployed schema, generated types, custom schema exposure, effective anon grants/RLS and actual eight-table/RPC reads before claiming live integration. Deterministic tests SHALL use isolated synthetic data and mocks, with actual SQL function tests reported separately. Unperformed SQL/live checks SHALL remain explicit acceptance gates.

#### Scenario: Verify empty deployed tables

- **WHEN** deployed tables contain no project records
- **THEN** schema/access inspection and read-only no-match smoke checks can proceed without requiring owner-provided artwork data
- **AND** no synthetic fixtures are inserted into the owner's database or empty lists substituted for policy verification.

#### Scenario: Report unavailable integration checks

- **WHEN** only local/mocked tests can run
- **THEN** the report identifies SQL/live checks as outstanding
- **AND** mock success does not certify real SQL matching, permissions or archive integration.
