## RENAMED Requirements

- FROM: `### Requirement: Source and copy action placeholders`
- TO: `### Requirement: Source and copy action presentation`

## MODIFIED Requirements

### Requirement: Conversation composer

The system SHALL provide an editable `消息内容` field with the established visual system, placeholder and evidence helper. Submission SHALL follow text-conversation and image-upload. The composer SHALL support a JPG/JPEG/PNG multi-file picker, up to four ordered previews, individual removal and contextual processing/lifetime guidance. It SHALL remain visible while messages scroll independently.

#### Scenario: Edit a local draft

- **WHEN** a visitor edits and submits valid text through a supported gesture
- **THEN** text submission follows the current text-conversation lifecycle instead of the earlier disabled-send behavior
- **AND** the input retains the placeholder `聊聊唐卡，或上传一张图片…` and helper `回答会区分数据库依据与通用知识。`.

#### Scenario: Inspect unavailable actions

- **WHEN** image selection is available in the conversation composer
- **THEN** the `上传图片` control opens the supported picker unless current draft preparation temporarily locks selection
- **AND** obsolete sending/upload-disabled notices are absent, contextual image processing/lifetime guidance appears with attachments, and answer source/copy actions follow the answer-sources capability.

#### Scenario: Disable sending when appropriate

- **WHEN** the draft has neither usable text nor a prepared image, image preparation is active, or one request is pending
- **THEN** send is disabled while text remains editable and next-image draft editing is allowed during an active POST
- **AND** the corresponding validation or pending state creates no duplicate message.

#### Scenario: Prepare and edit image drafts

- **WHEN** the visitor selects valid images or edits a next-image draft while a POST is pending
- **THEN** preparation feedback and accessible labelled remove controls preserve current draft text and image order
- **AND** pending request completion cannot replace the newer draft, and draft preparation cannot reintroduce removed images.

#### Scenario: Keep a four-image composer usable

- **WHEN** four previews are displayed at a mainstream mobile or reduced-height viewport
- **THEN** the preview panel is limited to 40 shared spacing units with internal vertical scrolling
- **AND** the message region, editable text, send/image controls and centered mobile footer remain reachable without page overflow.

### Requirement: Source and copy action presentation

The system SHALL provide operable, accessible Chinese answer source/copy actions following answer-sources, within the established answer card and shared visual system.

#### Scenario: Verify supplied answer actions

- **WHEN** an accepted assistant answer has copyable content and delivered evidence entries
- **THEN** copying is enabled, the source control opens matching inline details and evidence markers support exact-target navigation
- **AND** obsolete unavailable-action notices are absent; source-free answers omit the source control while retaining eligible copying.

#### Scenario: Preserve the empty landing state

- **WHEN** the product opens or reloads with no conversation messages
- **THEN** no source/copy controls, example answers or fabricated source entries are preloaded
- **AND** the existing welcome, composer and footer behavior remains unchanged.
