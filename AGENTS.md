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

## Git workflow

When the owner authorizes integration of completed work, including OpenSpec archival, merge directly into `main` and push through the existing Git remote. This is a single-maintainer project; a PR is optional unless the owner requests one or repository rules require it. This owner-confirmed workflow supersedes the separate-PR default in `openspec/AGENTS.md`.

## UI conventions

- Use shadcn/ui with the `base-nova` preset, the neutral theme, and Lucide icons. Configuration lives in `components.json` and theme tokens in `src/app/globals.css`.
- Reuse components from `src/components/ui` and their default variants before introducing custom styles. Add components with `npx shadcn add <component>` as needed.
- Use semantic theme colors, the existing Geist fonts, and consistent Lucide sizing. Keep shared default styles intact unless a requirement calls for a change; avoid mixing component or icon libraries.
- Apply this visual system consistently to every new or modified screen. Before UI work, inspect `components.json`, `src/app/globals.css`, and the relevant shared components; do not introduce a separate page-level visual system.
- Prefer existing theme utilities and tokens for colors, spacing, typography, radii, and standard control/icon sizes. This includes tokens explicitly defined in `globals.css` and the Tailwind theme it imports. Use utilities such as `p-6`, `text-xs`, and `rounded-xl` where practical; custom CSS must reuse the corresponding variables/scales rather than duplicate equivalent pixel values.
- Resolve standard responsive breakpoints from the shared theme so custom CSS and utility variants stay aligned. Component-specific content-width caps, logo dimensions/crops, aspect ratios, percentage layouts, safe areas, and content-driven height thresholds may remain local when the shared scale does not express their purpose. Do not create global tokens for every isolated value or change shared tokens just to fit one component.
- Before completing UI work, check new custom styles for unnecessary hardcoded visual values and inconsistent component overrides. Preserve justified local layout values and verify that token reuse retains the intended appearance and responsive behavior.
- This setup includes light and dark tokens but no theme switcher. Add product behavior through the normal requirements workflow.

## Responsive design

- Responsive behavior is a project-wide acceptance requirement for every page and UI change, not a separate feature or a release-only task.
- Target more than 80% of ordinary desktop use cases and more than 80% of ordinary mobile use cases separately. Use public size-distribution evidence recorded in `docs/testing.md` to prioritize sizes; the owner need not supply device data. Distinguish these coverage goals from measured project-audience percentages; do not claim that passing a viewport matrix proves them.
- Use the supported viewport baseline in `openspec/project.md` and the browser verification matrix in `docs/testing.md`. Adapt continuously between sizes, including tablet and resized-window widths; do not optimize only for the reference screenshot or named devices.
- Preserve readable content, reachable controls, proportional images, and usable scrolling without page-level horizontal overflow, clipping, or overlapping fixed elements. Test viewport height, orientation, and mobile keyboard behavior where applicable. Prioritize the compact core matrix in `docs/testing.md`. Public-statistics reference rows are not individually mandatory tests. Niche sizes, extreme form factors, 320-pixel widths, and unusually tiny windows require no dedicated adaptation or acceptance work unless a later requirement explicitly adds them.

## Testing workflow

- Use Vitest and React Testing Library for business logic and component tests. See `docs/testing.md`.
- For every implemented requirement, add or update meaningful behavior tests for its acceptance criteria, including relevant failure cases.
- Run `npm run check` after completing each requirement. Fix failures before reporting completion, and report any checks that could not run.
- Keep routine tests deterministic and independent of real Supabase data, Storage, and paid AI APIs. Use explicit test fixtures and mocks.
- Vitest does not validate complete Next.js request lifecycles or async Server Components. Add browser end-to-end coverage when requirements depend on those flows; do not claim unit tests cover them.
