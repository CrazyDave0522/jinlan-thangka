# Change: End-to-end demo acceptance and deployment

## Status

Roadmap draft, item 8 of 8. Scope only; detailed requirements and implementation tasks will be refined when this change is selected. Creating this draft does not approve implementation.

## Why

The integrated demo needs verified browser behavior and a working Vercel release.

## What Changes

- Verify the full text/image conversation, retrieval, generation, and source-inspection flows with browser coverage.
- Complete release verification of database access, server-only secrets and Vercel environment configuration; verify curated Storage access only if an approved enabled capability requires curated assets. Visitor images require no bucket.
- Deploy and verify the demo using agreed samples, reporting any limits of real-model validation.

## Impact

- Affected specs: `demo-release` (new capability).
- Affected code/systems: Browser acceptance tests, deployment configuration, and release documentation.
- Shared constraints: follow [project context](../../project.md); no login, administration UI, Excel importer, live web search, or theme switcher is added by this draft.

## Dependencies

All seven preceding changes. Each change owns its behavior tests and necessary service access setup; this change verifies the integrated release. The approved, locally implemented requirement-6 change includes evidence-supported specific archive-work identification with selected visitor images and bounded rights-gated reference verification for ordinary unnumbered photos. Release acceptance must include numbered-positive, ordinary-unnumbered-positive and visually-similar-different-work-negative cases, including actual curated-asset permission/access for the reference branch; until representative records/images are available, identification quality remains unverified rather than deferred out of scope. Visitor selection/transport and fixture development remain independent of curated buckets; real reference-branch acceptance requires corresponding assets and reviewed permissions.

## Deferred Detail

Change-specific integrated browser cases using the existing Playwright/Chromium tooling and server-process upstream fixtures, concrete acceptance samples, deployment environment details, and release procedure. Real identification quality requires agreed real records, images, and sources.

Add a technical design before implementation where required by the OpenSpec workflow. The accompanying spec records a minimum scope scenario, not a complete acceptance specification.
