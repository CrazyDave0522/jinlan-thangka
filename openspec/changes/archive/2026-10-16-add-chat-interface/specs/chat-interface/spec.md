## ADDED Requirements

### Requirement: Branded conversation shell

The system SHALL provide the `/` conversation interface in Simplified Chinese, based on `docs/design/thangka-chat-desktop.png`, with the existing brand artwork, a demo label, conversation content, composer, and footer. It SHALL reuse the project's shared UI conventions and replace starter document language and metadata with the brand's Chinese presentation.

#### Scenario: Open the home page

- **WHEN** a visitor opens `/`
- **THEN** the page displays the brand, `演示版`, the conversation area, composer, and footer with the AI verification notice
- **AND** the document language is `zh-CN` and the page title is `雪域金澜 · 唐卡 AI 对话演示` rather than starter metadata.

### Requirement: Empty landing conversation

The system SHALL open the home page with an empty conversation and welcome guidance. It SHALL NOT preload the example exchange from the design reference, display example answers or sources, or expose an example-conversation mode. Synthetic messages SHALL be restricted to tests and development-only visual verification of message components.

#### Scenario: Render an empty conversation

- **WHEN** the supplied message collection is empty
- **THEN** the conversation area displays `一起探索唐卡艺术` and `你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。`, centered horizontally and vertically within the available conversation area
- **AND** the composer remains visible without invented messages, database citations, suggested questions, or example cards.

#### Scenario: Open the product without prefilled content

- **WHEN** a visitor opens or reloads the home page in this presentation increment
- **THEN** the page shows the welcome state with no prefilled user messages, assistant answers, source cards, or attachment placeholders
- **AND** no example-conversation mode or switch is exposed.

### Requirement: Message presentation

The system SHALL display supplied user text and optional image attachments on the right, and assistant content with the `雪域金澜` identity on the left. Supplied database evidence and general-knowledge supplements SHALL appear in distinguishable sections. Presentation SHALL NOT generate factual claims or require external-service queries.

#### Scenario: Display a supplied exchange

- **WHEN** a user message contains an image and text followed by an assistant answer with evidence and general-knowledge content
- **THEN** the page displays the image and question together in the user bubble and the answer in an outlined assistant card
- **AND** the answer labels its supplied sections `数据库依据` and `通用知识补充`.

#### Scenario: Omit absent optional content

- **WHEN** a supplied message has no image or an answer has no content for an optional section or source area
- **THEN** the page omits that absent content without rendering broken image elements, empty headings, invented sources, or an empty source control.

### Requirement: Composer presentation without service actions

The system SHALL provide a locally editable `消息内容` field with the specified placeholder and helper copy. Send and upload SHALL remain disabled with a temporary notice until their owning changes enable them. That notice SHALL reflect remaining unavailable actions and be removed when both actions are enabled. Editing or pressing Enter SHALL NOT send requests, create messages, or clear the draft.

#### Scenario: Edit a local draft

- **WHEN** a visitor types in the composer and presses Enter
- **THEN** the entered draft remains editable and no message submission, upload, or answer generation occurs.

#### Scenario: Inspect unavailable actions

- **WHEN** the visitor views the composer in this presentation increment
- **THEN** the `发送消息` and `上传图片` controls are disabled
- **AND** the page displays `当前为界面演示，发送和上传功能暂未开放。` as their explanation.

### Requirement: Source and copy action placeholders

The system SHALL reserve the answer source/action areas shown in the reference without implementing source inspection or copying. Rendered action placeholders SHALL have accessible Chinese names, disabled semantics, and a visible explanation that those actions are unavailable.

#### Scenario: Verify supplied answer actions

- **WHEN** a message component is supplied with answer and source data during a component test or development-only visual verification
- **THEN** its source area and copy action are visibly unavailable and disabled
- **AND** activating them cannot expand sources, navigate, or write to the clipboard.

### Requirement: Responsive and accessible presentation

The system SHALL follow the project responsive baseline and browser matrix with readable content and no horizontal page overflow. Messages SHALL scroll independently while the composer stays visible above the footer without obscuring content. The system SHALL provide semantic landmarks, an accessible heading and message collection, speaker identity, meaningful image alternatives, and accessible control names.

#### Scenario: Read at a narrow viewport

- **WHEN** the page is viewed at the mobile portrait sizes in the compact project browser matrix, with long messages and an image
- **THEN** messages and footer content wrap, images remain within their containers with preserved aspect ratio, and the page has no horizontal overflow or obscured content.
- **AND** the footer's text paragraphs are stacked and centered on mobile, including wrapped text; desktop retains the left/right footer layout.

#### Scenario: Adapt across desktop and intermediate widths

- **WHEN** the empty page and supplied-message components are viewed across the mandatory desktop sizes in `docs/testing.md`, and resized through intermediate widths and around breakpoints
- **THEN** the layout adapts without horizontal page overflow, clipped content, or overlapping controls
- **AND** the conversation remains centered with readable content width on large desktops instead of stretching to fill the screen.

#### Scenario: Use a reduced-height viewport

- **WHEN** a relevant landscape or ordinary reduced-height spot check is performed within the mainstream baseline
- **THEN** content remains scrollable and the composer controls remain reachable without covering messages or the footer.

#### Scenario: Read a long conversation

- **WHEN** conversation content exceeds the viewport height
- **THEN** the visitor can scroll the message area to read every message while the composer remains visible in the bottom viewport region
- **AND** the last message, composer controls, and footer remain unobscured without requiring a scroll to the end of the conversation to reach the composer.

#### Scenario: Navigate with assistive technology

- **WHEN** a visitor reads the page with assistive technology or navigates operable elements by keyboard
- **THEN** header, main, footer, page heading, message collection, speaker identities, and the message field are identifiable
- **AND** decorative icons are hidden from assistive technology and operable controls have visible focus indicators.

### Requirement: Attachment image fallback

The system SHALL preserve the accompanying message text when a supplied image fails to load, and SHALL display a readable Chinese fallback. Image presentation SHALL be verified using synthetic test assets without introducing artwork or image placeholders on the empty home page.

#### Scenario: Image fails to load

- **WHEN** a supplied message image cannot be loaded
- **THEN** the message displays a readable unavailable-image fallback and retains the accompanying question.
