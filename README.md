# jinlan-thangka

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 24 LTS. With nvm, run `nvm install` and `nvm use` in this directory.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The home page provides a page-local Thangka conversation with JPEG/PNG inputs. Up to four new or explicitly selected historical pictures are active per attempt, and twenty prepared attachments are retained across the page. Selected bytes travel in version-2 JSON without visitor Storage uploads or persistence. Ordinary follow-ups reuse bounded prior observations; explicit reread carries the original question while preserving newer drafts. See [storage and limits](./docs/storage.md).

Server-only DeepSeek processing uses at most two calls: selected-image analysis followed by text answering, or bounded targeted verification with authorized archive references. Replies distinguish current/prior observations, archive evidence, general knowledge and identified/candidate/insufficient states. Generation and vision are independently disabled by default. Missing/off vision declines selected images before paid work. Failed questions, manual retries and guarded editing preserve independent drafts. Reload clears the page. Answers now provide expandable record/source details, exact citation navigation and complete plain-text copying with a selectable fallback. Inspection/copying uses the accepted answer snapshot without extra service calls or changing model context. No example conversation is preloaded.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## UI components

The UI uses shadcn/ui (`base-nova`, neutral theme), Lucide icons, and the existing Geist fonts. Base components are in `src/components/ui`; shared theme tokens are in `src/app/globals.css`. Reuse the default components and variants to keep the interface consistent. See `components.json` for CLI configuration.

Add components as needed with `npx shadcn add <component>`. Import icons from `lucide-react`. Light and dark theme tokens are available; no theme switcher is configured.

## Testing

Run `npm run check` after completing each requirement. It runs ESLint, TypeScript checking, and the full Vitest suite. Add or update tests for the requirement before running the checks.

- `npm test`: run all unit and component tests once.
- `npm run test:watch`: rerun tests as files change.
- `npm run typecheck`: check TypeScript without emitting files.
- `npm run build`: verify the production build when application integration changes.
- `npx playwright install chromium`: install the browser for browser tests.
- `npm run test:e2e`: build and test production text/image request lifecycles plus isolated message components across the mainstream viewport matrix (ports 3100, 3101 and 3102).

See [the testing guide](./docs/testing.md) for test locations, external-service mocks, and framework limitations.

## Supabase

1. Copy [.env.example](./.env.example) to `.env.local` and fill in the Project URL and publishable key (a legacy anon key also works).
2. Add the same variables in Vercel → Project Settings → Environment Variables for the environments you use, then redeploy. Public variables are embedded at build time.
3. Import `createClient` from [the browser client](./src/lib/supabase/client.ts) in Client Components, or await `createClient` from [the server client](./src/lib/supabase/server.ts) in Server Components, Server Actions, and Route Handlers.

The [proxy](./src/proxy.ts) refreshes Auth cookies and preserves cache headers. It does not restrict access to pages. Login UI and protected routes await authentication requirements; archive SDK types have been generated from the verified project into `src/lib/retrieval/database.generated.ts`. Server-side authorization must verify `auth.getClaims()` (or `auth.getUser()` where appropriate), rather than trusting `getSession()`.

The supplied database structure is preserved in [database/schema.sql](./database/schema.sql), with relationships, import rules, review findings, and integration requirements in [docs/database.md](./docs/database.md). Business tables use the `thangka` schema. The SQL is a reference initialization script, not an automatic migration; do not rerun it against an existing database. Before adding Data API queries, verify the deployed schema and define intended read/write permissions, schema exposure, grants, and RLS policies. This app setup does not create or change tables or policies. Never put a secret or `service_role` key in a `NEXT_PUBLIC_` variable.

A server-only structured archive retrieval service in [src/lib/retrieval/service.ts](./src/lib/retrieval/service.ts) supplies fresh evidence to enabled text-answer orchestration. It uses a separate stateless anon reader and retains identities, uncertainty and scoped evidence with bounded results. See [the setup guide](./docs/retrieval-setup.md) for incremental SQL, exposed schema/read permissions, live-generated SDK types, runtime validation and the live smoke command. The owner completed function/read-access setup and schema exposure; repeated anon smoke checks pass (HTTP 200 for all eight tables and the RPC). Live-generated type and final table/RPC metadata comparisons also pass; the owner has reviewed and accepted the implementation; archived at the owner's explicit request on 2026-10-16. Existing table definitions are already documented; no sample data is needed.

This project enables Cache Components: place server components that read request cookies/data beneath a Suspense boundary, and do not put a session-specific Supabase client in a shared cache. Auth-changing Route Handlers must also return private/no-store responses.

Setup follows the [Supabase Next.js SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

## Next.js Resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## DeepSeek Configuration

Requirement 5 now includes the server-only text adapter and bounded two-call orchestration. Put `DEEPSEEK_API_KEY` in the ignored project-root `.env.local`, never in `NEXT_PUBLIC_` variables or tracked files. Use `DEEPSEEK_MODEL=deepseek-flash`; keep `DEEPSEEK_ENABLED=false` and `DEEPSEEK_VISION_ENABLED=false` until explicitly authorizing funded testing. Merely adding a key does not enable calls. Restart `npm run dev` after local changes; on Vercel set the same server-only names and redeploy. Never share the key in chat, screenshots or logs.

See [AI setup and evaluation](./docs/ai-setup.md) for activation, limits and remaining live checks. Routine tests use synthetic server-process upstreams and make no paid calls. Local implementation does not establish real-model factual quality or deployed function limits.

Requirement 7 is implemented and archived at the owner's request on 2026-10-17 at the implementation stage. Its [verification record](openspec/changes/archive/2026-10-17-add-answer-sources/verification.md) records 386 passing unit/component tests, 85 passing browser cases and the ordinary production build; hands-on owner review, real-data/domain and deployment acceptance remain outstanding or deferred.

Requirement 6 was approved for implementation and archived at the owner's request on 2026-10-17; its code is implemented on this branch. Its [verification record](openspec/changes/archive/2026-10-17-add-image-interpretation/verification.md) separates deterministic coverage from outstanding real-image, permission, latency and deployment acceptance. The production reference manifest remains empty. The owner withdrew the previous archive dataset and deferred real-data preparation; current development uses empty-archive behavior and synthetic fixtures. The owner-authorized [empty-archive runtime evaluation](openspec/changes/archive/2026-10-17-add-image-interpretation/empty-archive-evaluation.md) records corrected model output/retrieval/semantic failures and a passing final eight-case round; this does not establish real Thangka or positive record-identification accuracy. Paid settings were used only in stopped temporary server processes; .env.local was unchanged.

Requirement 5 was manually accepted and archived on 2026-10-16. The first authorized local live batch and its quality corrections are recorded in [the live evaluation](./openspec/changes/archive/2026-10-16-add-grounded-answers/live-evaluation.md). It is not an all-pass factual-accuracy claim; the final required-fields correction passed a separately authorized two-call recheck.
