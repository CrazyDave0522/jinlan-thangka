# Text AI Setup and Evaluation

The approved `add-grounded-answers` increment implements text-only DeepSeek orchestration. It does not implement image understanding, persistent conversations, full source inspection or a global spending quota.

## Safe Defaults

Use the ignored root `.env.local` for these server-only settings:

```dotenv
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-flash
DEEPSEEK_ENABLED=false
```

A key alone never enables generation. Missing/invalid settings or disabled generation return `generation_unavailable` without a provider call. A valid current image turn still submits/displays but returns `image_understanding_unavailable`, even with generation off. Shorten/correct rejected input or explicitly edit the final failed question; editing restores text only and never overwrites a newer composer draft.

Do not put the key in NEXT_PUBLIC variables, code, tracked files, screenshots or chat. Restart the local server after changes. On Vercel, set the same private environment names and redeploy. Do not enable funded public access merely to test a deployment.

## Limits and Failure Behavior

Each attempt makes at most one planning call (1,024 output tokens), up to two validated lexical retrieval queries (five roots each), and one answer call (1,536 tokens). Both model calls use a fixed official endpoint, explicit disabled thinking, JSON output and no streaming. Clarification uses only planning. There is no automatic retry, repair, alternate model or fallback provider.

The request allows at most 32 messages, a 2,000-code-point current question and 16,000 total canonical context code points. Only completed answer/clarification pairs enter a new request; failed/unavailable questions stay visible but are excluded. History image bytes are validated by the app but never sent to the text model; the visitor sees a limitation notice. Context/evidence overflow fails explicitly, without silently trimming. Existing image selection/byte/pixel limits remain in [storage.md](storage.md).

The application deadline is 55 seconds from POST entry (including body reads), with planning/answer stage caps of 18/28 seconds and a 65-second client attempt including encoding. The route declares `maxDuration=60`; verify the actual Vercel project's execution limit before activation. Local builds cannot establish a deployed account limit. Native image decoding and provider billing may continue briefly after transport cancellation.

Two concurrent orchestrations are allowed per runtime, with no queue. This is not a global quota across serverless instances. CNY 10–20 was a planning suggestion, not approved spending or an enforced ceiling. Before unattended public funded access, choose actual platform access protection or approve shared rate/quota enforcement. Disable generation after the demo and redeploy/restart.

All application outcomes are no-store. Authentication/credits/configuration errors have safe service-unavailable copy; retry is manual and offered only for defined transient final-turn failures. Retrying starts a fresh AI attempt and may cost money. Corrective failures keep the original visible turn and any newer draft intact.

## Deterministic Verification

Run `npm run check` and `npm run test:e2e`. The latter builds once with synthetic settings and runs actual Next.js routes against fake server-process upstreams; it never uses a real key or database. See [testing.md](testing.md). A passed mock suite validates contracts and UI behavior, not model factual quality.

## Separately Authorized Live Evaluation

A first authorized local batch has been performed; see [the live review](../openspec/changes/archive/2026-10-16-add-grounded-answers/live-evaluation.md) for failures, corrections and the successful separately authorized final recheck. Before running another batch, obtain explicit funded-call authorization and agree a batch allowance; confirm available account credits, actual deployment duration and access scope. Keep access local or protected. No account key/balance inspection is needed in chat.

1. Review the 20 fixed cases in `scripts/evaluate-answers.mjs`. Each starts a fresh conversation; at most 40 provider calls are possible, without automatic retries. The script never inserts database records.
2. Note account usage/balance, enable generation explicitly and restart a local server at port 3000 (or use a separately owned loopback instance). Keep a deliberately small prepaid balance; request/token caps do not guarantee a CNY ceiling.
3. Run `node scripts/evaluate-answers.mjs --allow-paid` only after authorization; `--port=3004` can select a separately owned loopback instance without changing the developer's existing server. It sends to the fixed loopback app endpoint, checkpoints results after each case under ignored `evaluation-results/` (separate from Playwright's cleaned output directory), and makes no direct provider/account calls. The command stops on unavailable configuration/provider settings without retrying. Review the batch and remaining authorized allowance before any rerun.
4. Inspect safe server `ai_completion` usage/latency metadata and provider-console before/after expenditure. Report actual input/output token usage, model/mode, failed cases, latency and actual expenditure; do not substitute the illustrative planning estimate for measurement.
5. Manually score each result for relevance, archive/general separation, missing-evidence honesty, uncertainty, clarification and citation support. A real-but-irrelevant E key or a false archive claim under “general knowledge” fails the case despite schema validity. Include separate controlled synthetic-evidence evaluation cases from the test fixtures when reviewing the evidence rules; the empty live archive cannot establish factual retrieval accuracy. Routine fixture tests do not measure real-model semantic quality.
6. Disable generation and restart/redeploy after evaluation. Record results and limitations in the change's verification record. Do not archive or claim funded evaluation passed until those remaining gates are met.
