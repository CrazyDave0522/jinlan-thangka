# Grounded Answers Verification

## Delivery Status

The owner approved implementation on 2026-10-16. Local implementation and deterministic verification are complete. Paid generation remains disabled by default. After the owner confirmed recharge and authorized the bounded batch, the initial local live evaluation used 40 calls and recorded a CNY 0.02 balance decrease. A separately authorized two-call recheck then passed the final required-fields correction; cumulative usage is 42 calls/20,686 tokens. See [live-evaluation.md](live-evaluation.md) for observed failures, corrections and measured limits. No owner-database write, secret disclosure or deployment was performed. The local scoped live gate is complete. On 2026-10-16, the owner tested the updated interface after the heading fix and reported no issues, completing manual acceptance. Archived as `2026-10-16-add-grounded-answers` under the previously agreed local-acceptance workflow. OpenSpec promoted the grounded-answer capability and updated the text-conversation and image-upload specifications. Publication, merge and deployment remain pending; actual Vercel duration/access checks remain predeployment work.

## Implemented Behavior

- Fixed-endpoint server-only DeepSeek Flash adapter, explicit disabled thinking, JSON/whole responses, one planning plus at most one answer call, bounded streamed replies and safe numeric usage/latency logs. No automatic repair/retry/model upgrade.
- Strict natural-language plans over the existing retrieval service, at most two queries/five roots each/64-code-point filter terms. Fresh evidence, ordered per-query provenance, deterministic full-row merging and evidence_changed on same-identity payload drift. Retrieval failure never masquerades as no matches.
- Server-owned field facts, Chinese labels, actual owner/source/link identities, field-specific versus unscoped sources, association identity without invented UUIDs, uncertainty and candidate/no-evidence notices. Model keys must resolve to current facts; model-supplied bibliography/URLs are rejected.
- Exact structured success/failure parsing and canonical history, evidence/general sections with compact summaries, guarded manual retry/edit, completed-pair-only follow-up context and preservation of newer drafts. No persistent conversation, source-inspection/copy feature or synthetic product conversation was added.
- Valid image selection/preparation/submission/display remains available; current images return an explicit capability failure without model calls. Historical image bytes never reach this text-model path. Explicit editing restores text only and releases unreferenced old attachment previews.
- Existing image/body limits plus text/context/provider/reply budgets, 55-second POST-entry deadline (including stalled body reads), 18/28-second stage caps, 65-second client timer, caller cancellation/late-result guards and two-slot per-runtime admission. All application outcomes are no-store.

## Automated Results

- `npm run check`: lint, TypeScript and 267 tests across 24 files passed. Includes existing SQL/retrieval regressions, public/model contracts, context/budget edges, source scopes, drift, provider failures, native image work that completes after expiry, streamed-body timeout, ignored abort, editing/attachment cleanup and safe usage metadata.
- Production build passed using explicit synthetic provider/Supabase settings with generation disabled. `.next/server/functions-config-manifest.json` emits `maxDuration: 60` for `/api/chat`; this does not establish Vercel account limits.
- Chromium: 52 tests passed using `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/jinlan-playwright npm run test:e2e`. Includes 11 grounded-answer tests over the real Next.js route with fake server-originated upstreams, plus existing text/image/interface regressions. Client-only API interception cases are separate from server-orchestration coverage.
- Core viewports: 360×800, 390×844, 414×896, 1280×720, 1366×768, 1536×864, 1920×1080 and 2560×1440, plus existing intermediate-width/reduced-height/touch checks. No tested page-level horizontal overflow; composer/footer controls remain reachable. This matrix is not measured audience coverage or physical-keyboard testing.
- Inspected mobile/desktop grounded-answer screenshots under ignored `test-results/grounded-390.png` and `test-results/grounded-1366.png`: section labels, references, wrapping, input and footer remain consistent with shared UI tokens. No custom visual system was introduced.
- Strict OpenSpec, retained MODIFIED scenarios, local documentation links and whitespace checks passed.

The initial sandbox build could not bind Turbopack's local port; rerunning with local-process permissions succeeded. The default Playwright browser cache lacked Chromium; the existing installation under `/private/tmp/jinlan-playwright` was used successfully. These setup failures are not counted as passing test runs.

## Test Isolation

The browser launcher builds once and starts config-off Next.js on 3100, a fixture-enabled runtime of the same build on 3102 and the isolated component harness on 3101. Explicit synthetic private/public settings override inherited/local settings; NODE_OPTIONS is cleared. Both Next.js runtimes require test-only Node fetch preload outside product code, fake only the fixed provider/synthetic Supabase endpoints, and block nonallowlisted outbound fetches. Child-process tests verify inherited-setting overrides, wrong/missing bootstrap rejection, off-mode zero provider access and network blocking. Ordinary application routes have no fixture flag, endpoint override or test route.

Vitest sets disabled/synthetic provider configuration before every test; intentional adapter/route tests override it with their own synthetic settings and mocked transport. Routine tests never use paid keys or owner data. The build's font download is distinct from blocked test-runtime upstream traffic.

## Acceptance and Remaining Deployment Checks

1. The owner confirmed recharge and authorized the 20-question/40-call local batch. That allowance was exhausted; the owner separately authorized two further calls and the final recheck passed using exactly those two. See [the live review](live-evaluation.md). No blanket further spending authorization or global quota follows from recharge.
2. Confirm actual Vercel execution duration and funded access scope. Per-runtime admission does not rate-limit all serverless instances; unattended public access needs actual platform protection or separately approved shared enforcement.
3. Owner manual review passed on 2026-10-16 after the repeated-heading fix. The final prompt recheck passed; original malformed outputs remain failed historical cases. Strict validation was not relaxed, and no missing fields were silently filled or paid repair added. Empty-archive live testing does not establish positive-record/source semantic accuracy.
4. Local acceptance is complete under the agreed archive-before-publication workflow. This does not establish deployment or delivery of requirements 6–8.

## Manual Review Follow-Up: Repeated Headings

The owner observed three repeated general-knowledge headings in one answer. The renderer previously attached a heading to every model block. It now groups only adjacent blocks of the same kind into one section with one heading and separate paragraphs. Kind transitions and separate answers keep their labels; block order, paragraph citations, canonical history and provider contracts remain unchanged.

Added component regressions for three consecutive general paragraphs, mixed-kind boundaries, adjacent evidence paragraphs/citation positions and independent answer headings. The real-route browser fixture now returns multiple general paragraphs; all eight core viewports assert a single general heading with both paragraphs. `npm run check` passed 267 tests across 24 files; production build and all 52 Chromium checks passed. Strict OpenSpec/whitespace checks passed. Inspected the updated 390-pixel screenshot. No additional paid API calls were needed.

## Archive Verification

`openspec archive add-grounded-answers --yes` completed on 2026-10-16 with all tasks complete, creating nine grounded-answer requirements and updating six requirements across text-conversation and image-upload. All 15 promoted requirement blocks match the archived deltas; previous text/image scenario names are retained. Updated the roadmap, project context, README and setup-guide links. All 66 checked local links resolve, with no stale active-change links or unchecked archived tasks. `openspec validate --all --strict --no-interactive` passed all eight active-change/formal-spec items; `git diff --check` passed. This archive-only follow-up made no runtime changes or paid calls.
