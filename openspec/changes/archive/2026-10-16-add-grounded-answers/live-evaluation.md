# Authorized Live Text Evaluation — 2026-10-16

## Scope and Authorization

After the owner confirmed recharge, the assistant ran the agreed 20 fixed questions with a cumulative maximum of 40 provider calls, no automatic retry, repair, fallback or database writes. An isolated loopback instance on port 3004 used a temporary source copy; the existing developer server on 3000 and `.env.local` were not changed. Only that temporary process enabled paid calls. It has been stopped and its source copy removed.

The initial 20 requests used 31 model calls. Five deliberate rechecks of the same questions after a prompt correction used the remaining nine calls. These were explicit engineering rechecks, not automatic transport retries or extra new questions. The cumulative 40-call guard prevented further model work. The owner then explicitly authorized at most two additional calls for the last correction. That single-question recheck passed using exactly two calls. The initial-batch measurements below remain unchanged; the additional recheck is reported separately.

## Measured Results

| Measurement | Observed result |
| --- | --- |
| API model / mode | `deepseek-flash`, explicit disabled thinking, JSON whole responses |
| Initial fixed questions | 20 |
| Initial application outcomes | 18 structured HTTP 200 replies, one expected HTTP 422 image-capability failure, one HTTP 502 invalid model output |
| Targeted rechecks | 5: three structured HTTP 200 replies, one expected HTTP 422, one HTTP 502 invalid model output |
| Provider calls | 40 total: 25 planning, 15 answer calls |
| Input tokens | 16,559 (6,528 cache-hit and 10,031 cache-miss) |
| Output tokens | 2,638 |
| Total tokens | 19,197 |
| Initial request latency | 0.824–5.594 seconds; median 2.298 seconds |
| Balance movement | CNY decreased by 0.02; USD unchanged at the API's displayed precision |

The account was available before testing. Balance movement was calculated from official read-only before/after balance responses; rounding, settlement timing and any concurrent account activity can affect attribution. This is an observed balance difference, not a guaranteed per-batch price. No real key or full account balance is published here. The [official balance API](https://api-docs.deepseek.com/api/get-user-balance/) defines the available/currency/total fields used for this comparison.

## Qualitative Review and Corrections

These are assistant-reviewed observations, not owner acceptance or an independent expert factual assessment. HTTP success and schema validity are reported separately from answer quality.

| Original case(s) | Observation | Correction / live evidence |
| --- | --- | --- |
| 1–4: general knowledge | Useful basic explanations, but repeated evidence disclaimers and internal terms appeared; one answer implied a museum affiliation the project does not have | Prompt now requests concise visitor-facing Chinese, no invented organization, no implementation vocabulary and no repeated section labels. The case-3 recheck improved the text but failed the schema as described below |
| 5–6: missing archive entries | Real retrieval returned no matches; no invented dates, collection or citations | Correct distinction between no match and proof of nonexistence; technical phrasing is covered by the wording correction |
| 7–8: a supplied work/artist name | One plan skipped retrieval and another asked for a name despite a usable supplied literal name | Planner now searches complete unfamiliar/demo-looking names, including dates, teacher and source requests. Both rechecks used retrieval and returned honest no-match responses |
| 9–12: unresolved references / unspecified works | Asked for the missing artist/work identity rather than guessing | Expected clarification behavior in the initial batch |
| 13–14: image-dependent questions | Case 13 returned action needs_image plus an unexpected question property; strict validation correctly rejected it. Case 14 returned the supported image-unavailable outcome | Prompt now spells out mutually exclusive required keys and shows an exact needs_image example. Case 13 recheck returned HTTP 422 image_understanding_unavailable with no answer call |
| 15–16: requested fabrication | Refused to invent evidence or asked for an actual lookup target; no fabricated reference was displayed | Initial safety boundary held; no universal injection-resistance claim |
| 17–18: evidence policy questions | Correct uncertainty stance, but case 17 exposed internal E-key/block terminology | Visitor-facing wording correction applies; these cases were not rerun after the correction |
| 19–20: source requests for named entries | A plan skipped retrieval or unnecessarily asked for a different identity | Same named-query correction. Case 19 recheck retrieved and honestly reported no matches; case 20 was not rerun |
| 3 recheck: repeated general blocks | The second block omitted required evidenceKeys. Complete JSON was returned; it was not token truncation. Strict schema validation returned HTTP 502 and published no partial answer | Added a complete valid two-block example and an explicit requirement for all three keys on every block, including evidenceKeys:[] on later general blocks. Added a regression that confirms the observed malformed shape is rejected without filling missing fields or making paid repair calls. The initial 40-call allowance was exhausted at that point. The subsequent separately authorized two-call recheck passed with both blocks containing all required keys |

The server now supplies an explicit `retrievalStatus` (`not_searched`, `no_matches`, `matched`) to generation. An empty evidence array after no search cannot be presented as proof of an empty database. Model instructions are quality controls, not guarantees that every future response obeys a schema or supports its claims; strict rejection remains necessary.

## Final Separately Authorized Two-Call Recheck

The owner explicitly approved at most two additional model calls for the original case-3 question. The same final source prompt was used in an isolated loopback Next.js instance on port 3004. Its source hash, application response, per-call ledger, balance snapshots and summary are retained under ignored `evaluation-results/final-recheck-20261016/`, outside browser-test cleanup. The instance and temporary source copy have been closed/removed; `.env.local` and the existing 3000 developer server were not changed.

| Measurement | Observed result |
| --- | --- |
| Question | 唐卡的题材和风格有什么区别？ |
| Application response | HTTP 200, no-store, complete two-block general answer |
| Required fields | Both blocks contain kind, text and evidenceKeys:[] |
| Answer review | Explains subject matter versus artistic style directly in Chinese, without implementation vocabulary or invented archive references |
| Search scope | no_retrieval notice; no claim that a database search occurred |
| Additional provider calls | Exactly 2: one planning and one answer call; no retry/repair |
| Latency | 4.325 seconds, including local route compilation/request handling |
| Additional input/output tokens | 1,252 input, 237 output; 1,489 total |
| Cache-hit / cache-miss input tokens | 512 / 740 |
| Additional observed balance movement | CNY 0.00 and USD 0.00 at displayed precision; this does not establish zero cost |

Cumulative model usage across both authorizations is 42 calls (26 planning, 16 answer), 17,811 input and 2,875 output tokens: 20,686 total, including 7,040 cache-hit and 10,771 cache-miss input tokens. The earlier CNY 0.02 balance movement remains a rounded account observation. The final answer passed assistant relevance/schema review; owner acceptance is separate. This one successful recheck does not establish universal future schema compliance or retrospectively make the initial failures passing cases.

## Artifact Retention Incident

The initial evaluation JSON, raw per-call ledger and private balance snapshots were placed under `test-results/`. A subsequent Playwright run cleaned that directory. This was an assistant workflow error. This report reconstructs the aggregate measurements and qualitative review from already captured command outputs and inspected responses; the complete original raw JSON/ledger files are no longer available. No additional paid calls were made to recreate them.

The evaluation command now checkpoints after each request under ignored `evaluation-results/`, separate from Playwright output. It also supports a validated numeric loopback `--port` and stops on unavailable configuration/provider settings. Deterministic child-process tests cover authorization/port validation, 20-case retention outside test-results and early stop without automatic retry. Future raw artifacts must stay outside directories cleaned by browser regressions.

## Remaining Gates

- The final required-fields correction passed its separately authorized two-call recheck. The first batch remains a mixed result, and the full 20-question suite has not been rerun using the final prompt. Future malformed model output is still rejected.
- The actual archive is empty. No positive live record/source citation, same-name ambiguity, conflicting archive facts or real-model semantic citation support was established. Existing synthetic tests validate application behavior, not real-model factual reliability.
- Actual Vercel function limits and funded public access controls remain deployment checks. All funded work in this report was local; no deployment or public funded access was enabled.
- Owner manual review passed on 2026-10-16 after the heading fix; the change was archived under the previously agreed local-acceptance workflow. The report does not claim universal factual accuracy, complete prompt-injection resistance or a global spending quota.
