# Testing

Vitest is the test runner, with React Testing Library for component behavior, jsdom for a simulated DOM, jest-dom for DOM assertions, and user-event for user interactions. This follows the [Next.js Vitest setup](https://nextjs.org/docs/app/guides/testing/vitest). Vite is used by the test runner; Next.js remains the application framework and build system.

## Commands

| Command                                       | Purpose                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check`                               | Run lint, TypeScript checking, and all tests; required after completing each requirement |
| `npm test`                                    | Run the entire suite once and return a nonzero exit code on failures                     |
| `npm run test:watch`                          | Rerun tests during development                                                           |
| `npm run typecheck`                           | Check application, test, and configuration types                                         |
| `npm run build`                               | Check the production build when application integration changes                          |
| `npm test -- src/lib/supabase/config.test.ts` | Run a specific test file                                                                 |

## Writing tests

Place tests next to the code as `*.test.ts` or `*.test.tsx`. Shared test setup and future fixtures belong in `tests/`. The `@/` alias resolves through `tsconfig.json`. Import test APIs explicitly from `vitest` rather than relying on globals.

The default environment is jsdom. Use `// @vitest-environment node` at the top of tests for server utilities. Shared setup registers DOM matchers and cleans up rendered components after each test. Vitest restores spies and stubbed environment variables and globals between tests.

Test observable behavior and acceptance criteria: successful results, relevant invalid inputs, missing data, and external failures. Use accessible roles and labels for component queries. For interactions, use `userEvent.setup()` from `@testing-library/user-event` and await the interaction. Avoid asserting private implementation details or snapshots that merely repeat the markup.

The initial Supabase configuration tests check valid and missing settings using placeholder values. The home-page smoke test validates React rendering and DOM assertions against the existing starter screen; replace its expectations when the actual interface is implemented.

## External services and test data

Routine tests must not call live Supabase, Storage, or DeepSeek. Mock service boundaries and use clearly synthetic records and responses. Never copy credentials or private collected data into fixtures. Tests explicitly stub required configuration; the setup does not load `.env.local`.

Mocked AI responses can check how the application handles citations, uncertainty, and errors. They do not establish that a real model identifies Thangka artworks accurately or avoids fabrication. Evaluate real model behavior separately with agreed sample data when it becomes available.

## Completion workflow and limits

For each requirement, add or update meaningful tests, run `npm run check`, and fix failures before reporting completion. Report which checks passed and any checks that could not run. Run a production build when routing, server integration, configuration, or dependencies change.

Vitest does not directly render async Server Components or exercise the full Next.js request lifecycle. Browser flows involving routing, uploads, cookies, streaming, or async Server Components need end-to-end coverage when implemented. A passing unit suite must not be reported as evidence that those browser flows or database policies work. No browser test runner, CI workflow, or coverage threshold is configured in this initialization.
