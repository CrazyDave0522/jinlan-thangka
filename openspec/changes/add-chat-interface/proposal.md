# Change: Conversation interface

## Status

Roadmap draft, item 1 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

The starter page does not provide the conversation experience shown in the desktop reference.

## What Changes

- Build the branded conversation layout, message presentation, composer, and footer from the reference.
- Provide initial and populated presentation states with Simplified Chinese interface copy and a usable narrow-screen layout.

## Impact

- Affected specs: `chat-interface` (new capability).
- Affected code/systems: src/app, shared UI components, and brand assets.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

None. Explicitly labeled fixtures may be used before the conversation services exist.

## Deferred Detail

Exact empty-state content, responsive behavior, and component acceptance scenarios.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
