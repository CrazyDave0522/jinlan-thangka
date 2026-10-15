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

You can start editing the page by modifying [src/app/page.tsx](./src/app/page.tsx). The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase

1. Copy [.env.example](./.env.example) to `.env.local` and fill in the Project URL and publishable key (a legacy anon key also works).
2. Add the same variables in Vercel → Project Settings → Environment Variables for the environments you use, then redeploy. Public variables are embedded at build time.
3. Import `createClient` from [the browser client](./src/lib/supabase/client.ts) in Client Components, or await `createClient` from [the server client](./src/lib/supabase/server.ts) in Server Components, Server Actions, and Route Handlers.

The [proxy](./src/proxy.ts) refreshes Auth cookies and preserves cache headers. It does not restrict access to pages. Login UI and protected routes await authentication requirements; database types should be generated after verifying the deployed schema. Server-side authorization must verify `auth.getClaims()` (or `auth.getUser()` where appropriate), rather than trusting `getSession()`.

The supplied database structure is preserved in [database/schema.sql](./database/schema.sql), with relationships, import rules, review findings, and integration requirements in [docs/database.md](./docs/database.md). Business tables use the `thangka` schema. The SQL is a reference initialization script, not an automatic migration; do not rerun it against an existing database. Before adding Data API queries, verify the deployed schema and define intended read/write permissions, schema exposure, grants, and RLS policies. This app setup does not create or change tables or policies. Never put a secret/service_role key in a `NEXT_PUBLIC_` variable.

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
