# Change: Thangka database retrieval

## Status

Roadmap draft, item 4 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

Grounded answers need related archive records and the evidence supporting their fields.

## What Changes

- Retrieve relevant artists, artworks, images, and associated sources from the thangka schema.
- Preserve record identifiers, citation relationships, and ambiguity; handle empty results and query failures.
- Verify deployed schema and configure intended read access before business queries are exposed.

## Impact

- Affected specs: `thangka-retrieval` (new capability).
- Affected code/systems: Server-side Supabase integration, database types, and retrieval modules.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

No UI dependency. Provides evidence for add-grounded-answers and add-image-interpretation, and source data for add-answer-sources.

## Deferred Detail

Retrieval strategy, query interfaces, result contracts, deployed schema verification, generated types, and access configuration. Vector search is not assumed.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
