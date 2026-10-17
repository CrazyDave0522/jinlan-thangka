# Change: Source inspection and answer actions

## Status

Roadmap draft, item 7 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

Users need to inspect the evidence behind an answer through the source presentation shown in the reference.

## What Changes

- Present database evidence and general-knowledge supplements as distinguishable answer content.
- Provide expandable source details, supporting archive record references, available citation locations, and answer copying.

## Impact

- Affected specs: `answer-sources` (new capability).
- Affected code/systems: Answer components and source presentation.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

add-chat-interface, add-thangka-retrieval, and add-grounded-answers. Source identifiers and claim-evidence associations originate upstream, rather than being invented in the UI. The implemented [image-interpretation design](../archive/2026-10-17-add-image-interpretation/design.md) fixes selected-image, observation and image-to-record contracts with separate visual blocks; preserve its stable image labels, identity evidence and visual/archive/general distinction when refining source inspection. Visitor image references identify inputs; curated comparison references identify actual archive image/work rows and their permission provenance. Neither is a model-created bibliographic citation. Preserve observation uncertainty and actual identified/candidate state when rendering sources; do not imply that a reference image by itself proves identity. This dependency note does not approve source-UI implementation.

## Deferred Detail

Source layout, claim-to-source navigation, missing bibliographic field presentation, and copy interaction details.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
