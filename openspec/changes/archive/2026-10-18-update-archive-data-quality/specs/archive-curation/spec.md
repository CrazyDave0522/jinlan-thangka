## ADDED Requirements

### Requirement: Version-bound review responsibility

The system SHALL preserve collection responsibility and review decisions for artists, artworks and images. Decisions SHALL identify the entity, content revision, nonblank reviewer label, database-generated order/time and reviewed snapshot. Current status SHALL bind to the latest applicable decision. Reviewer labels SHALL NOT imply authenticated personal identity. Corrections SHALL append decisions rather than modify history.

#### Scenario: Review a collected record

- **WHEN** an authorized maintenance operator reviews a current entity revision
- **THEN** collection responsibility remains intact and the decision records who reviewed which version and when
- **AND** the decision and current review state are committed atomically without granting visitor write access.

#### Scenario: Preserve responsibility after another review

- **WHEN** an edited record receives a later review from another operator
- **THEN** the earlier decision, reviewer and snapshot remain unchanged
- **AND** the new decision identifies its own revision rather than overwriting the previous review.

#### Scenario: Prevent replay of an earlier decision

- **WHEN** one revision was verified and later marked pending or disputed
- **THEN** the latest decision determines its current status
- **AND** pointing back to the earlier verified event cannot restore verification.

### Requirement: Protected review history and maintenance authority

The system SHALL generate review snapshots from the locked database row and reject ordinary history UPDATE, DELETE and TRUNCATE. Maintenance functions SHALL use explicit invoker authority, qualified SQL and restricted execution. New ledger/sequence/function privileges SHALL deny PUBLIC, anon and authenticated access in the creation transaction without broadening existing business access.

#### Scenario: Reject forged history or review targets

- **WHEN** a write supplies a snapshot/time/order or a current decision for another entity or revision
- **THEN** the write fails without leaving a partial review or mismatched state
- **AND** correcting an actual review requires a new decision while its predecessor remains intact.

#### Scenario: Deny visitor maintenance

- **WHEN** an anonymous or ordinary authenticated API caller attempts ledger access or maintenance-function execution
- **THEN** access is denied, including effective PUBLIC, inherited and default-grant paths
- **AND** the exact existing search RPC and business SELECT access remain available.

### Requirement: Verification follows the reviewed entity revision

The system SHALL advance an entity's managed revision, set status pending and clear its current decision when content changes. A review SHALL atomically compare the expected content revision and current decision with the locked row. Forged revisions, bypassed verification and stale expectations SHALL fail. No-op/timestamp-only updates SHALL NOT advance content. Row review SHALL NOT certify linked records or image-use permission.

#### Scenario: Edit verified content

- **WHEN** an operator changes a verified entity's content, collection responsibility or image rights/technical metadata
- **THEN** the record becomes pending at a new revision while its previous review decision remains available
- **AND** unchanged content does not acquire a new revision merely because an update statement ran.

#### Scenario: Reject a stale or bypassed approval

- **WHEN** an operator submits an outdated revision/current-decision expectation, inserts a verified row without a decision, or directly bypasses the current-decision rule
- **THEN** the write fails without leaving an unmatched verified state or partial review event
- **AND** a concurrent content edit cannot be approved using the earlier expected revision.

#### Scenario: Detect competing decisions without a content edit

- **WHEN** two operators review the same revision based on the same previous decision
- **THEN** only the first committed decision can satisfy that expectation
- **AND** the other attempt reports a conflict rather than silently overwriting it; real two-connection PostgreSQL tests must verify both commit and rollback orderings.

#### Scenario: Retain existing retrieval and permission meaning

- **WHEN** a record is pending, disputed or never reviewed
- **THEN** it remains eligible for the existing retrieval flow with its uncertainty preserved
- **AND** record review never substitutes for field-scoped sources, independent identity gates or explicit image-use permission.

### Requirement: Valid source fields and text arrays

The system SHALL validate source-link fields against the associated entity's supported business fields, excluding managed review revision/pointer fields. The exact empty string SHALL remain valid for unspecified scope. Text arrays SHALL be empty or one-dimensional with no null elements. Invalid historical data SHALL require explicit reconciliation without guessing field names or flattening arrays.

#### Scenario: Reject an invalid citation scope

- **WHEN** a source link contains a typo, padded name, unknown/operational field or field belonging only to another target table
- **THEN** the database rejects the write
- **AND** valid exact field names and existing empty-string unscoped links continue to work.

#### Scenario: Reject null elements and nested arrays

- **WHEN** a write supplies null elements or a nonempty multidimensional archive text array
- **THEN** the database rejects that write before the invalid record can break runtime row parsing
- **AND** empty arrays, one-dimensional multilingual strings and the literal string `NULL` remain accepted.

### Requirement: Data-preserving migration and verification

The system SHALL use an additive migration before compatible application rollout, preserving data, identities and read-only visitor authority. Preflight SHALL inspect the shared target, data conflicts, reachable readers and effective grants. Rollback SHALL preserve review history. Routine checks SHALL use isolated fixtures without remote seeding or paid calls; concurrency gates SHALL use independent PostgreSQL connections.

#### Scenario: Discover data after the original empty-archive review

- **WHEN** preflight finds invalid fields/arrays, legacy verified/disputed statuses or incompatible reachable readers/grants
- **THEN** the migration does not proceed until those records have an explicit resolution or export
- **AND** the original empty-table observation does not authorize deletion, guessed corrections or invented reviewers.

#### Scenario: Roll back the application after new decisions exist

- **WHEN** the new application needs rollback after operators have created review events
- **THEN** the tested old reader can run against the retained additive schema without losing those decisions
- **AND** any full schema reversal requires frozen writes and a proven export/restore of events, revisions, pointers and statuses.

#### Scenario: Verify deployment without replacement data

- **WHEN** the actual archive remains empty during deployment
- **THEN** schema, grants, review authority and anonymous table/RPC reads can still be verified
- **AND** real source support and artwork-identification quality remain deferred release obligations.
