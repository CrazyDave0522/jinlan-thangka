## ADDED Requirements

### Requirement: Image message submission

The system SHALL allow users to upload an image through Supabase Storage and submit it as a conversation attachment, optionally with text.

#### Scenario: Submit an image with a question

- **WHEN** a user selects an image, adds a question, and successfully submits the attachment
- **THEN** the conversation displays the uploaded image with its accompanying question.
