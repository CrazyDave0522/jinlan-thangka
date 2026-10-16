## 1. Refine and Approve

- [x] 1.1 Review the merged conversation/image/retrieval contracts and roadmap scope.
- [x] 1.2 Research official provider/free alternatives and record owner account/credit, cost and complete-response preferences.
- [x] 1.3 Specify query planning, evidence/reference and response contracts, image boundaries, budgets, failure/retry behavior and acceptance scenarios; include full MODIFIED deltas for the affected existing text/image capabilities.
- [x] 1.4 Add safe environment examples and setup instructions; validate the refined proposal.
- [x] 1.5 Obtain implementation approval; keep paid calls disabled until a funded live test is explicitly authorized.

Review follow-up completed: [review.md](review.md) maps all five findings to concrete public response/reference contracts, test-process isolation, corrective draft/edit ownership, aligned budgets and request-wide deadline/merge rules. These decisions are synchronized with acceptance scenarios. The owner approved implementation on 2026-10-16; delivery verification is recorded separately.

Implementation on `feat/add-grounded-answers` from main at `f9d60cf`. `.env.example` contains empty server-only settings; actual secrets were not read/written. Runtime remains config-off by default. The owner subsequently confirmed recharge and authorized one local 20-question/40-call batch; its failures/corrections and the subsequently authorized successful two-call recheck are recorded in live-evaluation.md. CNY 10–20 remains a planning recommendation, not a global cap or blanket further spending authorization.

## 2. Provider and Orchestration After Approval

- [x] 2.1 Read installed Next.js server/route/caching/duration guides; declare and confirm the build emits maxDuration=60. Actual deployed account duration remains a predeployment check in verification.md.
- [x] 2.2 Add server-only config validation and a fixed-endpoint native-fetch DeepSeek adapter with explicit JSON/non-thinking/whole-response settings, output limits and bounded raw responses.
- [x] 2.3 Add strict planner/answer and public success/error/reference schemas, canonical history equality, 16,000-code-point context validation and safe error/usage mapping; enforce no automatic repair, retry or fallback model.
- [x] 2.4 Implement one planning call, at most two validated structured retrieval queries, 64-code-point filter values and finite graph deduplication/provenance with evidence_changed on payload drift. Propagate errors without partial evidence or fake no-match outcomes.
- [x] 2.5 Build the bounded server-owned field/source catalogue, validate current-turn references and preserve scope, uncertainty, absent evidence and candidate caps.
- [x] 2.6 Implement the POST-entry shared/stage deadline including body reads, caller cancellation, late-work guards, per-runtime concurrency admission and no-store responses. Document the absence of a global serverless cost cap.

## 3. Route, Contracts and Presentation

- [x] 3.1 Start the shared deadline before request reading, then integrate the orchestrator after bounded request/image validation; keep config-off behavior and valid image submission/display, return a server image-capability outcome without paid calls and sanitize image-bearing history.
- [x] 3.2 Extend response/client assistant-turn types for blocks/references/notices and canonical history text with Chinese field labels; retain nonblank request identities/echoed turnId and UUID server-controlled assistant/archive IDs.
- [x] 3.3 Render complete evidence/general-knowledge sections and compact source summaries using existing components/tokens and Chinese copy; adjacent paragraphs of one kind share one heading while retaining their order/citations. Keep full source inspection/copy in item 7.
- [x] 3.4 Set the 65-second client timeout and corrective/transient retry rules; add preflight corrective validation (not a valid-image capability block) and guarded edit-question behavior; preserve newer drafts/attachments, focus, scrolling, immutable retry context, refresh clearing and stale-result guards. Exclude failed/unavailable turns from future model context.
- [x] 3.5 Update environment/provider/testing docs, including local .env.local, Vercel settings/redeploy, key privacy and the paid-call off switch.

## 4. Tests and Acceptance

- [x] 4.1 Add pure schema/context/catalogue tests for all valid/invalid variants, identity/scope, no evidence, conflicts, ambiguity/caps, spoofed references, JSON truncation/empty output and every boundary, including two-query/three-filter long terms, three long completed pairs, source/index/notice canonical expansion, scoped owner checks and same-ID payload drift.
- [x] 4.2 Add mocked provider/orchestrator tests for call/query limits, invalid planning before I/O, prompt-injection boundaries, no image bytes/secrets, config/credit/auth/rate/network/retrieval failures and safe usage metadata.
- [x] 4.3 Add cancellation/deadline/raw response/admission cleanup tests, including ignored abort/late success and corrective versus manual retry behavior.
- [x] 4.4 Add test-only Node runtime fetch fixtures (outside app code/routes), explicit synthetic build/runtime settings and nonallowlisted outbound blocking. Update route/component/real Next.js Chromium tests for complete answer sections, clarification/no-match/errors/retries, image boundary, draft/history/focus/scroll and mainstream viewport coverage. Migrate old plain-success/unavailable-history/image-outcome/30-second fixture expectations to the new accepted deltas. Keep routine tests independent of paid APIs/live data; prove missing/misconfigured fixtures fail closed and inherited real-looking settings are overridden without logging them.
- [x] 4.5 Run npm run check, production build, Chromium regression, strict OpenSpec and whitespace checks; record unavailable checks honestly.
- [x] 4.6 Complete the bounded local live quality gate: the initial 20-question batch plus five targeted original-question rechecks used 40 calls; the owner separately authorized two calls and the final required-fields recheck passed. Usage/latency/balance movement/failures/limitations are recorded in live-evaluation.md. Positive-record semantic accuracy remains unverified with the empty archive; no owner data was seeded.
- [x] 4.7 Record implementation results and explicit remaining gates in verification.md.
- [x] 4.8 Record the owner's manual acceptance on 2026-10-16 and archive under the agreed local-acceptance workflow; deployment/access checks remain predeployment work.

- [x] 4.9 Fix repeated category headings found during manual review by grouping adjacent same-kind paragraphs; verify content order, original citations and independent answer boundaries with component/Chromium regressions.
