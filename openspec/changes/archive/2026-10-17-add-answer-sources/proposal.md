# Change: Source inspection and answer actions

## Status

Implemented locally on 2026-10-17 on `feat/add-answer-sources`, following four owner-requested review rounds. The owner's subsequent request to proceed after checking implementation readiness was taken together with the existing instruction to start requirement 7 as authorization to implement this reviewed scope. The [verification record](verification.md) documents completed checks and remaining owner acceptance. Archived on 2026-10-17 after the owner requested archival if ready, using the project's established implementation-stage boundary; see the [archive assessment](archival.md). Hands-on owner acceptance, deployment, merge and publication have not been established by this archival.

## Why

Answers already distinguish archive evidence, image observations and general knowledge, but evidence markers are plain text and source/copy controls remain disabled. Users need to follow a claim to its actual record/source details and copy an answer without losing its qualifications or image associations.

## What Changes

- Replace disabled actions with a per-answer expandable source area and a working copy control, using the existing shared UI system and reference layout.
- Make archive evidence markers open and focus their matching record/field entry, with a return-to-citation action. Keep all state and targets local to their answer.
- Show delivered record identities, field/values, review/attribution statuses, source titles/identities, supported fields and citation locations. Preserve missing, unscoped and conflicting evidence explicitly.
- Share source presentation between text/image answers while preserving current/prior observations, stable picture labels, candidate/identified states and separate archive-reference-image provenance.
- Expose delivered observation qualifications and actual comparison proofs/contradictions, including shared reference images and evidence keys used only by comparison proofs.
- Copy the complete readable answer as plain text, including sources and uncertainty even when sources are collapsed. Await actual clipboard success and offer selectable text on failure/unavailability.
- Coordinate automatic clipboard writes across answers, recover from prolonged waiting without claiming cancellation, and preserve source-reading focus/scroll when a new answer arrives.
- Verify keyboard/focus behavior, per-answer independence, long-content wrapping and source/copy states across the existing desktop/mobile browser matrix using synthetic fixtures.

## Impact

- Affected specs: `answer-sources` (new capability), `chat-interface` (replace placeholders and the obsolete disabled-actions constraint).
- Affected code: `src/components/chat/chat-message.tsx`, `image-answer.tsx`, `chat-interface.tsx`, `chat-conversation.tsx`, shared source/copy coordination and pure formatting helpers; component/browser fixtures and acceptance tests.
- Data/API impact: reuse validated `AssistantMessage`, image `Assistant`/`ImageRequest`, `AnswerReference` and `SourceCitation`. No migration, new route, on-expand retrieval, provider call, response-field expansion or canonical conversation-text change.
- Shared constraints: follow [project context](../../../project.md). Real-data preparation remains deferred; the product opens with an empty conversation. No login, administration UI, Excel importer, live web search, theme switcher, saved history or curated-image display is added.

## Dependencies

The six preceding capabilities are implemented and archived; their code is included in local `main` at this branch's creation. Source identifiers and claim-evidence associations originate upstream rather than being invented in the UI.

The [image-interpretation design](../2026-10-17-add-image-interpretation/design.md) fixes selected-image, observation and image-to-record contracts. Visitor picture references identify inputs; curated comparisons identify actual archive image/work rows processed under the existing permission gate. Neither is a bibliographic citation or proof of physical genuineness. Inspection cannot strengthen an identity decision or authorize another image read.

## Decisions for Review

1. Use one inline collapsible area per answer, initially closed, within the existing answer card. Count archive evidence entries separately from archive-reference-image entries. Hide the control when neither exists.
2. Reuse delivered title, locator and stable source/link identities. The public citation contract omits author, publication year, publisher and URL; this increment does not expose or infer them. Do not turn record values or source text into automatic external links.
3. Keep each evidence field and actual source-link/locator association distinct, including repeated titles/shared sources. Preserve exact comparison bindings/proofs/contradictions and relevant picture observation qualifications. Distinguish same-label candidates by identity and retain per-group candidate caps. Associated sources are not automatically field-specific confirmation.
4. Copy a dedicated presentation export, preserving sections, picture/group states, limitations, sources and notices, independently of disclosure state. Retain literal field/source text while excluding attachment/request transport and unrelated history. Do not mutate accepted snapshots or substitute the export for canonical model context. Earlier answers retain their original evidence when later retrieval changes the same records/sources.
5. Use user-initiated `navigator.clipboard.writeText` with one unresolved automatic write per page. On failure/unavailability/contention or five seconds of waiting, expose dismissible/selectable text without autofocus. A UI timeout does not cancel the write or release its lease; late settlement provides neutral retry readiness rather than stale success. Later automatic copying requires explicit activation. Do not read the clipboard or initiate service requests.
6. Preserve source/fallback state and reading position under incidental updates without overriding deliberate visitor focus/selection changes. Source navigation must not reactivate automatic bottom-follow by itself, and asynchronous copy feedback must not move focus or remove an open fallback.

Details are in [design.md](design.md); acceptance scenarios are in the [new capability delta](specs/answer-sources/spec.md) and [chat-interface delta](specs/chat-interface/spec.md). No unresolved product decision is required to review this proposal.

## Acceptance Boundary

This increment verifies inspection/copying over accepted message contracts, including empty-archive behavior and synthetic positive/uncertain evidence. Real-model factual accuracy, real Thangka identity, curated access and deployed Vercel behavior retain their recorded later acceptance work. Approval, implementation checks and eventual acceptance must be recorded separately; branch creation or spec validation does not establish implementation completion.

## Proposal Verification

The initial refinement on 2026-10-17 passed strict validation for this change/all eight active-spec items and checked 22 local file links. The [review record](review.md) covers clipboard states, visual proof qualifications, reading/focus behavior, snapshot/export boundaries and isolated verification. The revised capability contains seven requirements and 32 scenarios. The chat-interface delta preserves all five composer scenarios and changes only their obsolete source/copy-disabled clause; the placeholder requirement is explicitly renamed and replaced. Those documentation reviews and local validator feasibility probes preceded implementation and changed no business code, interface or environment settings. Executed source/copy implementation checks and their limits are recorded separately in [verification.md](verification.md).
