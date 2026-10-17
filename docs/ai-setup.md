# AI Setup and Evaluation

Bounded text generation (requirement 5), selected-image analysis/history/reread and both archive identification paths (requirement 6), and answer-local source inspection/copying (requirement 7) are implemented, archived and included in local `main`. The owner withdrew the earlier dataset and deferred replacement data; current work uses empty-archive behavior and isolated synthetic fixtures. Earlier model-contract/retrieval/semantic failures and their authorized stabilization results remain in the archived verification records. Implementation/tests do not establish real-work recognition, domain accuracy or deployed acceptance. Existing local empty-archive stabilization authorization remains valid within its scope; new text-evaluation allowances and deployed enabled access are separate decisions as described below. Conversation persistence and global spending quotas remain outside the current demo. See the [release proposal](../openspec/changes/add-demo-release/proposal.md) for staged acceptance.

## Safe Defaults

Use the ignored root .env.local for server-only settings, following the tracked example:

```dotenv
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-flash
DEEPSEEK_ENABLED=false
DEEPSEEK_VISION_ENABLED=false
```

A key alone enables nothing. Valid selected images with vision missing/off/invalid return image_understanding_unavailable before generation checks or provider access. Otherwise missing/off/invalid generation settings return generation_unavailable. Enable both settings only for a separately authorized image run; no owner setting was enabled during implementation. The interface explains unavailable capability without claiming images were inspected.

Keep the DeepSeek key and any elevated Supabase secret/service-role key out of NEXT_PUBLIC variables, tracked files, screenshots and chat. The intended Supabase publishable/anon key is separate public configuration. Restart the local server after changing settings; set the same server-only provider variables on Vercel and redeploy. Corrective editing restores question text without overwriting a newer draft or restoring old files automatically.

## Vercel Configuration Starting Point

On 2026-10-17 the owner corrected the earlier unprefixed Supabase names and redeployed. Connected inspection confirms both canonical public Config entries match the previously inspected archive, model `deepseek-flash`, shared Preview/Production generation enabled and vision absent. The [CLI follow-up](../openspec/changes/add-demo-release/verification.md#authenticated-cli-follow-up) on 2026-10-18 confirms the current Production revision, root/default build settings and actual 60-second chat function; deployment environment names are captured, but historical values are not returned. The initial release-branch Preview needs its own explicit false generation/vision overrides before publication. Use the canonical names below; the application does not read `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY`. Earlier [public request probes](../openspec/changes/add-demo-release/review.md#owner-reconfiguration-and-redeployment-recheck) establish rejection/byte-boundary behavior, not successful archive or active-provider operation. The accepted source keeps the page available without Supabase settings and returns defined unavailable outcomes when provider/vision settings are missing.

A-stage implementation is now approved; follow the [release runbook](demo-release.md) and prepare the concrete commit/target/settings/access action before deployment changes. Configure the intended branch Preview first, preserving current production mapping/settings. Existing local values can be entered privately; no keys need to be posted in chat.

| Variable | Vercel type | Initial configured Preview | Later active empty-archive batch |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Config | Existing intended Supabase project URL | Same verified archive |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Config | Its publishable or legacy anon key | Same scoped application reader |
| `DEEPSEEK_MODEL` | Config | `deepseek-flash` | Same accepted model |
| `DEEPSEEK_API_KEY` | Secret | May remain absent with generation disabled | Actual server-only provider key |
| `DEEPSEEK_ENABLED` | Config | `false` | `true` within agreed scope/window |
| `DEEPSEEK_VISION_ENABLED` | Config | `false` | `true` within agreed scope/window |
| `JINLAN_BROWSER_FIXTURES` | Config if explicitly set | Unset or `false` | Unset or `false` |

For prefixed public variables, choose Config rather than Secret/Sensitive. An existing saved Secret cannot be renamed or converted to Config in place; create the correctly named Config entries instead, using the intended local public values. Use exact ASCII underscores in `NEXT_PUBLIC_`, not hyphens or typographic dashes. See [Vercel Config and Secret types](https://vercel.com/docs/environment-variables/sensitive-environment-variables), checked 2026-10-17. Only the Supabase publishable/anon key belongs in that public field; see [Supabase key types](https://supabase.com/docs/guides/getting-started/api-keys). Never substitute a Supabase secret/service-role key or the DeepSeek key. If creation is blocked, record only the exact error and selected Type to distinguish a type restriction, naming error or other account/UI condition; do not infer a confirmed cause or request key values.

Create a new deployment after adding/changing variables: previous deployments do not receive those changes. Preview variables can be branch-specific; check scope before saving. See [Vercel environment variables](https://vercel.com/docs/environment-variables), checked 2026-10-17. Verify archive configuration/access before enabling paid generation, since planning can spend before a later missing-database failure. The [release acceptance matrix](../openspec/changes/add-demo-release/acceptance.md) distinguishes unconfigured, configured-disabled and active states. Initial setup needs no real business data or curated Storage assets.

## Protocol and Limits

POST /api/chat uses the exact [version-2 contract](../openspec/changes/archive/2026-10-17-add-image-interpretation/contracts.md). Minimal text bodies require X-Chat-Protocol: 2; explicit version-2 bodies need no header. Unversioned stale requests and version mismatches fail before paid work. All success responses are version 2 and pass full block/reference/canonical validation before display.

| Path | Planning/analysis | Second call | Retrieval |
| --- | --- | --- | --- |
| Ordinary text | 1,024 output tokens / 18 seconds | Text answer: 1,536 / 28 seconds | At most 2 queries |
| Selected images | 2,048 / 25 seconds | Default text answer: 1,536 / 20 seconds | At most 4 image-related queries |
| Targeted reference verification | Same first analysis | Scoped visual verification: 3,072 / 20 seconds | Same bounded query allowance |

Every attempt uses at most two provider calls, fixed official deepseek-flash, disabled thinking, temperature=0, JSON output and no streaming. Clarification ends after planning. There is no automatic repair, retry, fallback model or browse loop. Each query has at most five roots and 64-code-point filter values; merged answer evidence shares one 128,000-byte text envelope.

Requests contain at most 32 messages, 2,000 code points in the current question and 16,000 combined message/observation text points. Observations have separate facts, readings, interpretations and limitations, at most 300 text points per picture. Only completed answer/clarification pairs enter new context. Ordinary follow-ups send historical metadata/observations without image bytes. New visual detail offers explicit reread; its click creates a new potentially paid attempt carrying the original question/context while preserving newer drafts. Summaries never establish a fresh definite identity.

Selected visitor inputs are at most four per attempt; at most twenty prepared attachments remain in page memory, including failed previews and drafts. See [storage.md](storage.md). Image analysis has a 64,000-byte text envelope and 3,000,000 full outbound bytes. Default answering stays text-only; targeted verification has a 128,000-byte text envelope and 6,000,000 full outbound bytes with at most four scoped visitor pictures and four authorized archive references. Incoming serialized JSON remains at most 4,000,000 bytes. These are separate boundaries; overflow is explicit, without silent truncation.

One shared 55-second deadline starts at POST entry, with a 65-second client attempt including encoding. Reference reads/preparation share at most five seconds inside that deadline. Stage maxima are independent ceilings, not guaranteed combined latency. The route declares maxDuration=60; deployed Vercel duration and actual image latency remain unverified. Native decoding or provider billing may continue briefly after cancellation.

Two orchestrations are admitted per runtime, without a queue. This is not a global serverless quota. CNY 10–20 remains a historical planning suggestion, not authorization or an enforced ceiling. Funded public access needs its separately agreed access/spending arrangement.

All outcomes are no-store. Only defined transient final-turn failures offer manual retry, including reference_failed. Retrying uses the original visitor snapshot but rereads archive/permission state. Missing/stale grants are evidence limitations; attempted reference access/content failures stop the whole response. No partial answer or observation revision is published after failure.

## Curated Reference Configuration

The server-only src/lib/vision/reference-manifest.ts starts with an empty production grant list. Real ordinary-photo identification needs actual verified artwork/image rows, field-scoped sources, permitted original assets and reviewed grants binding the full image row, permission reference and content digest. Read [reference access](../openspec/changes/archive/2026-10-17-add-image-interpretation/reference-access.md) before adding entries and redeploying. The existing anon/publishable context must have actual object SELECT access; no service-role, signing, arbitrary URL or stronger credential fallback is used. No dataset-specific object allowlist is part of the implementation. Prepare future curated permissions and assets only when real-data work resumes.

Readable collection/accession identity can pass independently without reference downloads. Ordinary unnumbered-photo identity requires qualifying distinctive features and actual negative coverage of competing candidates. Schema validity does not prove OCR, visual correspondence, source relevance or authenticity; see [the evidence matrices](../openspec/changes/archive/2026-10-17-add-image-interpretation/identification.md).

## Deterministic Verification

Run npm run check and npm run test:e2e. Browser tests build with synthetic settings, fake server-process model/metadata/Storage upstreams and a guarded synthetic reference-manifest alias; ordinary builds retain the empty production manifest. JINLAN_BROWSER_FIXTURES is a test-runner setting, not a product activation mode. Its build fails unless all required synthetic credentials/project settings match. Owner environment files never supply test credentials/grants. See [testing.md](testing.md) and the change's [verification record](../openspec/changes/archive/2026-10-17-add-image-interpretation/verification.md).

## Separately Authorized Text Evaluation

A first authorized local batch has been performed; see [the live review](../openspec/changes/archive/2026-10-16-add-grounded-answers/live-evaluation.md) for failures, corrections and the successful separately authorized final recheck. Before running another batch, obtain explicit funded-call authorization and agree a batch allowance; confirm available account credits, actual deployment duration and access scope. Keep access local or protected. No account key/balance inspection is needed in chat.

1. Review the 20 fixed cases in `scripts/evaluate-answers.mjs`. Each starts a fresh conversation; at most 40 provider calls are possible, without automatic retries. The script never inserts database records.
2. Note account usage/balance, enable generation explicitly and restart a local server at port 3000 (or use a separately owned loopback instance). Keep a deliberately small prepaid balance; request/token caps do not guarantee a CNY ceiling.
3. Run `node scripts/evaluate-answers.mjs --allow-paid` only after authorization; `--port=3004` can select a separately owned loopback instance without changing the developer's existing server. It sends to the fixed loopback app endpoint, checkpoints results after each case under ignored `evaluation-results/` (separate from Playwright's cleaned output directory), and makes no direct provider/account calls. The command stops on unavailable configuration/provider settings without retrying. Review the batch and remaining authorized allowance before any rerun.
4. Inspect safe server `ai_completion` usage/latency metadata and provider-console before/after expenditure. Report actual input/output token usage, model/mode, failed cases, latency and actual expenditure; do not substitute the illustrative planning estimate for measurement.
5. Manually score each result for relevance, archive/general separation, missing-evidence honesty, uncertainty, clarification and citation support. A real-but-irrelevant E key or a false archive claim under “general knowledge” fails the case despite schema validity. Include separate controlled synthetic-evidence evaluation cases from the test fixtures when reviewing the evidence rules; an incomplete or unreviewed live archive cannot establish factual retrieval accuracy. Routine fixture tests do not measure real-model semantic quality.
6. Disable generation and restart/redeploy after evaluation. Record results and limitations in the change's verification record. Do not archive or claim funded evaluation passed until those remaining gates are met.


## Deferred Real-Data Image Acceptance

The owner deferred curated-data preparation and domain acceptance on 2026-10-17. Current work uses explicit synthetic fixtures and empty-archive behavior. Keep the [feature acceptance protocol](../openspec/changes/archive/2026-10-17-add-image-interpretation/acceptance.md) and [implementation stabilization review](../openspec/changes/archive/2026-10-17-add-image-interpretation/verification.md) visible; earlier failed real trials are not converted into passes by removing their dataset.

When real-data work resumes, agree actual permitted samples, reviewed records/grants, domain judgments and a new paid allowance. The default protocol permits at most six submissions/twelve provider calls per separately approved batch, counting historical reread as a new attempt and prohibiting automatic repair/retry. On 2026-10-17 the owner explicitly authorized paid calls and continued feature fixes without asking again for each batch. That standing authorization supports the current empty-archive stabilization; it does not resume deferred data preparation or deploy public access. Routine fixtures use no real data, Storage or paid APIs.

The explicit temperature=0 setting follows the [official Chat Completions parameter documentation](https://api-docs.deepseek.com/api/create-chat-completion/) for non-thinking mode. It reduces sampling randomness, not the need for strict validation or semantic review; no deterministic-correctness guarantee is implied.
