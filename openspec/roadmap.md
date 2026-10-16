# Demo Implementation Roadmap

These eight changes record the agreed implementation breakdown. Requirements 1–4 are implemented, accepted, archived and merged; their current capabilities live under `specs/` and historical acceptance/deployment notes remain in their archives. Requirement 5 is implemented, manually accepted and archived on `feat/add-grounded-answers`, awaiting publication, merge and deployment; [verification](changes/archive/2026-10-16-add-grounded-answers/verification.md) records deterministic checks, the completed bounded local live evaluation, owner acceptance and remaining deployment checks. Items 6–8 remain scope drafts. Detailed behavior, failure scenarios, technical decisions and tasks are written when each change is selected.

| Order | Change                                                                   | Scope                                           |
| ----- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| 1     | [add-chat-interface](changes/archive/2026-10-16-add-chat-interface/proposal.md)             | Conversation interface                          |
| 2     | [add-text-conversation](changes/archive/2026-10-16-add-text-conversation/proposal.md)       | Text messages and conversation context          |
| 3     | [add-image-upload](changes/archive/2026-10-16-add-image-upload/proposal.md)                 | In-memory images and transient submission       |
| 4     | [add-thangka-retrieval](changes/archive/2026-10-16-add-thangka-retrieval/proposal.md)       | Thangka database retrieval                      |
| 5     | [add-grounded-answers](changes/archive/2026-10-16-add-grounded-answers/proposal.md)         | Database-grounded AI answers                    |
| 6     | [add-image-interpretation](changes/add-image-interpretation/proposal.md) | Thangka image identification and interpretation |
| 7     | [add-answer-sources](changes/add-answer-sources/proposal.md)             | Source inspection and answer actions            |
| 8     | [add-demo-release](changes/add-demo-release/proposal.md)                 | End-to-end demo acceptance and deployment       |

## Working Sequence

1. Build the interface and conversation interactions (items 1–3), using synthetic fixtures only in tests or development-only verification where services are not yet available. The product home page opens with empty welcome guidance.
2. Establish retrieval and grounded text answers (items 4–5), defining record, evidence, and source contracts together.
3. Add image interpretation and complete source inspection (items 6–7). Source UI may be completed before image interpretation if useful.
4. Verify and deploy the integrated demo (item 8).

The order is a delivery guide; each proposal states its actual dependencies. Each change owns its tests and the service configuration needed for its behavior. Release acceptance does not defer those responsibilities.

## Refinement Workflow

- Select one draft and review earlier changes and the current specifications.
- Expand its requirements and acceptance scenarios, resolve relevant deferred decisions, and add a technical design where required.
- Replace high-level delivery tasks with concrete tasks, validate strictly, and obtain proposal approval before implementing.
- Implement and test that change, then follow the normal deployment and archival workflow. Update later drafts if earlier decisions affect them.
- Keep proposed capabilities under `changes/`; only promote them to `specs/` through the normal OpenSpec workflow.

## Boundaries

Responsive behavior is a shared acceptance requirement across this roadmap, not a ninth change. Each UI change must apply the baseline in [project.md](project.md) and the browser matrix in [docs/testing.md](../docs/testing.md) to its own states and interactions. The release change verifies integrated behavior; it does not defer responsive work until release.

Follow [project.md](project.md) for confirmed scope and deferred decisions. This roadmap does not choose a DeepSeek model, a vector-search architecture, conversation persistence, upload limits, or new product capabilities. Visitor images follow the owner-confirmed page-local/transient-processing boundary; Supabase Storage is for curated knowledge-base assets. Routine development uses synthetic fixtures and mocked services; real image-identification acceptance needs agreed archive records, images, and sources.
