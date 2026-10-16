## RENAMED Requirements

- FROM: `### Requirement: Composer presentation without service actions`
- TO: `### Requirement: Conversation composer`

## MODIFIED Requirements

### Requirement: Conversation composer

The system SHALL provide an editable `消息内容` field using the established visual system, placeholder, and evidence helper. Valid text submission SHALL follow the text-conversation requirements. Upload SHALL remain disabled with an upload-only notice until its owning change enables it. The composer SHALL remain visible while messages scroll independently.

#### Scenario: Edit a local draft

- **WHEN** a visitor edits and submits valid text through a supported gesture
- **THEN** text submission follows the current text-conversation lifecycle instead of the earlier disabled-send behavior
- **AND** the input retains the placeholder `聊聊唐卡，或上传一张图片…` and helper `回答会区分数据库依据与通用知识。`.

#### Scenario: Inspect unavailable actions

- **WHEN** text submission is available but image upload is not implemented
- **THEN** the `上传图片` control remains disabled with `图片上传功能暂未开放。`
- **AND** the obsolete notice claiming that sending is unavailable is absent.

#### Scenario: Disable sending when appropriate

- **WHEN** the draft is blank or one request is pending
- **THEN** send is disabled while the input remains editable
- **AND** the corresponding validation or pending state creates no duplicate message.
