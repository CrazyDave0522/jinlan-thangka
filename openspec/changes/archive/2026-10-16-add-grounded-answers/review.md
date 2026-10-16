# Grounded Answers Proposal Review Follow-Up

## Outcome

The five original findings are resolved in the proposed design, delta and task list. This review records the pre-implementation refinement. At that point approval and implementation/testing were pending. The owner subsequently approved implementation on 2026-10-16; current delivery results and remaining gates are in [verification.md](verification.md). The owner reports placing the key locally; it was not read, and no provider call, payment or runtime-source change was made.

Confirmed direction remains official DeepSeek Flash, explicit non-thinking whole responses, scoped evidence/general-knowledge presentation and short-demo spending. No provider switch, login, persistence, Storage or image interpretation is introduced.

## Resolution Map

| Original finding | Concrete resolution | Required implementation evidence |
| --- | --- | --- |
| P1: Browser tests could inherit credentials and browser interception cannot mock server-originated provider requests | Explicit synthetic build/private-runtime settings; test-owned Node fetch preload only in the fixture Next.js process, no app test URL/route; intercept fixed provider/synthetic Supabase traffic and block other outbound requests; fail startup if bootstrap/settings are wrong | Actual `/api/chat` orchestration against fake upstreams, no paid/network escape, overridden inherited settings and off-mode zero calls; browser-only response intercepts reported separately |
| P1: Public response/reference contract was unspecified | Required success/error message shape, answer/clarification discriminant, typed owner/composite association identity, server field/value/status references, source-link identifiers, six notice codes, exact key/owner scope validation and deterministic canonical text | Both server and client schema tests including missing/unknown/null/duplicate/unused/cross-owner references and mismatched canonical text; migrate old plain API success intercepts |
| P2: Corrective failures could lose old drafts or overwrite newer ones | Preflight known context/attachment validity/size checks before clearing; preserve valid image submission and show server capability feedback; authoritative server checks retained; original failed turn stays visible; guarded “编辑问题” only with an empty idle composer; explicit action restores text only, not old attachments; next drafts untouched | Corrective failure while next text/images/preparation exist, safe edit-and-resubmit as a new ID, URL/blob release, no automatic resend or full-clear refresh |
| P2: Combined plan/history budgets were impractical | Planner output 1,024 tokens; orchestration filter values at most 64 code points; 16,000 canonical history code points and 32 messages; model block text at most 2,000, canonical answer at most 3,500; 64,000/128,000 planner/answer request bytes | Two-query/three-filter long plan fixtures; 12,900-code-point representative three-pair transcript; exact/one-over counts and CJK/emoji/escaping bytes; funded truncation/usage evaluation before a quality/cost claim |
| P2: Deadline excluded request reading; concurrent dedupe could overwrite changed evidence | Deadline starts at POST entry and covers stream reads/validation/serialization; stage caps use shared remaining time; identical rows deduplicate structurally; same-identity payload differences fail evidence_changed before answer generation; ordered query provenance remains | Stalled-body/native-late-work/cancel cases, same-ID identical versus changed rows/links/composite associations and fresh manual retry without partial evidence |

## Contract Consistency Checks

- Design/spec/tasks use the same 16,000 context, 2,000 current question, 32 messages, 64-code-point planner term and 1,024/1,536 provider output-token values. The archived retrieval API still permits 200-code-point filters; the narrower orchestration term cap is deliberate, not a modification to requirement 4.
- A 55-second shared POST-entry deadline, 18/28-second provider stage caps and 65-second client timer have different scopes and are explicitly defined. Native decoding/slow transport cancellation is not promised to be instantaneous.
- Successful clarifications have no blocks/references. Failed/unavailable turns remain visible but never become trusted assistant responses or future provider context. Identical retry and explicit editing are separate actions.
- Model reply limits, canonical history limits and public reply bytes are independent. No silent text/evidence trimming, automatic repair call, hidden retry or automatic upgrade is permitted.
- Same-record version drift differs from competing evidence records: different source/association identities remain distinct; only conflicting payload versions of the identical key trigger evidence_changed.
- Current images are declined before paid calls. Sanitized historical images yield visible notice; image data is never sent to this text-only provider path.
- Runtime code keeps a fixed provider endpoint. Test fixture interception lives in process startup under tests, not production routes or a user-controlled endpoint parameter.

## Remaining Operational Gates and Limits

There is no new owner business question needed to implement this refined scope. Before real paid evaluation, confirm available credits and a concrete batch allowance, and verify actual deployed function duration. CNY 10–20 remains a planning envelope, not a global spending quota. Per-runtime concurrency does not protect all Vercel instances; funded unattended public access requires an actual platform/shared-access decision rather than an in-memory spending claim.

Catalogue membership and exact reference validation do not prove semantic support. Quality cases must include real-but-irrelevant citations and archive-specific assertions labelled as general knowledge. Fixed-model evaluation and empty-database tests must report that limitation; no universal hallucination-free guarantee is asserted.

## Verification of This Refinement

Strict OpenSpec validation passed for all eight active changes/specs after synchronization; relative-link, whitespace and superseded-budget checks also passed. No runtime behavior tests are claimed for Markdown-only refinement. Implementation approval was still unchecked at the refinement stage; this review itself enabled no paid calls.

## Second Consistency Pass

Compared the refined change with the formal text-conversation/image-upload specs, not only the new capability. Added full MODIFIED blocks for text submission preflight, ordered eligible context, response availability/failure recovery, image submission feedback and transient payload timeout. This closes the archive-time conflict where the existing spec still required unavailable user history and a 30-second image deadline. Existing formal/archived specs were not edited during proposal refinement.

Retained valid image submission/display instead of blocking it merely because vision is unavailable; only the server returns the capability failure before any paid work. Client preflight rejects input/context limits, not the already implemented attachment feature itself. The original request identity contract remains nonblank unique strings/echoed turnId; only assistant/archive IDs require UUIDs. Added Chinese field labels for visible/canonical reference indexes, with SQL field keys retained only as structured identifiers.

Updated stale project-level model deferral text to distinguish the proposed text-model choice from unimplemented provider behavior and still-deferred visual interpretation. No secret/credit inspection or paid call occurred. No new owner decision is needed beyond the existing implementation/live-evaluation gates.
