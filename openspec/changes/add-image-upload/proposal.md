# Change: Image upload and message attachments

## Status

Roadmap draft, item 3 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

The demo requires users to submit Thangka images, optionally with a text question.

## What Changes

- Support image selection, preview, removal before submission, and attachment display.
- Upload submitted images to Supabase Storage and handle upload failures.

## Impact

- Affected specs: `image-upload` (new capability).
- Affected code/systems: Message composer, attachment components, and Storage integration.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

add-chat-interface and add-text-conversation. Storage access must be established as part of this change; image analysis belongs to add-image-interpretation.

## Deferred Detail

Bucket configuration, object paths, service-compatible upload settings, image retention, and detailed retry behavior. No additional application-specific upload limits are established here.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
