## ADDED Requirements

### Requirement: Text conversation

The system SHALL support sending text messages and follow-up questions with the current conversation context.

#### Scenario: Ask a follow-up question

- **WHEN** a user submits a follow-up after an earlier exchange
- **THEN** the response request includes the relevant current-conversation context and the exchange appears in conversation order.
