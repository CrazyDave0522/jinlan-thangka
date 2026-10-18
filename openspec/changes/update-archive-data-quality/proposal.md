# Change: Prepare the archive for accountable data collection

## Status

Approved for implementation on 2026-10-18. After the focused thumbnail cleanup, the owner instructed a final check of the remaining proposal and implementation if no blocking issue remained. The final check retains this scope and requires the concrete implementation/concurrency/security tests below; it does not assert that they have passed yet.

The earlier physical unused-field cleanup is completed in [remove-unused-image-thumbnail](../remove-unused-image-thumbnail/proposal.md). This review/ingestion work starts from its accepted post-cleanup main@bf471a9 baseline with eight empty business tables and 123 columns, subject to a fresh remote preflight before application.

## Why

The archive review found that an edited record can remain verified without identifying its reviewer or reviewed version. Source links also accept misspelled field names, and SQL arrays can contain null elements that the application rejects. These problems can be addressed before replacement data arrives.

The owner confirmed that collection involves multiple people or handoffs, that the existing search scope is sufficient, and that no gallery or artwork list is planned soon. The connected review on 2026-10-18 found eight empty business tables with 124 columns matching the reference schema and installed migrations. Emptiness is a review-time observation, not permission to discard later data.

## What Changes

- Keep all eight existing business tables and their relationships, collection responsibility fields, optional descriptive fields, rights metadata and current search scope.
- Add version-bound review attribution for artists, artworks and images. Bind the current status to the current decision, preserve previous decisions in an append-only ledger, and reject stale content or decision versions. Substantive edits require fresh review.
- Validate source-link field names against the target entity's supported business fields, preserving the existing empty-string unscoped value. Reject null elements and nonempty multidimensional text arrays at the database boundary.
- Use the independently approved thumbnail-removal result as the baseline; do not reintroduce that field in the future review/ingestion work.
- Keep new review revision/pointer metadata in retrieved rows for consistency checks and image digests, but exclude it from model fact catalogues and public answer references. Review history remains maintenance data outside the eight-table evidence graph.
- Clarify that citation-specific pages and evidence belong on source links. Keep source-wide notes and normalized years optional; do not remove them on the basis of this review.
- Provide incremental migration, preflight, rollback and verification instructions. Do not rerun the initialization script or seed the owner's archive.

## Impact

- Affected specs: `archive-curation` (new), `thangka-retrieval` (clarified business-evidence scope), and `grounded-answers` (operational metadata boundary). Existing image-interpretation gates must continue to pass with the updated row shapes.
- Affected code: `database/schema.sql`, incremental migrations/read grants, retrieval types/descriptors/row validation, answer fixtures/catalogue compatibility, image row digests and database/setup documentation.
- This adds a review ledger and managed review fields in addition to the retained eight business tables. No existing column is dropped. It does not add application accounts, a management interface, an Excel importer, new search filters, a gallery or model calls.

## Relationship to Release Acceptance

`add-demo-release` remains active: milestone A is accepted for its recorded revision, and B still requires real data, source judgments and permitted pictures. This change does not complete B or reopen historical A results. Its implementation must identify affected checks and record fresh evidence for the eventual final release candidate.

## Deferred Work

- Thumbnail cleanup is delivered separately; its application/deployment verification remains the responsibility of that approved change.
- Direct structured source links for individual artwork/artist attribution candidates.
- Search-query/index alignment after representative data volume and measurements exist.
- Deletion or merging of source-wide notes, normalized dates or optional descriptive fields without a demonstrated semantic replacement.
- A full edit-history system covering every business and relationship table, authenticated curator identity, and review of dependency graphs. This increment records entity-row review decisions; it does not certify every linked source or artist association.

See [design](design.md), [requirements](specs/archive-curation/spec.md), [acceptance cases](acceptance.md), [review findings](review.md) and [tasks](tasks.md). Historical proposal-review evidence does not establish SQL behavior; the owner's subsequent approval and current implementation evidence are recorded separately in [verification](verification.md).
