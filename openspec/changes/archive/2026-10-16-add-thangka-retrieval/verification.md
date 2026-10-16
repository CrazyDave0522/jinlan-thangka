# Thangka Retrieval Verification

## Status and Scope

Implemented on `feat/add-thangka-retrieval` after owner approval on 2026-10-16. Required implementation, owner-supplied metadata review, actual anon table/RPC smoke checks and live-generated type comparison have passed. The change was accepted by the owner before committing/pushing and is now archived; archived at the owner's explicit request on 2026-10-16. The owner applied the reviewed function/read-access scripts and Data API configuration; the assistant's live checks and generation were read-only and did not insert business records or change permissions.

The implementation provides `retrieveArchive` in `src/lib/retrieval/service.ts`, strict query/result contracts, explicit row projections/validation, finite evidence expansion and shared request/byte/row/time budgets. It preserves composite association keys, scoped sources, uncertainty and image metadata. The Supabase client uses the real generated Database type in `database.generated.ts`; reference-derived runtime descriptors and validated CHECK-state domain types remain distinct. No page, public application endpoint, chat/DeepSeek integration or Storage behavior was added.

## Local Checks

| Check | Result |
| --- | --- |
| `npm run check` | Passed: ESLint, TypeScript and 202 tests across 17 files |
| Retrieval tests | Passed: 107 tests across query, service, runtime, SQL and generated-type comparison suites; included in the total above |
| Actual SQL execution | Passed: original DDL plus incremental function/read setup in disposable PGlite PostgreSQL with synthetic fixtures |
| Production build | Passed through the Playwright production web-server build |
| Chromium regressions | Passed: all 41 existing browser tests across the mainstream viewport matrix and request/image interaction cases |
| `openspec validate --all --strict --no-interactive` | Passed: all eight active changes/specifications |
| `git diff --check` | Passed |

Query/SQL checks exercise all six ranking tiers, exact versus literal contains, UUID ties/homonyms, multilingual names, aliases/arrays, field combinations, candidate probing and invalid inputs. SQL metadata checks independently compare every reference-derived column descriptor's type/nullability to the original schema. Function tests check invoker RLS, anonymous write denial, empty search path and conservative setup preconditions for existing writes/policies.

Service/runtime checks use the real Supabase JS client with mocked HTTP transport and explicit synthetic rows. They cover all eight explicit projections, schema headers, finite traversal, graph/source identities and scope, missing referenced data, no-visible-match semantics, uncertainty and image rights, candidate caps, each graph cap, raw streamed response/cumulative/final byte budgets, call count, deadline/caller abort, late completion and timer/listener cleanup. Configuration checks accept publishable/legacy-anon keys and reject missing/malformed/elevated-key settings. SDK retries are explicitly disabled. No test calls real Supabase/AI/Storage or seeds the owner's database.

The initial sandboxed build could not bind a Turbopack worker port; rerunning outside that restriction succeeded. The first Chromium attempt lacked its expected browser executable. Installing Chromium into a temporary directory and rerunning with `PLAYWRIGHT_BROWSERS_PATH=/tmp/jinlan-playwright` passed all 41 tests. These environment failures were resolved rather than counted as application regressions.

## Read-Only Live Attempt

Ran `node --env-file=.env.local scripts/verify-archive.mjs` using existing local public URL/key settings, with network access enabled. It selected each table's explicit columns with `limit=0` and invoked the candidate RPC with a nonmatching synthetic query. Logs contained only table/function labels, HTTP status and safe error code, never credentials or record contents.

All eight table requests and the RPC returned HTTP 406 / `PGRST106`. Per [PostgREST's error reference](https://docs.postgrest.org/en/stable/references/errors.html), the requested schema is not included in the exposed-schema configuration. This identifies a real Data API setup gap; it does not show missing table definitions, missing artwork data, missing columns or whether the new function exists. No remote metadata/column-type/constraint/grant/RLS claims can be certified from this failure.

## Owner-Supplied Column Inspection

On 2026-10-16 the owner supplied the SQL Editor column inspection in two batches: the first 100 rows followed by the remaining 24 using ordered `OFFSET 100`. All 124 columns across the eight tables match the reference field names, PostgreSQL types and nullability, including the six final image fields and all 18 source fields. No column-definition discrepancy or additional field clarification remains. Defaults, constraints, grants, policies and API exposure are not established by this column result; their separate inspection/verification remains pending.

## Owner-Supplied Role and RLS Inspection

The owner supplied the second SQL Editor inspection on 2026-10-16 for all eight tables. Each has RLS enabled and not forced. `anon` has no schema USAGE and no effective table SELECT, INSERT, UPDATE, DELETE or TRUNCATE privilege in the supplied results. No conflicting effective anonymous write grant was found by this check. At that pre-setup point schema USAGE/table SELECT were absent; subsequent setup, constraint review and final permission results are recorded below. The owner subsequently supplied the third query result (`Success. No rows returned`), confirming that `pg_policies` reports no policies in `thangka` in that inspection context. Together these results meet the read-access artifact's inspected no-existing-policy/no-effective-anon-write preconditions; installation and verification were subsequent steps, now recorded below. RLS being enabled does not establish that any suitable SELECT policy exists, and `rls_forced = false` does not mean RLS is disabled for anon.

## Owner-Supplied Constraint Inspection

The owner supplied all 42 primary-key, foreign-key, unique and CHECK constraints on 2026-10-16. Compared their names, types and complete definitions with `pg_get_constraintdef` from the original DDL executed in isolated PostgreSQL: all 42 match with no missing/extra constraints in these categories. This confirms the composite artwork-artist key, source-link uniqueness, image locator uniqueness, foreign-key RESTRICT actions and distinct attribution/status checks. The separate partial unique index for primary images, column defaults and update triggers are not established by this constraint query; they must not be described as verified from it. Supplied column/role/policy/constraint inspections show no discrepancy preventing the prepared incremental function/read setup. The owner subsequently reported `Success. No rows returned` for the incremental search-function creation script, including its PUBLIC execution revocation. Function installation is owner-reported successful; runtime behavior/metadata have not yet been independently rechecked. The owner then reported `Success. No rows returned` for the scoped read-access script: schema USAGE, eight table SELECT grants/RLS SELECT policies and exact function execution were applied successfully according to that report. Subsequent post-setup grants/policies and API checks passed as recorded below.

## Successful Post-Setup Live Smoke Check

After the owner confirmed completing Data API exposure and row-limit configuration, repeated `node --env-file=.env.local scripts/verify-archive.mjs` using the existing public application credentials. All eight projected table reads and `search_archive_candidates` returned HTTP 200; the command exited successfully. The earlier `PGRST106` exposure error is resolved. No rows, permissions or schemas were changed by this check, and no record contents or credentials were printed.

Owner-reported installation and actual anon API reachability are now established separately from the earlier pre-setup metadata inspections. Table smoke reads use `limit=0`; the RPC uses a synthetic exact term. These checks establish reachable reads/function execution, not a complete application service lifecycle, full row visibility, live-generated type agreement, or relevance on a populated archive. Subsequent owner-supplied final policies/function metadata passed; the later successful CLI-generated type comparison is recorded below. The owner reports the API row limit was configured as requested; this setting has not been independently inspected through an admin interface.

## Owner-Supplied Post-Setup Permissions and Policies

The owner supplied the repeated role/RLS and policy queries after setup. All eight tables have RLS enabled (not forced), effective anon schema USAGE and SELECT, and no effective anon INSERT/UPDATE/DELETE/TRUNCATE. Exactly eight `archive_retrieval_select` policies exist, one per expected table, all scoped to `{anon}`, `SELECT`, `qual = true`, and no write check. These results match the intended all-record anonymous read boundary and resolve the outstanding table-grant/policy review. They complement the independently successful table/RPC HTTP smoke checks.

A read-only attempt to retrieve OpenAPI metadata with the current public credentials returned HTTP 401. This does not undo the successful table/RPC checks; that metadata request is unavailable through the attempted endpoint/credentials. The RPC signature/result/security/EXECUTE metadata was subsequently supplied from the SQL Editor and passed, as recorded below. No elevated credential or permission change is requested merely for introspection; live CLI-generated types have not been produced.

## Owner-Supplied Function Metadata

The owner supplied the installed function metadata from the SQL Editor. It matches the implemented RPC contract exactly: `p_entity text, p_filters jsonb, p_limit integer`, returning `TABLE(id uuid, rank integer, matches jsonb)`. `security_definer = false` confirms invoker security; volatility `s` confirms STABLE; settings show an empty `search_path`; anon EXECUTE is true and PUBLIC EXECUTE is false. The metadata result resolves the RPC signature/result/security/execution review.

The code's RPC Args/Returns mapping has been compared with this actual result (`text`/`uuid` to string, integer to number, jsonb to Json); table row descriptors were already compared with all 124 supplied live columns and constraints. These are manual comparisons against owner-supplied live metadata, not a claim of Supabase CLI type generation. CLI-generated types remain an explicitly unperformed delivery item. Primary-image index, defaults and triggers remain outside the supplied inspection evidence.

## Successful Live Type Generation and Comparison

Initially, Supabase CLI 2.121.0 returned `AccessTokenRequiredError`; the owner completed local CLI login privately. A subsequent read-only `gen types --lang typescript --project-id <configured-reference> --schema thangka` succeeded. Output was saved temporarily and inspected before copying it unchanged to `src/lib/retrieval/database.generated.ts`. No project config, dependency, database records or credentials were added by generation.

The generated file contains the eight real tables, all 124 Row fields, actual Insert/Update optionality and foreign-key Relationships, the candidate RPC and PostgREST version metadata. The SDK now imports this generated Database/Json through `database.ts`, replacing the provisional hand-authored SDK schema. Runtime column validation and CHECK-based narrower domain states remain in place; CHECK constraints generate transport strings rather than PostgreSQL enum unions, so these layers intentionally serve different purposes.

Compile-time comparisons enforced by `npm run typecheck` cover the exact table set, every raw row field/type/nullability and the RPC Args/Returns. An independent TypeScript compiler inspection found no differing field names/types/nullability. Descriptor readonly modifiers are removed in the comparison transport shape because they are application metadata rather than database nullability/type differences. All comparisons pass.

Repeated `npm run check`: lint, TypeScript and 202 tests across 17 files pass. Production build was rerun after the generated-type integration; the prior 41 Chromium regressions remain the browser verification for the unchanged UI/request flow. No new lifecycle/UI code was added during type generation.

## Acceptance Checklist and Remaining Limits

- Supplied live metadata: 124 columns and 42 constraints match; final anon USAGE/SELECT present, write grants absent; eight exact SELECT policies; RPC signature, STABLE/invoker/empty search path and exact EXECUTE grants match.
- Actual anon Data API reads and search RPC: HTTP 200, initial exposure error resolved. The owner confirmed the requested maximum-row configuration.
- Actual live-generated types: saved and used by the SDK; row/RPC comparisons pass. No CLI authentication or type-generation gate remains.
- Verification record and implementation tasks are updated. The owner has reviewed and accepted the implementation; archived at the owner's explicit request on 2026-10-16; archival does not establish application deployment or merge to main.
- The primary-image partial index and update triggers were not independently queried from the deployed database. Generated Insert definitions reflect default/required-field behavior; no claim is made that every deployed default SQL expression was separately compared. The approved runtime is read-only and does not depend on performing inserts or switching primary-image flags.
- Real-data relevance, deployed collation/performance, full application retrieval-to-AI lifecycle and transaction-consistent/global evidence remain outside these empty-archive/synthetic checks. No real artwork dataset is required to complete this infrastructure increment.

The complete procedure is in [retrieval-setup.md](../../../../docs/retrieval-setup.md). Real-data relevance, deployed collation/performance and future AI/image matching remain unproven by synthetic/local tests. Server-only code does not hide the intentionally public-key-readable Data API, and successful evidence expansion is only for the documented finite visible graph rather than a transaction-consistent global snapshot.

## Owner Acceptance and Publication

The owner confirmed reviewing the implementation and requested committing/pushing the current code. User acceptance is recorded; the owner subsequently requested archival and the change is archived. The commit contains implementation, tests, incremental setup and verification documentation; Supabase CLI local cache files are excluded.

## Archive Authorization

After reviewing and accepting the implementation and requesting its push (commit `57d2344`), the owner explicitly requested OpenSpec archival. All implementation and required verification tasks are complete. The archive records the implemented server retrieval capability; application deployment/merge and future AI consumption are not claimed by this archive.
