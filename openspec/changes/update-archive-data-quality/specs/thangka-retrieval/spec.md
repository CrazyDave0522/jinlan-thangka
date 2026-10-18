## MODIFIED Requirements

### Requirement: Complete archive eligibility

The system SHALL consider all records and contents of the eight business tables eligible, without publication/privacy/review-status exclusion. It SHALL preserve uncertainty, attribution, rights, dates, notes and null values rather than equating eligibility with truth or image-use permission. The operational review ledger SHALL remain outside this business-evidence graph; this SHALL NOT create private/public subsets of business records.

#### Scenario: Retrieve an unverified or disputed candidate

- **WHEN** an otherwise relevant record has pending, disputed or unspecified review status
- **THEN** it remains eligible with its original review/attribution metadata
- **AND** its status does not change lexical ranking or establish factual truth.

#### Scenario: Distinguish operational history from business evidence

- **WHEN** versioned review history exists alongside the eight business tables
- **THEN** retrieval still explicitly projects every current business-table column without adding a ledger expansion query
- **AND** schema/grant inspection inventories the ledger separately and does not grant anonymous ledger access or hide unexpected objects.
