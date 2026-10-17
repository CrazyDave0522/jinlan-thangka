# Empty-Archive Runtime Evaluation

Executed on 2026-10-17 after the owner explicitly authorized paid model calls and continued fixes without per-batch reconfirmation. This evaluates task 3.5 against the real provider and the configured empty archive. It does not resume deferred real-data preparation, accept real-work identification accuracy, deploy the app or archive the change.

## Environment and Method

- Ordinary production Next.js build, actual loopback `/api/chat` route, installed provider/retrieval adapters and real official `deepseek-flash`, disabled thinking, complete JSON responses. The final build explicitly uses temperature=0, following the [official non-thinking Chat Completions parameter documentation](https://api-docs.deepseek.com/api/create-chat-completion/). This reduces sampling randomness; it does not guarantee correctness or bitwise reproducibility.
- Real readonly archive search RPCs returned HTTP 200 and zero roots for every query. No fake model or archive response was used in these runtime batches. There were 27 actual search RPCs across all batches, with no record mutations or Storage requests.
- Paid enablement was limited to a separately owned loopback process. A temporary fetch guard allowed only the fixed model endpoint and configured readonly archive endpoints, with a process call cap; it blocked Storage and unrelated outbound requests. All test processes were stopped afterward. The existing `.env.local` was unchanged, including its pre-existing generation-enabled/vision-disabled settings.
- Inputs were seven generated 640 × 480 PNG test assets: four white panels with distinct colored circles/triangles/borders and `SYNTHETIC PANEL 1`–`4` / `DETAIL 47`–`50` text; one clearly labeled collection with deliberately blurred accession text; and two labels with the same collection value but different clear accession values. These are synthetic diagrams/labels, not Thangka photographs or real archived works.
- Exact processed PNGs, requests, responses and safe request/response usage traces remain in ignored `evaluation-results/empty-smoke/`. No key, authorization header, original owner dataset or real artwork/source was placed in tracked reports. Provider instrumentation recorded actual stage inputs/counts and outputs without adding any model call.
- Each submission used at most the existing two provider calls. Clarification used one. Failed cases were inspected before manual reruns; application retry/repair behavior, 300-point observations, byte/token/deadline limits and strict all-or-nothing validation were preserved.

## Review and Corrections

| Round | Submissions / calls | Observed result and correction |
| --- | --- | --- |
| 1 | 6 / 11 | All HTTP responses valid, but picture conclusions appeared under general knowledge, reread prose repeated the server search notice, and text answering introduced an unsupported museum-collection context. This was not a semantic pass. Added explicit evidence-kind examples, neutral source wording and exact duplicate-notice rejection. |
| 2 | 8 / 15 | Named retrieval and both additional label cases worked. The reread answer mixed a new observation with three unrelated historical observations in one block; the existing validator rejected the whole answer with `invalid_model_output`. Added explicit current-question/intent and separate current/prior observation ID sets, focused reread guidance and matching regressions. |
| 3 | 8 / 14 | Reread now answered only the requested label detail. Summary reuse unnecessarily asked for confirmation, and some picture-specific label/uncertainty claims still appeared in general blocks. Added an explicit direct-summary decision example and concrete classification counterexamples; made temperature=0 explicit. |
| 4 | 8 / 15 | Summary, reread and evidence kinds passed the reviewed cases. Clear conflicting label values were retained in readings/prose but the planner omitted an identity-affecting limitation. Added an explicit same-work cross-check instruction requiring the conflict in an observation limitation even when retrieval will be empty. |
| 5 | 8 / 15 | All eight cases passed the scoped structural, traffic and semantic checks below, including the structured conflict flag. No earlier failed case was reclassified as passed. |

## Final Eight Cases

| Case | Expected and actual behavior | App latency |
| --- | --- | --- |
| E01: unmarked provisional names | Both complete artist/work names searched exactly with two actual RPCs; `no_matches`; no invented date, source or museum context | 2.502 s |
| E02: explicit provisional artwork title | Exact full name-only lookup, no inferred subject/style filter and no conversion of the title's number to an accession; unsupported requested facts remain unconfirmed | 2.556 s |
| E03: four synthetic panels | Four separate current observations and groups; correct color/shape association; recognized as test diagrams; image-specific conclusions remain visual; four images only in analysis, none in answer | 5.955 s |
| E04: summary reuse | Direct answer from all four prior observations, with no redundant confirmation, new observation or image bytes; prior-observation notice and picture links preserved | 3.167 s |
| E05: unseen historical detail | Genuine reread clarification for picture 1, one model call and no image bytes; no fresh visual observations from cached descriptions | 1.207 s |
| E06: explicit reread | Captured original detail question, only picture 1 sent, `DETAIL 47` read correctly, current observation atomically supersedes its prior version; no mixed-origin block, unrelated recap or duplicate search notice | 3.631 s |
| E07: blurred accession / absent signature | Clear collection value retained, accession exactly `未能辨认`; missing/blurred evidence limitations use `affectsIdentity=false`; actual empty search and no invented conflict | 4.175 s |
| E08: clear grouped-label contradiction | Collection value plus A-47 and A-48 preserved without printed field prefixes; two exact collection/accession queries; explicit conflict limitation uses `affectsIdentity=true`; no definite work identity or invented source conflict | 4.535 s |

All final cases returned HTTP 200; E05 was the expected clarification and the others were answers. The final 15 completions ended with `finish_reason=stop`. The largest final observation was 120 text code points, below the unchanged 300-point limit. Maximum final analysis output was 968 tokens, below 2,048. Ordinary answer calls carried no image bytes. There were no archive references, reference images, comparison tasks or definite identities because no archive roots were found.

Semantic review compared the generated diagrams/labels and prewritten expected behavior, plus the actual queries, outputs and observation IDs. No invented author/date/material/source or mistaken definite catalogue match appeared in the final cases. This is an engineering review of synthetic test content, not independent domain review.

## Actual Usage and Limits

The five reviewed rounds used **38 submissions and 70 paid provider calls**: **191,820 prompt tokens + 18,270 completion tokens = 210,090 tokens** reported by the provider. The final successful eight-case round used **43,574 prompt tokens + 3,945 completion tokens = 47,519 tokens** in 15 calls. These totals include failed/intermediate rounds and cache accounting as reported by the provider; monetary charges were not independently read from the account, so no currency amount is claimed. The earlier withdrawn-dataset trials are separate historical usage.

The final round closes the scoped empty-archive stabilization checks for task 3.5. It does not establish a statistical reliability percentage, real OCR/Thangka recognition accuracy, correct positive image-to-record identity, actual curated-image permissions, native-device behavior or deployed Vercel latency. Reviewed real assets/records and domain acceptance remain deferred by the owner. Publication, deployment and final owner acceptance remain separate work.
