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

The initial Supabase configuration tests check valid and missing settings using placeholder values. The home-page test verifies the empty welcome state with no preloaded messages. Conversation component tests cover supplied message order, optional evidence sections, disabled actions, local draft editing, and image-failure fallback.

## External services and test data

Routine tests must not call live Supabase, Storage, or DeepSeek. Mock service boundaries and use clearly synthetic records and responses. Never copy credentials or private collected data into fixtures. Tests explicitly stub required configuration; the setup does not load `.env.local`.

Mocked AI responses can check how the application handles citations, uncertainty, and errors. They do not establish that a real model identifies Thangka artworks accurately or avoids fabrication. Evaluate real model behavior separately with agreed sample data when it becomes available.

## Browser tests

Install the browser once with `npx playwright install chromium`, then run `npm run test:e2e`. If browser downloads use a custom location, set the same `PLAYWRIGHT_BROWSERS_PATH` for installation and test execution. The command builds and starts the production Next.js app on `127.0.0.1:3100` and an isolated Vite component harness on `127.0.0.1:3101`; both ports must be available. It does not stop or reuse the developer's existing server. Supabase variables are explicitly blank for the test app, so routine checks do not use real services.

Playwright runs Chromium tests across the eight core viewports below. The real Next.js page is checked for its empty landing state, welcome alignment, branding, language/title, local editing, disabled actions, keyboard focus, reload behavior, page errors, and layout. The isolated harness supplies synthetic messages to check long-content overflow, independent scrolling, persistent composer position, resize transitions, unavailable source/copy controls, and broken-image fallback. Fixtures and the harness are outside application routes; they are not a product example mode.

The harness replaces `next/image` with a native image component and compiles the same source styles using the Tailwind Vite plugin. Its tests validate component behavior and layout, not Next.js image optimization or a complete message/upload request lifecycle. Add real Next.js end-to-end tests when those later flows exist. Screenshots and failure traces are written under ignored `test-results/`; no CI workflow is configured yet.

## Responsive browser acceptance

Every UI change must verify the affected page states and interactions against the project-wide baseline in [project.md](../openspec/project.md). The target is more than 80% of ordinary desktop use cases and more than 80% of ordinary mobile use cases independently. This representative matrix is an engineering acceptance baseline, not audience statistics or proof of that percentage. The matrix incorporates the September 2026 public statistics recorded below, with a compact core matrix and optional, change-relevant spot checks to control cost. All test dimensions below are CSS viewport pixels (width × height), not physical panel resolutions or device-model guarantees. Reported screen sizes are test starting points; also reduce available height for browser chrome and test resized windows.

| Mandatory core context | Representative viewports |
| --- | --- |
| Mobile portrait | 360 × 800, 390 × 844, 414 × 896 |
| Compact desktop / laptop | 1280 × 720, 1366 × 768 |
| Desktop | 1536 × 864, 1920 × 1080 |
| Large desktop | 2560 × 1440 |

Use this compact core matrix for affected UI acceptance. Intermediate mobile widths such as 384, 393, and 412 pixels should be handled by the fluid layout and a resize sweep rather than separate device-specific implementations. Spot-check intermediate/tablet widths and ordinary reduced-height or landscape behavior where the change affects them. Sizes such as 375 × 812, 430 × 932, 768 × 1024, 1024 × 768, 1440 × 900, or 844 × 390 are useful spot checks, not an additional mandatory full test matrix.

No dedicated layout or exhaustive testing is required for 320-pixel widths, niche reported sizes/aspect ratios, ultrawide screens, foldable-specific modes, or unusually tiny windows. A naturally working fluid layout is welcome; unsupported edge cases do not block completion unless a later requirement explicitly adds them.

- Inspect affected layouts across the matrix and resize between widths, including immediately around layout breakpoints. Passing named viewports alone is insufficient if intermediate widths break.
- Check empty and populated content, long text/unbroken tokens, images, and the loading/error/expanded states relevant to the change. Use synthetic fixtures and mocked services.
- Verify no page-level horizontal overflow, clipped text, overlapping controls, or distorted images. Large screens must retain readable content widths; small screens must preserve reachable controls and usable touch interaction.
- Verify vertical scrolling and persistent elements at short heights. For the chat, messages scroll independently and the bottom composer remains visible without covering the last message or footer. Check orientation changes, safe-area spacing, and mobile keyboard behavior where relevant and supported by the available environment.
- Use real browser layout verification; jsdom does not establish viewport correctness. Prefer automated browser assertions for repeatable overflow, element visibility, and scroll behavior, alongside visual inspection. Add lifecycle end-to-end tests where required by the implemented behavior.
- Record tested viewport sizes, browser coverage, and any checks that could not run. Desktop viewport emulation does not establish real-device keyboard or touch correctness; disclose those limits. Release acceptance repeats the integrated core flow across the compact core matrix; optional spot checks do not become release gates.

Extreme form factors are outside the baseline. If audience/device distribution becomes available later, assess desktop and mobile coverage separately and adjust this matrix as needed.

### Public size-distribution reference

Checked on 2026-10-16. The opened Statcounter pages report September 2026, the latest completed month before this check. Use worldwide statistics as the general reference and China as a supplementary reference for this Chinese-language interface; this does not establish the project's actual audience geography. The rows below reproduce the six leading sizes exposed by each source page, not the complete distribution.

| Reported desktop size | Worldwide share | China share |
| --- | --- | --- |
| 1920 × 1080 | 28.07% | 29.13% |
| 1536 × 864 | 10.00% | 6.45% |
| 1366 × 768 | 7.95% | Not in displayed top six |
| 1280 × 720 | 4.71% | Not in displayed top six |
| 2560 × 1440 | 3.95% | 8.53% |
| 1280 × 1200 | 3.64% | 12.08% |
| 1707 × 1067 | Not in displayed top six | 3.32% |
| 1440 × 900 | Not in displayed top six | 2.61% |

Sources: [Statcounter worldwide desktop, September 2026](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide/#monthly-202609-202609-bar) and [China desktop, September 2026](https://gs.statcounter.com/screen-resolution-stats/desktop/china/#monthly-202609-202609-bar). Record the reported 1280 × 1200 category as research context without assuming a particular device or attributing it to bots without evidence; this atypical aspect ratio is not a mandatory viewport test.

| Reported mobile size | Worldwide share | China share |
| --- | --- | --- |
| 414 × 896 | 13.35% | 13.53% |
| 360 × 800 | 7.54% | 8.27% |
| 384 × 832 | 7.10% | Not in displayed top six |
| 390 × 844 | 6.05% | 5.49% |
| 393 × 873 | 4.18% | Not in displayed top six |
| 360 × 780 | 3.39% | Not in displayed top six |
| 361 × 801 | Not in displayed top six | 3.41% |
| 360 × 792 | Not in displayed top six | 3.06% |
| 412 × 915 | Not in displayed top six | 3.06% |

Sources: [Statcounter worldwide mobile, September 2026](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide/#monthly-202609-202609-bar) and [China mobile, September 2026](https://gs.statcounter.com/screen-resolution-stats/mobile/china/#monthly-202609-202609-bar).

These are sampled web-usage shares, not device-sales shares or unique-user counts; see [Statcounter methodology](https://gs.statcounter.com/faq). A screen-size report is not a measurement of the page's available viewport. Screen width can itself be expressed in CSS pixels, so do not assume that these values are raw physical panel pixels or divide all values by device pixel ratio; see [MDN Screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width). Browser chrome, zoom, window size, and virtual keyboards affect available page space; see [MDN viewport concepts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts).

Engineering conclusion: retain continuous mobile portrait adaptation over 360–430 CSS pixels and desktop adaptation over 1024–2560 CSS pixels, with fluid intermediate widths and relevant height spot checks. The owner explicitly excludes exhaustive niche-size adaptation; the research tables are reference data, not a requirement to implement or test every listed resolution. This range contains all leading widths displayed by these four source pages. The displayed top six are insufficient to establish 80% coverage on either platform; do not turn their partial totals or this width-range inference into a measured coverage claim. Public statistics are sufficient to select the initial baseline without asking the owner for device data.

## Completion workflow and limits

For each requirement, add or update meaningful tests, run `npm run check`, and fix failures before reporting completion. Report which checks passed and any checks that could not run. Run a production build when routing, server integration, configuration, or dependencies change.

Vitest does not directly render async Server Components or exercise the full Next.js request lifecycle. Browser flows involving routing, uploads, cookies, streaming, or async Server Components need end-to-end coverage when implemented. A passing unit suite must not be reported as evidence that those browser flows or database policies work. Playwright/Chromium coverage is configured for the implemented interface; no CI workflow or coverage threshold is configured.
