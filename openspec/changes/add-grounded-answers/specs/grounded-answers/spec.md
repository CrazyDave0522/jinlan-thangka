## ADDED Requirements

### Requirement: Evidence-grounded answers

The system SHALL generate DeepSeek answers grounded in retrieved archive evidence, include the record and source references used, distinguish general knowledge, and acknowledge insufficient or conflicting evidence without fabricating facts or citations.

#### Scenario: Answer with insufficient archive evidence

- **WHEN** the retrieved evidence does not support a definite answer
- **THEN** the answer states that limitation and clearly distinguishes any general-knowledge supplement from database-supported information.
