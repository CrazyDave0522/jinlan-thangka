# Project Context

## Purpose

`jinlan-thangka` is an AI conversation demo about Thangka art. Users can send text messages and Thangka images, and the AI should generate answers grounded in the project's dedicated database. The initial goal is to demonstrate this workflow; this phase is not a commercial production release.

### Confirmed Demo Scope

- A conversation interface that accepts text messages and Thangka image uploads.
- Use DeepSeek as the AI provider; the specific model and API integration remain to be selected.
- Image conversations should support both identifying a specific artwork in the database and explaining its subject, deities, and artistic style. Identification must be supported by evidence rather than asserted from visual similarity alone.
- AI answers grounded in the dedicated Thangka database, whose data model covers artists, artworks, images, and supporting sources. Include the database records and source references used to support an answer.
- When database evidence is insufficient, the AI may supplement it with general knowledge, clearly distinguishing that knowledge from database-backed information. It must acknowledge uncertainty and must not fabricate facts, artwork identities, or citations.
- No login, user accounts, application roles, or permission-management interface for this phase.
- Supabase hosts the existing database tables. Supabase Storage is the planned image storage service, and Vercel is the confirmed deployment platform.

These are confirmed requirements, not completed features. The repository currently contains a Next.js starter application, Supabase client and session-refresh setup, and a documented database schema. The chat interface, image-upload flow, AI integration, and database retrieval flow are not implemented. An administration interface, Excel importer, and commercial account workflows are outside the confirmed demo scope.

## Tech Stack

The following versions and ranges are declared in `package.json`:

- Node.js 24.x, with `.nvmrc` for local version selection.
- Next.js 16.4.1 using the App Router in `src/app`.
- React and React DOM 19.3.0.
- TypeScript 5.x with strict checking.
- Tailwind CSS 4.x, integrated through `@tailwindcss/turbopack`.
- shadcn/ui with its `base-nova` preset (Base UI primitives), neutral theme, and Lucide React icons.
- Supabase JavaScript client `^2.117.3` and SSR helpers `^0.12.7`.
- PostgreSQL schema reference targeting version 13+; the deployed database version is unverified.
- ESLint 9.x with Next.js Core Web Vitals and TypeScript configurations.
- npm with `package-lock.json` for dependency locking.
- OpenSpec for project context, capability specifications, and change proposals.

## Project Conventions

### Code Style

- Use English for project documentation, source comments, SQL comments, metadata descriptions, and interface text, as required by the root `AGENTS.md`.
- Follow the existing TypeScript style: double quotes, semicolons, and two-space indentation. No separate formatter configuration is currently present.
- Use the `@/*` alias for imports rooted in `src`; existing Supabase helpers also use relative imports within their directory.
- Preserve database identifiers in snake_case, as defined by the supplied SQL.
- Reuse shadcn/ui components from `src/components/ui` with their default variants and semantic theme colors. Use Lucide for icons and keep the existing Geist fonts. Avoid mixing UI libraries or introducing page-specific color palettes.
- Do not introduce new naming or formatting rules as established policy without agreement.

### Architecture Patterns

- `src/app/` contains routes, layouts, and global styles. The home page and metadata still contain starter content; the home page uses shared button styles and a Lucide icon.
- `components.json` configures shadcn/ui. Theme tokens live in `src/app/globals.css`; the initial components are Button, Input, Textarea, and Card. Light and dark tokens are defined, but no theme switcher is configured. Add components with `npx shadcn add <component>` when required.
- `src/lib/supabase/client.ts` creates the browser client. `src/lib/supabase/server.ts` creates a request-specific server client and is marked `server-only`.
- `src/lib/supabase/config.ts` reads the public project URL and publishable key and fails explicitly when they are missing.
- `src/proxy.ts` refreshes authentication cookies and preserves response cache headers. It does not protect routes or assign application roles.
- The demo does not require authentication. Existing session-refresh helpers do not imply a login requirement. Do not share session-specific clients across requests or place them in a shared cache; if authentication is introduced later, verify claims or user identity rather than trust `getSession()` alone.
- `next.config.ts` enables Cache Components and partial prefetching. Follow the local Next.js guides for request-dependent rendering and caching; do not cache user-specific data as shared content.
- Business tables belong to the `thangka` schema. Current clients do not select it by default; future queries must select it explicitly or configure the client accordingly.
- `database/schema.sql` is a reference initialization script, not an automatic migration. `docs/database.md` explains relationships, import conventions, and integration requirements.
- No dedicated state-management library, API layer, generated database types, or import pipeline is currently established.
- DeepSeek is the confirmed AI provider. The specific model, database retrieval method, and image-matching approach remain undecided. Do not assume vector search, embeddings, direct model-generated SQL, or any particular AI SDK is required.
- The DeepSeek model decision is explicitly deferred. Consult the [official Vision guide](https://api-docs.deepseek.com/guides/vision/) when selecting and validating image input; no model is selected by this document.

### Testing Strategy

Use **Vitest with React Testing Library** for unit tests, synchronous React component tests, and integration tests that can run independently of a Next.js server. Configuration lives in `vitest.config.mts`; shared DOM matchers and cleanup live in `tests/setup.ts`. See [docs/testing.md](../docs/testing.md).

For every implemented requirement, add or update behavior tests for its acceptance criteria and relevant failure paths, then run `npm run check` (lint, TypeScript checks, and the full Vitest suite). Fix failures before reporting completion; disclose any checks that could not run. Use `npm test` for a single suite run and `npm run test:watch` during development. Run `npm run build` for changes that affect application integration or build behavior.

Routine tests use explicit fixtures and mocked external boundaries, not real Supabase data or paid DeepSeek calls. The existing tests validate configuration errors and render the starter home page; they do not validate the planned AI features. Update the home-page smoke test when replacing the starter screen.

Vitest does not directly support async Server Components or replace real browser end-to-end tests of Next.js routing, cookies, uploads, and streaming. Add browser coverage when implemented requirements depend on those flows. No browser test framework, automated CI workflow, or coverage threshold is configured yet.

Demo acceptance examples should cover text questions, matching a known database artwork from an image, subject/deity/style explanations, ambiguous or unmatched images, insufficient database evidence, and separation of general knowledge from database-supported claims. Citation checks must verify that referenced records and sources exist and actually support the associated claims. The owner confirms that there is currently no project data. Sample records, images, and concrete acceptance questions are explicitly deferred until data is available.

### Git Workflow

- The GitHub repository is `CrazyDave0522/jinlan-thangka`, with `origin` configured and existing work committed on `main`.
- Recent commits use concise English descriptions. No mandatory commit-message format, feature-branch policy, or pull-request policy has been established.
- Keep credentials and local environment files out of version control. `.env.example` is the tracked configuration template.
- Follow `openspec/AGENTS.md` for new capabilities, breaking changes, architecture changes, and security changes. Prepare a proposal and obtain approval before implementing changes that require that workflow.
- Routine context documentation edits do not constitute approval for feature implementation or database changes.

## Domain Context

The schema has four core tables: `artists`, `artworks`, `images`, and `sources`. Four relationship tables connect artworks to artists and attach citations to artists, artworks, and images: `artwork_artists`, `artist_sources`, `artwork_sources`, and `image_sources`.

- Names and titles are not unique. Distinguish records by UUID and supporting context; do not silently associate records by names alone.
- Artist relationships are many-to-many. Overall artwork attribution and attribution to a particular candidate artist are separate concepts. `not_recorded` and explicitly `unknown` authorship are distinct; do not create placeholder artists for unknown authorship.
- Preserve original date and period wording. Populate normalized years only with evidence; do not infer precise dates from approximate periods.
- Each image belongs to an artwork. Only `images.is_primary` records primary-image status, with at most one primary image per artwork and none allowed.
- Source relationships record supported fields, citation locations, and evidence. Conflicting sources are allowed and must remain distinguishable.
- Image accessibility and record verification do not establish usage rights. Display and AI processing must respect the recorded license and permission scope.
- Planned Excel import rules require preserving original files, previewing conflicts, resolving ambiguous matches manually, retaining original-record-to-UUID mappings, and writing transactionally. These rules describe a future importer, not an existing feature.
- This schema stores human-curated information. AI inferences, image vectors, chat data, and review history are reserved for separate future tables; model output must not automatically overwrite original knowledge fields.

See [database/schema.sql](../database/schema.sql) for exact definitions and [docs/database.md](../docs/database.md) for interpretation and integration notes.

## Important Constraints

- Read relevant guides in `node_modules/next/dist/docs/` before changing Next.js code, as required by `AGENTS.md`; do not assume older framework conventions apply.
- Do not execute the initialization script against an existing database. It creates the schema in a transaction and fails on existing objects. Future structural changes need separate incremental migrations.
- The reference SQL does not configure RLS, access policies, application accounts, or role grants. Confirm the deployed schema and access model before exposing business data through the Data API.
- Never expose a Supabase secret or service-role key through `NEXT_PUBLIC_` variables. Local credentials belong in ignored environment files; shared examples must contain no secrets.
- The owner confirms that the tables already exist in Supabase, but there is currently no project data and grants and RLS policies have not been configured. Exact agreement with the checked-in SQL, effective platform permissions, bucket configuration, and deployment status have not been independently verified.
- No login or application permission system is required for the demo. This does not establish unrestricted anonymous database writes or public Storage access; the technical data-access and upload configuration remains to be decided.
- Keep this phase focused on demonstrating text/image conversation and database-grounded answers. Defer the DeepSeek model choice and sample-data decisions. Conversation persistence, upload retention, and detailed storage behavior belong to later requirements and implementation work, not current project-context questions.
- No additional application-specific upload restrictions have been requested. Do not invent file-size, format, or retention requirements; determine implementation settings later within the services' actual limits.
- Never present model general knowledge as retrieved database evidence. If evidence is missing or ambiguous, state that limitation; do not invent an artwork match, attribution, historical fact, source title, URL, or page number. Live web search is not an agreed requirement.

## External Dependencies

- Supabase: the owner confirms the database tables have been created, no project data is available yet, and grants and RLS policies have not been configured. Client integration exists for database access and authentication session handling. Expected public variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Business queries are not implemented, and login flows are not required for this demo.
- GitHub: source repository and configured Git remote. No CI workflow is currently present.
- Google Fonts: the root layout uses Geist and Geist Mono through `next/font/google`.
- Vercel: confirmed deployment platform. Current deployment status and environment setup have not been verified.
- Supabase Storage: confirmed planned image storage service. A specific bucket name and its configuration have not been provided. Bucket setup, object paths, upload handling, and retention are deferred to implementation; no additional application-specific limits are currently requested.
- DeepSeek: confirmed AI provider for conversation and answer generation. The exact model, API credentials setup, SDK, and spending limit remain undecided; no AI integration is currently implemented. Image input is documented in the [official Vision guide](https://api-docs.deepseek.com/guides/vision/). No vector or analytics service is configured.

## Decisions Deferred to Later Work

This document records project background, confirmed goals, technical context, and shared constraints. Detailed product behavior and presentation belong in future requirements and change proposals.

- DeepSeek model selection and API integration: explicitly deferred by the owner.
- Sample records, images, and demo acceptance examples: deferred because there is currently no project data.
- Source presentation and citation layout: decide during product requirements design. The principle of providing supporting sources is already confirmed.
- Conversation behavior after refresh, saved history, and uploaded-image retention: discuss during requirements design and development.
- Supabase Storage bucket naming and configuration, upload settings, and database access configuration: resolve during implementation. Grants and RLS policies have not been configured; do not assume effective access from this statement alone.

Do not treat these deferred items as unanswered prerequisites for completing this project context or introduce implementation requirements without agreement.
