## ADDED Requirements

### Requirement: Answer evidence inspection

The system SHALL provide an initially collapsed source area for each assistant answer containing archive evidence or archive-reference-image entries. State and targets SHALL be local to that answer.

#### Scenario: Inspect an answer source

- **WHEN** a visitor activates `查看来源` on a database-supported answer
- **THEN** an inline area shows each delivered evidence key, record label/type/identity, Chinese field/value, available review/attribution status and source-link details
- **AND** its summary counts evidence entries separately from archive-reference-image entries, exposes expanded state and supports collapsing without changing the answer.

#### Scenario: Reuse evidence keys in different answers

- **WHEN** two answers both contain `E1` or `R1` and either is expanded or navigated
- **THEN** only that answer's disclosure, target and focus state change
- **AND** every entry and marker occurrence has a unique answer-scoped identity, including repeated uses of the same key within an answer.

#### Scenario: Omit an empty source area

- **WHEN** an answer or clarification has no archive evidence or archive-reference-image entries
- **THEN** no source disclosure, invented citation or empty source heading is rendered
- **AND** general knowledge, picture observations, no-match/no-search notices and an eligible copy action remain available as supplied.

#### Scenario: Preserve earlier evidence after a later archive change

- **WHEN** a later answer retrieves changed values, source titles/locators or statuses for a record/source identity used by an earlier answer
- **THEN** each answer's source area and export retain its own accepted evidence snapshot, even when E keys and record/source/link identities repeat
- **AND** source wording identifies the evidence used for that answer rather than promising live database freshness; opening old sources performs no refresh and subsequent chat retrieval still follows the accepted fresh-evidence flow.

### Requirement: Exact citation navigation

The system SHALL let visitors navigate archive evidence and archive-reference-image markers to their corresponding entries and return to the originating marker using keyboard-operable controls.

#### Scenario: Follow a claim to its evidence

- **WHEN** a visitor activates an `E` marker in an archive block or identified-work explanation
- **THEN** its answer's source area opens, the exact entry becomes visible within the conversation scroller and keyboard focus moves to it
- **AND** a return action restores focus and visibility to the actual marker occurrence that initiated navigation.

#### Scenario: Navigate a reference-image marker

- **WHEN** a visitor activates an `R` marker in an identified-work explanation
- **THEN** navigation reaches the corresponding archive-reference-image entry in that answer
- **AND** it cannot reach another answer's entry, treat the image as a book/page citation or retrieve/display curated image bytes.

#### Scenario: Collapse after navigation

- **WHEN** a visitor collapses the source area while focus is in its content
- **THEN** focus returns to the owning disclosure control and remains visible
- **AND** opening sources directly without a preceding citation remains usable without a fabricated return target.

### Requirement: Faithful source and uncertainty details

The system SHALL present only delivered record/source associations, retaining field scope, citation locations and uncertainty without inventing bibliographic data or certainty.

#### Scenario: Inspect scoped and unscoped sources

- **WHEN** evidence has links scoped to its field or links with an unspecified supported field
- **THEN** each actual link shows its title/source identity, association identity, scope and locator as delivered
- **AND** unspecified scope is labelled `未限定支持字段`, rather than being described as confirmation of every field.

#### Scenario: Preserve distinct associations

- **WHEN** sources share a title, one source supports several fields, or one source has several links/locators
- **THEN** each evidence field retains its actual source-link and locator associations
- **AND** grouping cannot merge conflicting entries, move support between fields or discard citation locations.

#### Scenario: Read missing or uncertain evidence

- **WHEN** there are no source links, bibliographic text/locator is blank, or review/attribution is pending, disputed or otherwise uncertain
- **THEN** Chinese labels distinguish record-only evidence, unspecified metadata and delivered uncertainty
- **AND** no invented titles/pages substitute for missing data, pending/disputed rows are not hidden, and reviewed status does not guarantee every claim.

#### Scenario: Render text without expanding authority

- **WHEN** record values or source text contain URLs, markup-like text or instructions
- **THEN** they render as text and cannot execute markup, become inferred external links or trigger model/database/Storage work
- **AND** inspection uses only the accepted answer snapshot without further retrieval or record mutation.
- **AND** literal URL-like content in accepted field/source text remains inspectable and copyable as inert text; excluding attachment transport never silently redacts or rewrites those delivered values or proof quotations.

#### Scenario: Distinguish unspecified values from legitimate values

- **WHEN** delivered values include null, blank text, empty arrays, numeric zero, false or explicit unknown/not-recorded enum states
- **THEN** missing data has an unspecified-value label while zero, false and each delivered enum retain their distinct Chinese meaning in display and export
- **AND** absent review status is described as unavailable rather than converted into pending, disputed or verified status; display formatting never changes accepted data or canonical text.

### Requirement: Distinct picture and archive provenance

The system SHALL preserve current/prior picture observations, archive evidence, general knowledge and validated identity states while presenting their different reference types.

#### Scenario: Inspect a mixed image answer

- **WHEN** an answer combines current/prior observations, archive statements and general knowledge
- **THEN** their section labels remain distinct, observation links reach original visitor pictures using stable labels, and archive markers navigate to field/source entries
- **AND** proximity or shared layout cannot give general knowledge an archive citation.

#### Scenario: Inspect an archive comparison input

- **WHEN** a response includes a validated archive-reference-image entry
- **THEN** its `R` key, actual artwork/image record identities and artwork label are inspectable as an archive comparison input
- **AND** the UI displays no curated pixels/object locators/new access URLs/inferred bibliography and cannot strengthen candidate/insufficient evidence into identified status.

#### Scenario: Preserve old answers after a reread

- **WHEN** a later reread replaces an observation for a visitor picture
- **THEN** an earlier answer's details, copied content and uncertainty derive from its own captured message/context
- **AND** its original-picture label/jump target remains stable after failed turns or later selections.

#### Scenario: Inspect comparison proofs and contrary evidence

- **WHEN** a response contains archive comparisons, including a comparison whose E keys appear only in proofs rather than answer paragraphs
- **THEN** each comparison shows its actual group, visitor picture, candidate identity, R input, assessment, exact proof quotes/kinds/findings/regions and all delivered contradictions, with operable E markers
- **AND** shared R inputs retain separate comparison bindings; an uncertain/different-work assessment or an empty proof list is not presented as confirmed identity.

#### Scenario: Inspect observation qualifications and group coverage

- **WHEN** current observations or block-referenced prior observations contain tentative/unreadable readings, interpretation qualifications or limitations
- **THEN** picture-specific observation details retain text, region/kind, certainty, current/prior origin and identity-impact qualifications, and copied output preserves them
- **AND** model-reported clear/tentative certainty is not archive verification; group results distinguish same-label candidate UUIDs and state candidateLimitReached even when identity is not requested
- **AND** unrelated prior observations are excluded and material identity limitations remain visible outside collapsed archive sources.

### Requirement: Complete single-answer text export

The system SHALL copy one assistant answer as readable plain text with provenance and limitations, independently of disclosure state, without changing canonical conversation context.

#### Scenario: Copy with collapsed sources

- **WHEN** a visitor copies a text answer with sources collapsed
- **THEN** the export preserves ordered sections, evidence markers, record/field details, exact source/link/locator associations, relevant statuses and server notices
- **AND** it excludes action labels, copy feedback, other turns and the composer draft; expanding sources does not change the export.

#### Scenario: Copy an image answer

- **WHEN** an image answer contains group results or comparisons
- **THEN** copying includes current/prior labels, original picture numbers, per-group search coverage, identified/candidate/insufficient states and reasons, evidence/reference entries and applicable notices
- **AND** it preserves relevant observation qualifications, distinct candidate identities, per-group candidate caps and all comparison proof/contradiction bindings, including proof-only E references
- **AND** it does not serialize attachment bytes, request inputs, browser blob URLs or curated object/access metadata from image transport; accepted literal field/source text remains plain text, and a candidate or prior summary cannot become a freshly confirmed identity.

#### Scenario: Copy without archive evidence

- **WHEN** a clarification, general-only/no-match answer or supplied unstructured assistant message is copied
- **THEN** it exports that message's readable question/content, available labelled supplements and notices; a reread clarification retains target picture labels
- **AND** absent evidence does not create a fake source heading; a message without copyable content has no enabled copy action.

#### Scenario: Preserve request and evidence contracts

- **WHEN** sources are inspected or an answer is exported
- **THEN** accepted messages, validators, canonical history strings and existing byte/code-point limits remain unchanged
- **AND** export derives from that answer's structured data rather than scraped DOM or a new model response.
- **AND** only descriptor labels and relevant observation entries are projected from captured image context; its messages, inputs and unrelated history are never serialized into the export
- **AND** behavior tests freeze supplied data and inspect a subsequent chat request to verify unchanged canonical history/observations/descriptors instead of automatically substituting the larger copy export into model context.

### Requirement: Recoverable clipboard interaction

The system SHALL copy only after explicit activation and provide accurate timely-result or waiting feedback, with selectable text when automatic copying is unavailable, fails or remains unresolved.

#### Scenario: Complete a clipboard write

- **WHEN** `复制回答` is activated and the write resolves before the five-second waiting state is entered
- **THEN** only the chosen answer export is written and Chinese success feedback appears after resolution
- **AND** an immediate page-wide write guard prevents duplicate/concurrent automatic writes without locking conversation submission, source navigation or selectable-text access.

#### Scenario: Recover from missing or denied access

- **WHEN** writing is unavailable, throws synchronously or rejects before the waiting state is entered
- **THEN** Chinese failure feedback and a labelled read-only export with `选择全部` support native manual copying
- **AND** no success is announced; retry requires explicit activation and draft/message/source content is preserved.

#### Scenario: Dismiss and reopen selectable text without losing focus

- **WHEN** selectable copy text is revealed by a failure, busy state or waiting threshold, or the visitor dismisses/reopens it
- **THEN** asynchronous feedback never moves focus or text selection; `选择全部` explicitly focuses/selects the labelled field, and `收起复制文本` returns focus to the owning focusable copy control
- **AND** dismissal does not release a pending write guard, a timely retry success does not remove a focused/open fallback, and an explicit native copy gesture is not reported as verified automatic-copy success.

#### Scenario: Keep clipboard effects local

- **WHEN** writing is pending, a later attempt begins or the message unmounts
- **THEN** only the owning mounted action receives applicable feedback and stale completion cannot overwrite a newer attempt
- **AND** no clipboard read, automatic retry, hidden legacy copy command, persistent storage or service call occurs.

#### Scenario: Copy another answer while a write is pending

- **WHEN** another answer's copy control is activated before the current browser write settles
- **THEN** no second automatic write or delayed queue is created; the selected answer's manual-copy text is available with an accurate busy explanation
- **AND** the guard remains until actual settlement even if its initiating message unmounts; a subsequent automatic copy requires a new explicit activation, preserving the browser's user gesture.

#### Scenario: Recover from a write that does not settle promptly

- **WHEN** a browser write has not resolved or rejected after 5,000 milliseconds
- **THEN** pending-only feedback changes to an accurate waiting explanation with complete selectable text, and no success or cancellation is claimed
- **AND** the actual write guard remains held until settlement; late settlement cannot replace the fallback with stale success, and automatic retry never overlaps the unresolved write.
- **AND** actual settlement clears obsolete waiting/busy explanations using neutral ready-to-retry feedback without reopening a dismissed fallback or claiming that another answer was copied.

### Requirement: Responsive and independently verified answer actions

The system SHALL provide accessible source/copy behavior across the project responsive baseline and verify it with deterministic component and real-route browser tests.

#### Scenario: Read long sources and manual-copy text

- **WHEN** expanded sources/manual fallback contain long titles, UUIDs, values or locators at core mobile/desktop sizes and relevant intermediate/reduced-height widths
- **THEN** content wraps or scrolls in its intended region without horizontal page overflow, clipped focus or obscured composer/footer
- **AND** disclosure, citation/return and copy/select-all controls have Chinese names, visible focus and keyboard access; the read-only fallback needs no text entry.

#### Scenario: Exercise the real response lifecycle

- **WHEN** isolated browser tests submit text/image questions through the actual Next.js route using synthetic server upstreams
- **THEN** accepted evidence produces operable navigation and complete copying, including empty-source and repeated-key cases
- **AND** source/copy actions create no extra upstream requests; tests use no live model/archive/Storage or seeded owner data.
- **AND** server-side request counts are correlated to the test/request or run in an exclusive test-owned server phase; traffic from concurrently executing tests cannot contaminate before/after assertions.

#### Scenario: Read an older source while a new answer arrives

- **WHEN** a visitor navigates older evidence or selects manual-copy text while another chat request finishes, a newer draft changes or image selection updates
- **THEN** source/fallback state remains associated with that answer, incidental rerenders do not override the visitor's current focus/selection and automatic bottom-follow cannot pull the visitor away
- **AND** programmatic citation scrolling does not itself reactivate bottom-follow; an explicit return to the latest messages or a new submission can resume the existing follow behavior.
- **AND** deliberate visitor focus/selection changes, such as editing the composer or selecting another picture, take precedence; preservation never forces focus back to an older answer or blocks normal keyboard navigation.

#### Scenario: Inspect the largest accepted evidence response

- **WHEN** a synthetic reply accepted by the existing message validator exercises 64 E entries, four R inputs and four comparisons within the unchanged canonical/reply-byte budgets
- **THEN** every delivered entry remains reachable and the complete export/manual fallback retains every association without silent truncation
- **AND** source-free, record-only and mixed-scope cases remain covered; the large fixture stays outside product initial content and uses no real services.

#### Scenario: Report verification limits

- **WHEN** this change is reported complete
- **THEN** results identify component/full-check/browser/production-build/spec checks, representative visual inspection and responsive limitations
- **AND** synthetic success is not described as real-model/Thangka accuracy, native-device acceptance, measured audience coverage or deployed release verification.
