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

The initial Supabase configuration tests check valid and missing settings using placeholder values. The home-page test verifies the empty welcome state with no preloaded messages. Conversation presentation tests cover supplied message order, optional evidence sections, answer-local source/copy actions, and image-failure fallback. Controller tests cover submission gestures/IME, immediate locking, editable pending drafts, unavailable/failure/retry, timeout/late responses, and ephemeral remount state. Text utility tests cover ordered immutable context and malformed contracts; node-environment route tests exercise config-off, structured generation, invalid payloads, streamed-body deadlines and safe no-store outcomes.

## External services and test data

Routine tests must not call live Supabase, Storage, or DeepSeek. Mock service boundaries and use clearly synthetic records and responses. Never copy credentials or private collected data into fixtures. Tests explicitly stub required configuration; the setup does not load `.env.local`.

Mocked AI responses can check how the application handles citations, uncertainty, and errors. They do not establish that a real model identifies Thangka artworks accurately or avoids fabrication. Evaluate real model behavior separately with agreed sample data when it becomes available.

## Archive Retrieval Tests

`npm test -- src/lib/retrieval` covers strict queries, the real Supabase HTTP client over mocked fetch, finite evidence expansion, safe errors, raw response/cumulative/result budgets, graph caps and cancellation/late results. Server modules remain marked `server-only`; tests mock only that build-time guard and transport, not SQL behavior. Shared synthetic row fixtures live in `tests/fixtures/archive.ts`.

`sql.test.ts` uses the development-only `@electric-sql/pglite` dependency to run the actual reference schema and incremental search/access SQL against disposable in-memory PostgreSQL, including exact/substring rank tiers, arrays, multilingual names, literal special characters, filters/caps, reference descriptor types/nullability, anon writes denied and invoker RLS. It never connects to Supabase and requires no Docker or real dataset. It does not establish production collation, deployed grants/schema exposure or Data API behavior. These checks are part of `npm run check`.

The optional `node --env-file=.env.local scripts/verify-archive.mjs` command is a separately invoked read-only live smoke check, never a routine unit-test dependency. Follow [retrieval-setup.md](retrieval-setup.md) and record live setup/type/access gaps independently. Retrieval adds no screen or public route; existing Chromium tests cover product regressions, while later integration must test browser consumption of retrieved evidence.

## Browser tests

Install the browser once with `npx playwright install chromium`, then run `npm run test:e2e`. If browser downloads use a custom location, set the same `PLAYWRIGHT_BROWSERS_PATH` for installation and test execution. The command builds once with synthetic settings, starts the config-off production Next.js app on `127.0.0.1:3100`, a fixture-enabled instance of the same build on `127.0.0.1:3102`, and an isolated Vite component harness on `127.0.0.1:3101`; all three ports must be available. It does not stop or reuse the developer's existing server. The launcher explicitly overrides inherited public/private credentials and NODE_OPTIONS. Both Next.js runtimes require a test-owned Node fetch preload that fakes the fixed provider/synthetic Supabase endpoints and blocks other outbound fetches; missing or unsafe startup settings fail closed. The build is not network-blocked because Next.js downloads fonts; paid generation remains disabled during build.

Playwright runs Chromium tests across the eight core viewports below. The real Next.js page is checked for its empty landing state, welcome alignment, branding, language/title, editing, enabled image selection, keyboard focus, reload behavior, page errors, and layout. `text-conversation.spec.ts` checks the actual POST/503 lifecycle and sequential request context across all eight viewports, with additional intercepted pending/success/failure/retry, IME, touch emulation, reload-during-pending, and scroll/focus checks. Success responses are synthetic test intercepts; the real endpoint never emits a canned answer. `image-upload.spec.ts` exercises real Worker preparation, four-image previews/submission and failed-image exclusion from later context across all core sizes, JPEG orientation/PNG transparency, invalid/count/size rejection, bounded high-entropy PNG rejection, pending drafts/retry, draft preservation on text/context overflow, corrective gateway/image errors, short-height layouts and image-only load fallback. Visitor input needs no Supabase configuration. The isolated harness supplies synthetic messages to check long-content overflow, independent scrolling, persistent composer position, resize transitions, source/copy controls and selectable-text fallback, and broken-image fallback. Fixtures and the harness are outside application routes; they are not a product example mode.

The harness replaces `next/image` with a native image component and compiles the same source styles using the Tailwind Vite plugin. Its tests validate component behavior and layout, not Next.js image optimization or a real request lifecycle. Text/image lifecycle tests run separately against the real Next.js page. `grounded-answers.spec.ts` exercises the actual Next.js route, provider adapter and retrieval service with server-process upstream fixtures, including evidence/general sections, canonical history, no matches, clarification, known failures/retry, corrective editing and pending reload. Browser-only API interception tests remain separate client tests. The image-interpretation suite now exercises selected-input analysis, source-supported identification and summary/reread continuity through the actual route. It checks numbered four-work identification, ordinary-photo comparison, similar/uncertain alternatives, scoped authorized-reference traffic, permission changes on retry, one-click reread beside independent drafts, explicit grouping, stable labels and twenty retained pictures. The server preload validates actual image-bearing versus text-only stages and rejects unexpected reference/network access. These are synthetic behavior checks, not real recognition accuracy. Screenshots and failure traces are written under ignored `test-results/`; no CI workflow is configured yet.

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

## Grounded Answer Verification

`src/lib/answers/*.test.ts` covers exact public/model schemas, Unicode/context/input/output limits, source field scope, same-identity evidence drift, unknown citations, raw-response bounds, explicit provider mode/call limits, failure mapping, cancellation/stage deadlines and admission cleanup. Route tests exercise real orchestration over mocked fetch. Component tests cover draft ownership and image lifetime. `fixture-isolation.test.ts` launches the actual preload in a child process to check inherited overrides, startup failures and network blocking.

Routine tests prove contract behavior, not semantic truth. A genuine but irrelevant citation or an unsupported archive claim marked general knowledge needs human/model-quality evaluation; schema checks cannot reject all such statements. See [ai-setup.md](ai-setup.md) for the separate, manually authorized funded evaluation, incomplete-evidence limitations and deployment checks.


## Image Interpretation Verification

The [current verification record](../openspec/changes/archive/2026-10-17-add-image-interpretation/verification.md) records the executed checks. Vision validation/output/orchestration/reader tests cover v2 opt-in, ownership/hash/origin relations, 300-point observations, the shared 16,000-point context limit, image/text payloads, both identity gates, reference permissions/content/stream/deadline failures and atomic state publication. The actual installed Supabase Storage SDK is exercised against bounded fake fetches. Component tests cover shared-blob selection/removal, failed-turn labels and reread captured context/new-draft preservation.

Browser tests use eight core viewports plus resize/landscape/reduced-height checks. Optional grouping/processing detail remains inside a bounded composer scroll region; shared theme tokens and component variants remain in use. Native mobile keyboards, actual audience percentage coverage and real-device memory are not established by Chromium emulation.

The runner overrides inherited model/vision settings, project credentials and NODE_OPTIONS before startup. A guarded JINLAN_BROWSER_FIXTURES build aliases only the reference-manifest module to fixed synthetic grants; normal builds use the empty production list. Mixed fixture/real settings fail closed. Server upstreams allow only the synthetic project/model and loopback services; no real AI, Supabase, Storage or owner data is needed. Install the matching browser with npx playwright install chromium before the suite. The ordinary production build is verified separately from the fixture build.

Real identity quality still needs the separately authorized [acceptance protocol](../openspec/changes/archive/2026-10-17-add-image-interpretation/acceptance.md), permitted assets/records, actual object SELECT access and independent domain judgments. Pending/incomplete archive records and fixture positives cannot replace those results. The owner deferred curated-data preparation; current feature work uses synthetic fixtures and empty-archive behavior. Known model-contract/retrieval/semantic failures remain recorded in the verification checklist.

The stabilization regressions also cover literal current-question artwork/artist names, skipped and over-filtered searches, unbound versus image-bound empty results, query-cap rejection and renderer-owned marker/notice rejection. Strict malformed/overlong planner output is rejected before retrieval without truncation or a repair call. The actual-route browser fixtures exercise the corresponding empty-archive and failed-turn states while blocking reference reads. Current-question/reread focus and separate current/prior observation ID sets are explicit in model payloads; tests retain strict rejection of mixed-origin blocks. All provider stages explicitly use temperature=0, with unchanged output/call limits. Prompt guidance contains complete compact output examples, a per-picture text target below the unchanged 300-point ceiling and explicit missing/conflicting/source examples. The owner-authorized real-provider [empty-archive evaluation](../openspec/changes/archive/2026-10-17-add-image-interpretation/empty-archive-evaluation.md) records intermediate failures, corrections and a passing final eight-case round. These sampled runtime results and deterministic tests do not establish statistical reliability or real Thangka/record-identification accuracy.


## Answer Sources and Copying

Requirement 7 is archived at the owner's request at the implementation stage; its [verification record](../openspec/changes/archive/2026-10-17-add-answer-sources/verification.md) and [archive assessment](../openspec/changes/archive/2026-10-17-add-answer-sources/archival.md) separate completed local checks from outstanding hands-on, real-data/domain and deployment acceptance.

Requirement 7 shares record/source formatting between display and plain-text export. `presentation.test.ts` covers exact source-link/locator associations, record-only/unscoped support, missing versus zero/false/explicit statuses, current/prior image qualifications, proof-only references, transport/history exclusion, frozen inputs and accepted upper-bound responses. `answer-actions.test.tsx` covers repeated markers/keys, focus return, shared R inputs, identified-reference navigation, clipboard success/failure/unavailability, the page-wide write lease, waiting/late settlement across later writes, unmount, equivalent image-context recreation and manual selection/dismissal.

`answer-sources.spec.ts` exercises actual text/image Next.js routes through isolated server upstreams, source navigation/copying, retained old evidence after newer archive revisions, unchanged canonical follow-up context and no added provider/archive/Storage traffic. The test-only HTTP preload uses AsyncLocalStorage and a synthetic case header to correlate counts across the two parallel browser workers; counters under ignored `test-results/source-audit/` contain only request counts. No product route, telemetry or wire field is added. Browser fixtures override owner settings and make no real service calls.

All eight core viewports exercise source/copy behavior and the maximum 64-E/four-R/four-comparison fixture. Intermediate widths and landscape cover expanded details and the read-only fallback while keeping the real composer reachable. The arrival case fetches the actual isolated Next.js response and gates its delivery while a new image completes Worker preparation; it verifies pending state, partial backward selection, focus, reading position, newer text and the prepared draft image before/after arrival. Component coverage also recreates an equivalent captured image context and respects deliberate focus changes to another answer. A keyboard regression returns from a focused evidence entry to the latest messages with End, then verifies that a newly arriving answer is followed; textarea selection and handled control activation do not count as conversation scrolling. Short-viewport regressions dismiss manual-copy text by keyboard and close a long source panel while DOM focus remains inside, checking returned-control visibility, focus-ring clearance and subsequent independent composer focus. Synthetic disclosure activation does not establish native screen-reader acceptance. A native Chromium clipboard case writes through the product control and reads only within the test-owned permission context; the product never reads clipboard contents. Browser-stub tests remain distinct from that native check. Real device selection/keyboards, measured audience coverage, real model/domain accuracy and deployed Vercel behavior are not established by these tests.
