# Change: Database-grounded AI answers

## Status

Roadmap draft, item 5 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

The demo needs useful answers that distinguish archive evidence from model general knowledge.

## What Changes

- Integrate DeepSeek generation with user questions, conversation context, and retrieved evidence.
- Keep database-supported claims, supporting record/source references, and general knowledge distinguishable.
- State insufficient or conflicting evidence without fabricating facts or citations.

## Impact

- Affected specs: `grounded-answers` (new capability).
- Affected code/systems: Server-side AI integration and answer orchestration.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

add-text-conversation and add-thangka-retrieval. Define evidence/reference output alongside retrieval; add-answer-sources owns the complete source inspection UI.

## Deferred Detail

DeepSeek model and API integration, response contracts, prompting, failure behavior, and detailed quality evaluation scenarios.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
