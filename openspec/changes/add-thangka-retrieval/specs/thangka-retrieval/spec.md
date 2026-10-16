## ADDED Requirements

### Requirement: Archive evidence retrieval

The system SHALL retrieve relevant Thangka archive records with their identifiers and associated supporting source evidence, preserving ambiguous matches.

#### Scenario: Retrieve supporting archive evidence

- **WHEN** a query corresponds to records in the archive
- **THEN** retrieval returns relevant records and their available supporting evidence without merging entities solely because they share a name.
