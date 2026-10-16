# Change: Thangka image identification and interpretation

## Status

Roadmap draft, item 6 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

Image questions need both careful artwork identification and explanations of visible subject matter and artistic features.

## What Changes

- Analyze submitted images for subject, deities, and artistic style, and retrieve candidate archive works.
- Confirm a specific artwork only when supported by evidence; preserve uncertain and unmatched outcomes.
- Respect recorded image permissions for display and model processing.

## Impact

- Affected specs: `image-interpretation` (new capability).
- Affected code/systems: Image analysis, candidate retrieval, and answer orchestration.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

add-image-upload, add-thangka-retrieval, and add-grounded-answers.

## Deferred Detail

Validated image-capable model/API path, candidate retrieval approach, matching evidence criteria, and real-image evaluation samples. Visual similarity alone is not identification evidence.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
