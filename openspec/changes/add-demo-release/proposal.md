# Change: End-to-end demo acceptance and deployment

## Status

Roadmap draft, item 8 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

The integrated demo needs verified browser behavior and a working Vercel release.

## What Changes

- Verify the full text/image conversation, retrieval, generation, and source-inspection flows with browser coverage.
- Complete release verification of database and Storage access, server-only secrets, and Vercel environment configuration.
- Deploy and verify the demo using agreed samples, reporting any limits of real-model validation.

## Impact

- Affected specs: `demo-release` (new capability).
- Affected code/systems: Browser acceptance tests, deployment configuration, and release documentation.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

All seven preceding changes. Each change owns its behavior tests and necessary service access setup; this change verifies the integrated release.

## Deferred Detail

Browser test tooling, concrete acceptance samples, deployment environment details, and release procedure. Real identification quality requires agreed real records, images, and sources.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
