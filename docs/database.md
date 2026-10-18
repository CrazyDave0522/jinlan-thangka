# Thangka database structure and integration conventions

The initial archive uses PostgreSQL 13+ with all business tables in the `thangka` schema. The [schema reference](../database/schema.sql) contains complete fields, constraints, collection value mappings, and Excel import rules. This document describes the structure supplied on 2026-10-15; verify the deployed database before integration.

`database/schema.sql` started from the supplied initialization structure, with comments and collection labels translated into English, and incorporates reviewed structural changes. It is outside automatic migration directories and targets a new database. It creates objects within a transaction; existing objects cause an error and rollback. Do not rerun it against an existing business database. Use separate incremental migrations for existing databases.

## Tables and relationships

| Table             | Purpose and relationships                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `artists`         | Artist names, multilingual names, aliases, biographies, schools, and institutions                                                           |
| `artworks`        | Artwork titles, overall attribution, dates, subjects, materials, dimensions, and collection information                                     |
| `images`          | Each image belongs to one artwork and stores paths, primary status, rights, and technical metadata                                          |
| `sources`         | Books, papers, institutional archives, webpages, interviews, and edition details                                                            |
| `artwork_artists` | Many-to-many artwork and artist relationships, including role and candidate attribution; the primary key combines artwork, artist, and role |
| `artist_sources`  | Artist citations with supported fields, citation locations, and specific evidence                                                           |
| `artwork_sources` | Artwork citations with supported fields, citation locations, and specific evidence                                                          |
| `image_sources`   | Image citations with supported fields, citation locations, and specific evidence                                                            |

All business tables except `artwork_artists`, which has a composite primary key, use database-generated UUIDs for `id`. Every business table has creation and update timestamps; update triggers maintain `updated_at`. Foreign keys use `ON DELETE RESTRICT`, so dependent records must be handled explicitly before deletion. The separate `archive_reviews` ledger stores immutable decisions/snapshots and a database-generated order/time rather than an editable `updated_at`.

Artists, artworks and images also have database-managed content revisions/current-review pointers. Their [maintenance workflow](archive-curation.md) retains collection responsibility, resets review after content edits and prevents stale approvals. The ledger is outside the eight-table answer graph; new technical fields remain in consistency/digest checks but are not model facts.

## Development and import conventions

- Artist names, artwork titles, and source titles are not unique and cannot serve as unique relationship or upsert keys. Imports must persist original-record-to-UUID mappings and require manual confirmation for ambiguous matches.
- Do not create placeholder artists for unknown authorship. The artwork `attribution_status` describes overall attribution, while `artwork_artists.attribution_status` describes a specific candidate. These are separate concepts. `not_recorded` differs from an explicitly `unknown` artist.
- Only `images.is_primary` records primary image status; artworks have no primary image path or ID. A partial unique index allows at most one primary image per artwork, including none. To switch images, clear the old flag before setting the new one in the same transaction.
- Images use a stable `storage_locator`, unique within each artwork. The `sha256` index is not unique, so the same file may appear in multiple records. Temporary signed URLs must not serve as persistent identifiers.
- Separate thumbnails are outside the current conversation product. The unused `thumbnail_locator` field is removed by the reviewed [incremental cleanup](../database/migrations/20261018_remove_image_thumbnail.sql); collection templates should not request it. Deployment/type verification is recorded [separately](../openspec/changes/remove-unused-image-thumbnail/verification.md).
- An accessible image or reviewed record does not grant permission to display the image or send it to a vision model. Evaluate `rights_status`, license evidence, and `permission_notes` for the intended use.
- Preserve original period wording as text; populate normalized years only with evidence. Dimensions must be positive, with unknown values left blank. AI inferences, vectors and chats remain future work; row-review history now has its own operational ledger. Model output must not automatically overwrite human-curated information.
- Store citation pages and specific facts on source relationships using `locator`, `supported_field`, and `evidence_notes`. Source records retain bibliographic information and collection wording; conflicting sources may support the same field.

Import sources, artists, artworks, artist relationships, images, and source relationships in that order. Preserve each original Excel batch, preview and resolve ambiguities, then write within a transaction. Complete field mappings appear at the end of the SQL file; collection labels are English translations of the supplied template labels.

## Clarifications to the supplied instructions

1. The supplied `images.is_primary` comment referred to matching a primary image path in the artwork table, but the database artwork table has no such field. The translated comment and import rule 8 clarify that this refers to the Excel artwork template. The database stores primary image status only in `images`.
2. The instruction to normalize blanks to `NULL` needs field-specific handling. Nullable fields may use `NULL`; blank arrays become empty arrays and API writes use arrays rather than semicolon-delimited strings. Unspecified source relationship fields `supported_field` and `locator` use empty strings. Omit required fields with defaults to use those defaults, or supply valid values. Missing required names, titles, or image paths must produce an error. Explicit `NULL` does not invoke a default. Updates must distinguish retaining a value, clearing it, and resetting it to a default. Template arrays use fullwidth semicolons (U+FF1B) as described in the supplied import rules.
3. Each source relationship table requires a unique combination of entity, source, supported field, and citation location. Multiple statements from the same source at the same location about the same field must be combined in that relationship's `evidence_notes`, rather than inserted as duplicate relationships.

These clarifications and translations do not change table definitions, constraints, indexes, or triggers.

## Supabase integration requirements

The current clients do not specify the business schema. Future queries must explicitly select `thangka`, for example `supabase.schema('thangka').from('artworks')`, or configure `db.schema` on the client. Data API access also requires exposing the schema in Supabase and granting the necessary permissions to the intended roles. See the [official custom schema guide](https://supabase.com/docs/guides/api/using-custom-schemas).

The initializer does not grant public business reads or create login accounts. It enables RLS without visitor policies on the operational review ledger and restricts new maintenance functions; existing business read setup remains separate. The owner confirms that all dedicated business archive records/contents remain eligible. Configure and verify intended read-only access; no collection/review application interface or visitor write authority is added. Trusted SQL maintenance is described separately. A publishable key alone does not provide access control. See the [official RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

Before integration, verify the deployed structure, exposed schemas, role grants, and RLS policies, then generate TypeScript types that include `thangka` from the confirmed database. Separately define image storage buckets, path resolution, and read permissions; `storage_locator` does not prescribe a storage provider.

A successful API empty array means no rows were visible to that query/role; it does not by itself prove that the database is empty. RLS can filter rows without returning an error, while missing table grants can produce explicit errors. Verify grants/policies with the actual application role and avoid claiming full retrieval access from empty-table smoke tests alone. See [Supabase API key/access semantics](https://supabase.com/docs/guides/getting-started/api-keys).

### Retrieval Implementation and Setup

The archived `add-thangka-retrieval` change implements structured lexical lookup/search and finite evidence expansion locally. Isolated SQL/service tests pass; the owner completed remote setup and repeated anon table/RPC smoke checks pass (HTTP 200); live-generated type and final table/RPC metadata comparisons also pass; the owner has reviewed and accepted the implementation; archived at the owner's explicit request on 2026-10-16. See [retrieval-setup.md](retrieval-setup.md) for read-only schema/grant/RLS inspection, incremental SECURITY INVOKER function setup, type generation and live smoke verification. Runtime reads do not modify business records; installing the proposed function/read policies is a separate reviewed setup step. Do not rerun the reference initializer or seed synthetic fixtures into the owner's database.
