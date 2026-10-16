# Change: Text messages and conversation context

## Status

Roadmap draft, item 2 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

Users need to ask text questions and continue the same conversation.

## What Changes

- Support text composition, submission, message ordering, and current-conversation context.
- Handle pending responses, empty submissions, duplicate submission prevention, and request failures.

## Impact

- Affected specs: `text-conversation` (new capability).
- Affected code/systems: Conversation components, conversation state, and request handling.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

add-chat-interface. Use mocked response boundaries until add-grounded-answers supplies live generation.

## Deferred Detail

Submission gestures, pending and retry behavior, response transport, and whether conversations survive refresh.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
