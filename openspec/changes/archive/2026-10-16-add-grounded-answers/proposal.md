# Change: Database-grounded AI answers

## Status

Implemented, manually accepted and archived on 2026-10-16, item 5 of 8, on `feat/add-grounded-answers` from merged main at `f9d60cf`, awaiting publication, merge and deployment. Requirements 1–4 are implemented, accepted, archived and merged. Query/answer contracts, budgets, errors, image boundaries and tests are specified in design.md; the follow-up resolved the five review findings and synchronized acceptance scenarios; the owner approved implementation on 2026-10-16; see [review.md](review.md). See [the live evaluation](live-evaluation.md) for bounded usage, findings and the successful separately authorized final recheck. OpenSpec archive promoted the grounded-answer capability and updated the text-conversation and image-upload specifications.

## Why

The demo needs useful answers that distinguish archive evidence from model general knowledge.

## What Changes

- Integrate DeepSeek generation with user questions, conversation context, and retrieved evidence.
- Keep database-supported claims, supporting record/source references, and general knowledge distinguishable.
- State insufficient or conflicting evidence without fabricating facts or citations.

## Impact

- Affected specs: `grounded-answers` (new), plus MODIFIED `text-conversation` and `image-upload` requirements for history/availability/recovery and image capability/deadline behavior.
- Affected code/systems: Server-side AI integration and answer orchestration.
- Shared constraints: follow [project context](../../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this change.

## Dependencies

The archived text-conversation, image-upload and retrieval capabilities provide the current foundation. The server-only `retrieveArchive` service already accepts strict structured queries and returns bounded candidates/evidence or explicit no-match/error outcomes. Its deployed read setup, generated types and smoke checks are verified; the archive is still empty. Do not request table definitions or a real dataset again as a planning prerequisite.

This change must map natural-language conversation intent to that existing structured retrieval contract and orchestrate actual generation. `add-image-interpretation` owns visual analysis/identification/comparison; `add-answer-sources` owns complete source inspection UI. Define interoperable evidence references here without claiming those later capabilities already work.

## Refined Delivery Direction

The refined design selects official DeepSeek Flash with explicit non-thinking JSON whole responses, at most two model calls and two existing retrieval queries, bounded context/evidence, server-owned references, corrective versus retryable failures and dedicated quality evaluation. Runtime code and deterministic tests are implemented; see [verification.md](verification.md) for actual results, completed acceptance and remaining deployment checks.

The technical design and delta now specify public/model contracts, scope, budgets, failure/corrective UX and acceptance scenarios. Tasks record completed local implementation, deterministic/live checks and owner manual acceptance. Deployment/access checks remain separate.

## Refinement Entry Point

[design.md](design.md) records confirmed constraints, integration boundaries and the selected engineering decisions. It is the approved implementation contract; adding environment examples does not enable or authorize paid calls.

## Review Status

All five review findings are resolved in the proposed contract: isolated server-process fixture tests; strict public message/reference/error types and canonical text; preflight/guarded question editing without replacing next drafts; 64-code-point terms/1,024 planner tokens and a 16,000-code-point context; POST-entry deadline and evidence_changed on inconsistent retrieval versions. A second consistency check added the missing full MODIFIED deltas for existing capabilities, retained valid image submission/display and clarified original non-UUID request identities versus UUID archive/assistant identities. No additional owner business information is needed for these engineering decisions. No paid calls or runtime implementation occurred during refinement. Runtime work began only after subsequent owner approval.

## Owner Clarifications

- The owner has a DeepSeek account and reports adding the API Key locally; the key was not inspected and the owner subsequently confirmed recharge and authorized the bounded local batch. Do not request the key in chat or treat this as unlimited future-call authorization.
- Usage is short-term demo/testing, with minimum practical spending while retaining evaluated answer quality. The exact budget has not been approved; a CNY 10–20 total planning envelope is a recommendation, not spending authorization.
- The owner accepted complete-response presentation: show a pending state, then publish the validated whole answer. Streaming is outside this initial direction.
- Free API alternatives and a low-cost official DeepSeek option were researched. No provider switch or alternative-provider implementation has been approved.
