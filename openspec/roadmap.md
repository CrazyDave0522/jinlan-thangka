# Demo Implementation Roadmap

These eight changes record the agreed implementation breakdown. Requirements 1–7 are implemented, archived and included in local `main` through `c841ea4`. Requirements 1–5 have the owner acceptance recorded in their archives; requirements 6–7 were archived at the owner's request at the implementation stage, with hands-on, real-data/domain and deployed acceptance still outstanding where recorded. The current capabilities live under `specs/`. Item 8's local engineering checks passed 406 unit/component/SQL tests, 107 isolated Chromium cases and the ordinary production build; see [release verification](changes/add-demo-release/verification.md). These results do not identify or accept the deployed revision.

The owner withdrew the previous dataset and deferred curated-data preparation. Current engineering checks use isolated synthetic fixtures and empty-archive behavior. The archived [image verification](changes/archive/2026-10-17-add-image-interpretation/verification.md) preserves earlier failures, corrections and the passing authorized empty-archive runtime round; it does not establish real-work identification or domain accuracy. The [source verification](changes/archive/2026-10-17-add-answer-sources/verification.md) retains owner hands-on and deployment limits. Historical test counts in those archives remain evidence of their own revisions.

Item 8's [proposal](changes/add-demo-release/proposal.md) on `feat/add-demo-release` separates A (empty-archive engineering and Preview acceptance) from B (deferred real-data/domain acceptance). The owner approved starting A on 2026-10-17; local engineering is complete, while A and whole acceptance remain open. The owner supplied [the existing Vercel URL](https://jinlan-thangka.vercel.app/), reported corrected variables and redeployment, and connected Vercel; the subsequent owner-completed CLI login resolves the remaining current-project inspection access. [Public diagnostics](changes/add-demo-release/review.md#owner-reconfiguration-and-redeployment-recheck) pass, and fresh actual Supabase anon/administrative checks confirm the local configuration's eight-table empty archive and expected read permissions. Current-project identity, Production revision, root/default build settings and 60-second chat duration are inspected. Saved Vercel Supabase Config matches the inspected archive. Actual release-branch Preview/configuration/access, current Data API settings, funded scope, owner review and rollback remain open.

| Order | Change                                                                                      | Scope                                           |
| ----- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1     | [add-chat-interface](changes/archive/2026-10-16-add-chat-interface/proposal.md)             | Conversation interface                          |
| 2     | [add-text-conversation](changes/archive/2026-10-16-add-text-conversation/proposal.md)       | Text messages and conversation context          |
| 3     | [add-image-upload](changes/archive/2026-10-16-add-image-upload/proposal.md)                 | In-memory images and transient submission       |
| 4     | [add-thangka-retrieval](changes/archive/2026-10-16-add-thangka-retrieval/proposal.md)       | Thangka database retrieval                      |
| 5     | [add-grounded-answers](changes/archive/2026-10-16-add-grounded-answers/proposal.md)         | Database-grounded AI answers                    |
| 6     | [add-image-interpretation](changes/archive/2026-10-17-add-image-interpretation/proposal.md) | Thangka image identification and interpretation |
| 7     | [add-answer-sources](changes/archive/2026-10-17-add-answer-sources/proposal.md)                                | Source inspection and answer actions            |
| 8     | [add-demo-release](changes/add-demo-release/proposal.md)                                    | End-to-end demo acceptance and deployment       |

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
