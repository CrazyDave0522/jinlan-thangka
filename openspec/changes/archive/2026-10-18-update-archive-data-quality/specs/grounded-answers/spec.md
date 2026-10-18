## ADDED Requirements

### Requirement: Operational review metadata boundary

The system SHALL retain managed entity revisions/current-decision pointers in retrieval consistency checks and image row digests while excluding them from model fact catalogues and public answer references. They SHALL NOT acquire evidence keys or external source-field support. Existing business facts, review uncertainty and scoped sources SHALL retain their accepted meaning.

#### Scenario: Build an answer from a versioned record

- **WHEN** a retrieved row contains `content_revision` and `current_review_id`
- **THEN** those values participate in row drift detection and complete image digest binding where applicable
- **AND** neither field is offered as an artistic fact or accepted as a public answer reference.

#### Scenario: Preserve existing evidence behavior

- **WHEN** the model answers from eligible business content
- **THEN** source scoping, review-status notices, canonical source copying and identity/permission gates continue to operate
- **AND** the new ledger does not introduce another query, provider call or claim that reviewed content is necessarily true.
