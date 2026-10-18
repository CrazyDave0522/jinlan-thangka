## Context

The current archive has eight business tables and a read-only anonymous application boundary. `artists`, `artworks` and `images` have nullable `review_status` values but no reviewer identity, decision time or reviewed version. The timestamp trigger only changes `updated_at`. Source links store a free-text `supported_field`; answer citation matching depends on its exact spelling. PostgreSQL permits null elements inside the current non-null text arrays, while the runtime parser requires strings.

The owner needs collection/handoff responsibility, the current conversation/search scope, and no near-term gallery. Existing database and image-identity contracts remain relevant: unreviewed records remain retrievable, and review status alone never grants image use or establishes an artwork identity.

## Goals / Non-Goals

- Goals: preserve review responsibility across revisions; prevent stale decisions and the reproduced invalid source-field/array cases; prepare compatible migration and verification before real import.
- Non-goals: accounts, authenticated reviewer identity, management screens, an importer, a new search surface, physical column removal, attribution-source redesign, index tuning or real-data/domain acceptance.

## Decisions

### Record review decisions separately from collection responsibility

Keep `collected_by` and `collected_on`. Add a database-managed positive integer `content_revision` starting at one and a nullable `current_review_id` to the three reviewable entity tables. Use a bounded SQL integer that the existing runtime can represent exactly; reject overflow rather than wrapping or reusing a revision.

Add `archive_reviews` with a generated UUID, database-generated decision order, exactly one typed entity foreign key, reviewed revision, decision, reviewer label, database-generated decision time, optional notes and a database-generated snapshot. Typed foreign keys and the current-decision reference use the existing restrictive deletion convention. Validate that the pointed event belongs to this entity and revision; a UUID foreign key alone is insufficient. Retaining review events intentionally prevents ordinary deletion of their entity. Archival/anonymization is outside this increment.

Decisions are `pending`, `verified` or `disputed`. Reviewer labels must be nonblank. They are operator-supplied responsibility records, not proof of authenticated personal identity. Snapshot the entity identity and current content, including collection responsibility, excluding timestamps and managed review/version metadata. Source/link content is not implicitly certified. Reject caller-supplied snapshots, event ordering and times. Ordinary UPDATE, DELETE and TRUNCATE of review events must fail; corrections append another decision. Database administrators' ability to alter schema or disable enforcement is outside this integrity guarantee.

Provide one maintenance SQL function taking entity identity, expected content revision, expected current review ID (including an explicit null for no decision), decision, reviewer and optional notes. Use SECURITY INVOKER, an empty search path and fixed qualified SQL; do not introduce elevated application keys or new application roles. Do not mark this function STRICT because a null expected review ID is legitimate; validate its other inputs explicitly.

The function locks the entity, compares both expected values with the locked current row using null-safe equality, creates the event/snapshot and updates status plus current pointer atomically. Concurrent reviews of unchanged content must conflict when based on different current decisions, including two reviewers who both saw no prior decision. The pointer identifies the latest decision in database-generated order, not just any matching historical event. Directly setting verified on INSERT/UPDATE, restoring an older pointer, forging a revision, or pointing across entities/revisions must fail. Initial/unreviewed records may have null or pending status and no current event; verified and disputed states require a matching current decision.

Create the ledger with RLS enabled and no visitor policies. In the creation transaction, remove PUBLIC, anon and authenticated access to its table/sequence and execution of every new maintenance/helper function; inspect effective inherited/default privileges as well as direct ACLs. Only the existing trusted administrative SQL context performs maintenance. Preserve the current exact search RPC access and business-table SELECT policies. Routine direct ledger inserts are not a supported maintenance interface; integrity guards still validate their entity/version/snapshot. This is an operational ledger outside business evidence, not a private/public split within the existing archive.

### Invalidate verification when reviewed row content changes

Implementation clarifications: an invoker BEFORE INSERT guard generates ledger order/time/snapshot from the locked row, and an AFTER INSERT trigger applies its current pointer atomically. These generated columns have no caller-provided defaults, so supplied values can be rejected. Current-pointer foreign keys are deferrable initially immediate for owner-only restore; ordinary row guards still validate identity/revision/current decision immediately. A direct administrative ledger insert also receives these integrity checks, although the maintenance function is the supported interface.

Database triggers advance `content_revision`, set status to `pending` and clear `current_review_id` on an actual content change. Content excludes primary identity, timestamps and database-managed review/version metadata; it includes collection responsibility, notes, rights and technical image metadata. No-op and timestamp-only updates create no revision. Primary identities and review metadata cannot be forged by caller writes.

Prior review events and their snapshots remain unchanged when content is edited or reviewed again. Review maintenance updates must not recursively create content revisions. A review transaction must not approve an earlier version after a concurrent edit. Null/unspecified existing statuses remain valid for never-reviewed records; neither retrieval eligibility nor ranking gains a status filter.

Related source rows and artist associations have their own identities and uncertainty. Changes to those separate rows do not automatically certify or invalidate an entity-row review in this increment. Citation support and the existing fresh-evidence/identity gates still apply independently. A future evidence-graph review workflow needs its own scope rather than an incomplete transitive trigger system here.

### Validate ingestion at the database boundary

Maintain an explicit allowed-field set for each source-link target, checked against its post-cleanup runtime descriptors minus the new managed fields `content_revision` and `current_review_id`. Allow the exact empty string as unspecified scope; otherwise require an exact allowed name. Reject typos, padded names, other-target-only fields and unknown/operational fields. Do not reinterpret `evidence_notes` as a source for a different candidate artist.

Constrain every existing text-array column to an empty array or a one-dimensional array of non-null strings. PostgreSQL's `text[]` declaration alone does not enforce dimensionality. Test empty-array handling explicitly; do not rely on a null-producing dimension check to reject bad input. Preserve literal strings, including the text `NULL`, and established search normalization. Report invalid historical values rather than flattening arrays or guessing citation corrections. Source-wide notes remain distinct from link-specific `locator` and `evidence_notes`.

### Inherit approved cleanup and preserve full-row grant binding

The owner's later deletion instruction superseded the earlier thumbnail-retention choice. [remove-unused-image-thumbnail](../2026-10-18-remove-unused-image-thumbnail/proposal.md) completed physical removal and matching reader deployment. This subsequently approved review/ingestion work inherits that baseline and must not recreate the removed column. Current business read setup grants SELECT on tables, not individual columns.

Future row digests include all post-cleanup image fields and new review/version metadata. Never omit fields to reuse old grants. Inspect every reachable runtime: a new digest mismatch alone does not revoke an older runtime's grants. If an old revision has usable grants, retire that grant/runtime before proceeding. Reconfirm the currently empty production manifest, and create future grants only through the existing permission process.

### Separate business evidence from operational metadata

Keep the eight existing business tables in the evidence graph with full explicit projections. The review ledger is a ninth operational table, not another expansion stage. New row revision/pointer fields participate in retrieval drift detection and full-row image digests, but must be excluded before model evidence-key assignment and rejected as public answer references. Do not add labels to make them accidental answer facts. Existing business facts, uncertainty and source scope stay eligible. No new ledger query or request budget is added.

Metadata checks must inventory all tables/functions, distinguish the expected eight business tables from the ledger and flag unexpected objects. Do not simply change an assertion from eight to nine or hide the ledger by filtering all inspection queries. Schema/type parity tests, release inspection and effective grant checks need explicit coverage of both groups.

## Migration Plan

1. After proposal approval, create a feature branch from the current accepted main and retain the pre-change baseline before implementation. Test incremental SQL against that baseline and synchronize the initializer. Prepare exact inspection and data preflight; never rerun `schema.sql` remotely. Verify fresh-install ordering also works when the ledger exists before historical read-setup scripts run.
2. Inspect the actual shared database, completed cleanup, connected application revisions, grants and data again. Reconcile invalid field/array values and pre-existing verified or disputed statuses explicitly; do not invent historical reviewers or erase disputes. Inspect live function/table defaults and inherited privileges before object creation.
3. Take schema/data backup and rehearse restoration locally. Freeze administrative content/review writes for the migration, choose bounded lock/statement timeouts, and prepare the tested candidate outside the Production branch. Follow the existing [guarded Preview process](../../../../docs/demo-release.md): both provider switches must be false for the new Preview before active requests, and shared/Production settings stay unchanged. This is an additive schema migration: no existing column or read function is removed. A Preview is not a database isolation boundary.
4. Apply transactional migration with fail-fast checks, then confirm existing application's explicit eight-table/RPC reads remain compatible. Preserve UUIDs, relations, collection data, table SELECT policies and exact search RPC grants. Stop and roll back on incompatible read behavior. No new review writes begin during this transition.
5. Generate/compare types from the migrated database, validate the compatible protected Preview and promote the verified candidate through the existing release process. Only then resume maintenance review writes. Keep paid provider switches within existing authorization; deterministic upstreams and read-only live smoke require no new paid calls.
6. Record deployed schema/types, trigger/function definitions and effective privileges, eight-business-table/RPC reads, ledger denials, and exact application/deployment revisions separately. Refresh affected release checks; do not rewrite historical A results or claim B acceptance.
7. Prefer application rollback with the additive review schema and ledger retained; test the post-cleanup baseline reader against that schema. Full review-schema reversal requires an export of all new decisions/snapshots and current revisions/pointers/statuses plus a proven restore path, with writes frozen. Do not discard reviews, restore stale verified states or drop the ledger as a shortcut. Thumbnail reversal belongs to its separate cleanup.

## Verification

Use the [acceptance matrix](acceptance.md). Isolated PGlite tests cover sequential SQL behavior, revision/no-op rules, history immutability, rejected direct states, field/array constraints and role denials. True concurrent-review/edit checks require two independent connections to a disposable PostgreSQL 17 instance; a PGlite single-connection run cannot certify lock races. If that environment is unavailable, keep the concurrency gate open and do not mark the requirement complete.

Compare a fresh initializer and migration from the preserved pre-change baseline, including ledger constraints, pointers, triggers and ACLs. Verify both historical and new read-setup order without rerunning installed remote setup. Service/answer/image checks cover source scoping, all-business-record eligibility, operational-field exclusion, old/new application compatibility and complete-row digest binding. Run `npm run check`, the ordinary build and affected real-route browser tests. No remote fixtures or paid model calls are required. Proposal checks do not substitute for these future implementation results.

## Risks / Trade-offs

- A ledger adds operational structure despite retaining all current business tables. It is justified by the confirmed responsibility requirement; a general event-sourcing or management system is excluded.
- Reviewer labels can be mistyped or shared. Authenticated identities are later work, and documentation must not imply stronger identity assurance.
- The additive database shape still changes reference-grant semantics for new applications. Old-reader compatibility and reachable old manifests need separate checks, not an assumption that a protected Preview isolates the database.
- Real-data source accuracy and image identity remain untested while replacement material is unavailable. Passing migration tests does not complete release milestone B.
