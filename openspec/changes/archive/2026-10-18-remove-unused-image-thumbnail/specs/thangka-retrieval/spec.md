## ADDED Requirements

### Requirement: Unused thumbnail removal with matching readers

The system SHALL remove `images.thumbnail_locator` from the archive and all active application row/type/fixture contracts. It SHALL preserve the other eight-table fields, identities, rights, source links and read-only grants. The new reader SHALL work before and after removal; the compatible deployment SHALL precede SQL application. Full-row image grants SHALL reject pre-change digests without bypassing permission checks.

#### Scenario: Read either side of the migration

- **WHEN** the new application reads the archive before or after thumbnail-column removal
- **THEN** explicit eight-table projections and runtime types agree with returned rows
- **AND** the removed field is not an answer reference or a model fact.

#### Scenario: Apply guarded empty-image migration

- **WHEN** the authorized migration finds the original nullable text column and an empty images table
- **THEN** it removes only that column transactionally and requests schema-cache refresh
- **AND** populated images, unexpected schema or dependent objects cause rollback rather than data deletion, CASCADE or guessed reconciliation.

#### Scenario: Retain exact grant binding

- **WHEN** a reference grant pins the old image row including its thumbnail field
- **THEN** it fails against the current full-row digest
- **AND** a new grant still requires actual image-use permission and the existing reviewed process.
