# Archive Collection and Review Maintenance

The archive retains eight business tables and adds `thangka.archive_reviews` as an operational ledger. The conversation reader still expands only the eight business tables. Review history is available only through trusted administrative SQL; it is not an application login, administration screen or authenticated personal identity system.

## Collection Responsibility and Review Scope

Keep `collected_by` and `collected_on` when collecting or handing off material. Each review snapshot preserves the collection responsibility recorded at that review. This does not create a full edit/handoff history before the first review.

Review covers one artist, artwork or image row. It does not certify linked source documents, author associations, factual truth, physical authenticity or image-use permission. Related source/association changes do not automatically invalidate that row review. Continue to inspect scoped evidence independently; image rights still require the existing explicit reference permission process.

## Record a Decision

Read the row content together with `content_revision` and `current_review_id`, then review that exact version. Call the maintenance function with the version and previous decision you actually inspected. The following is a template with a deliberately nonexistent UUID; replace it and the responsibility label with actual reviewed values:

```sql
SELECT thangka.record_archive_review(
    p_entity => 'artist',
    p_entity_id => '00000000-0000-0000-0000-000000000000'::uuid,
    p_expected_revision => 1,
    p_expected_review_id => NULL::uuid,
    p_decision => 'verified',
    p_reviewer => 'Actual reviewer label',
    p_notes => 'Evidence inspected and remaining limitations'
);
```

Use `artist`, `artwork` or `image`; decisions are `pending`, `verified` or `disputed`. An explicit null previous ID is appropriate only when the inspected version has no current decision. If a decision already exists, pass that exact UUID. SQLSTATE `40001` means content or the decision changed: inspect the new state before deciding again. Do not obtain a fresh revision merely to force a stale approval through an automatic retry.

The function uses caller authority and locks the entity. The ledger generates its own order, time and snapshot; callers do not supply them. The event and current row state commit atomically. Reviewer labels record asserted responsibility rather than authenticated identity. Calls from PUBLIC, anon and ordinary authenticated API roles are denied.

## Content Changes and History

- A substantive edit increments the database-managed revision, sets status to pending and clears the current decision pointer. This includes notes, collection responsibility, image rights and technical metadata.
- No-op or timestamp-only maintenance does not create another content revision. Review itself also does not change content revision.
- Correct a review by appending a new decision with the expected current ID; do not update, delete or truncate ledger events. An old verified decision cannot override a later disputed/pending decision.
- Direct verified/disputed inserts, caller-forged revisions, mixed content/review updates and wrong-entity/revision pointers fail. Do not edit IDs or disable integrity guards during normal collection.
- Entity deletion is restricted once review history references it. A future archive/anonymization workflow needs separate design.

Administrative inspection can query `archive_reviews` by its typed `artist_id`, `artwork_id` or `image_id`, ordered by `decision_order`. The current pointer and content revision are technical consistency metadata, excluded from model fact keys and public answer references. Full image-row digests include both fields, so a later review requires fresh permission grants even if visual content is unchanged.

## Source and Array Entry Rules

Use each source link's `supported_field` for an exact supported target-table field name, or the exact empty string for unspecified scope. Unknown fields, typos, surrounding spaces and managed review fields are rejected. A source is not automatically evidence for every field, and artwork evidence does not implicitly certify a candidate artist association.

Put citation-specific pages in link `locator` and the precise supported statement/conflict in `evidence_notes`. Source-wide `locator_notes` and `supports_notes` remain optional contextual information; they do not replace a precise link locator. Normalized year bounds remain optional and require evidence.

Arrays must be empty or one-dimensional arrays of non-null strings. Preserve multilingual strings and the literal text `NULL` when it is actually source text; an SQL null member or nested array is invalid. Do not flatten or silently rewrite invalid historical values. Collection templates still do not request a separate thumbnail.

## Apply the Incremental Setup

Use [20261018_archive_data_quality.sql](../database/migrations/20261018_archive_data_quality.sql) on the inspected post-thumbnail baseline. Do not rerun the initializer or installed search/read setup. The transaction uses bounded locks and refuses legacy verified/disputed rows without an explicit reconciliation. Constraint validation also stops on invalid existing source fields or arrays.

Reinspect counts, exact columns/constraints/functions, default/inherited privileges, and all reachable reference manifests. New maintenance routines must not collide with unknown existing routines. Preserve the existing eight-table SELECT policies and exact search RPC grant; the ledger has RLS enabled and no visitor policy or grant. Keep administrative writes paused until the matching application is deployed and verified.

The new columns are additive. The post-thumbnail reader can continue to select its original projection; the new reader requires both managed fields and matching generated types. Verify old-reader compatibility before applying SQL, then the compatible protected Preview before Production. Keep provider testing within existing authorization; structural verification needs no paid calls.

## Backup and Reversal

Prefer rolling back the application with the additive schema and review ledger retained. Never restore an older application that still expects the previously removed thumbnail unless its separate reversal is applied first.

For any full schema reversal, pause administrative writes and preserve all business rows, ledger events/snapshots, current revisions/pointers/statuses, definitions/ACLs and the review sequence state. Do not drop the ledger as a shortcut. Store structured row payloads as PostgreSQL JSON text so timestamp precision and large integer values survive export.

The isolated [PostgreSQL verifier](../scripts/verify-archive-concurrency.mjs) rehearses restoration into an empty database: owner-only custom triggers are disabled inside the restore transaction, current-pointer foreign keys are deferred, and original row payloads and sequence state are restored. Foreign-key checks are flushed before all custom guards are reenabled and committed. Its exact row comparisons and rejected post-restore history edit prove that snapshots, links and guards survive. This is an administrative recovery procedure for trusted backups, not a bypass available to application users.

Inspect and rehearse the actual target backup before any production reversal. Never delete later curated data to recreate a historical empty state. Real source/identity acceptance still belongs to release milestone B.
