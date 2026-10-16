<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project language

Use English for source code, identifiers, filenames, documentation, source comments, and SQL comments. The product interface and user-facing copy must be in Simplified Chinese; brand artwork may contain Chinese lettering. Keep this distinction when designing or implementing screens.

## UI conventions

- Use shadcn/ui with the `base-nova` preset, the neutral theme, and Lucide icons. Configuration lives in `components.json` and theme tokens in `src/app/globals.css`.
- Reuse components from `src/components/ui` and their default variants before introducing custom styles. Add components with `npx shadcn add <component>` as needed.
- Use semantic theme colors, the existing Geist fonts, and consistent Lucide sizing. Keep shared default styles intact unless a requirement calls for a change; avoid mixing component or icon libraries.
- This setup includes light and dark tokens but no theme switcher. Add product behavior through the normal requirements workflow.

## Testing workflow

- Use Vitest and React Testing Library for business logic and component tests. See `docs/testing.md`.
- For every implemented requirement, add or update meaningful behavior tests for its acceptance criteria, including relevant failure cases.
- Run `npm run check` after completing each requirement. Fix failures before reporting completion, and report any checks that could not run.
- Keep routine tests deterministic and independent of real Supabase data, Storage, and paid AI APIs. Use explicit test fixtures and mocks.
- Vitest does not validate complete Next.js request lifecycles or async Server Components. Add browser end-to-end coverage when requirements depend on those flows; do not claim unit tests cover them.
