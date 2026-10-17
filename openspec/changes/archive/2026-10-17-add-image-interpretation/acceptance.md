# Implementation and Quality Acceptance

## Contract Acceptance Matrix

These are acceptance requirements; executed deterministic results are recorded in [verification](verification.md). The owner deferred curated-data preparation and domain acceptance on 2026-10-17. Implementation used synthetic fixtures and empty-archive behavior; the subsequent owner-authorized [runtime evaluation](empty-archive-evaluation.md) records corrected model-contract, named-retrieval and semantic failures and a passing final eight-case round. [Archival](archival.md) closes that implementation scope while keeping real-data/domain acceptance deferred. Vitest/RTL validates contracts/state; Chromium validates the actual request lifecycle/layout. Future real-data evaluation measures recognition and domain accuracy rather than replacing these behavior checks. Test exact and one-over boundaries.


| ID | Required fixture/action | Observable acceptance |
| --- | --- | --- |
| C01 | Version-2 image-free request and explicitly opted-in minimal text request | Correct v2 success with empty vision arrays; no legacy success bypass |
| C02 | Old unversioned request without protocol opt-in, mismatched/unknown version, unknown keys, invalid IDs | invalid_request before paid work; stale tabs cannot repeatedly pay for an unreadable new response |
| C03 | Four versus five active visitor inputs; three new plus two history selected during asynchronous preparation | Recheck at batch commit: four accepted; an overflowing new batch is rejected atomically and released before dispatch/provider, preserving historical selections and text |
| C04 | Twenty versus twenty-one distinct retained attachments, including failed previews/drafts/shared snapshots | Atomic selection rejection at 21; shared reference counted once; explicit full-clear refresh explanation |
| C05 | Forged manifest owner, hash/dimensions/MIME mismatch, unknown input or observation origin | invalid_image_context/invalid_image as specified; no paid work |
| C06 | Consecutive textual user entries versus malformed historical image origin | Text shape remains accepted; fabricated image ownership cannot become trusted completed history |
| C07 | 300/301 observation text points and combined 16,000/16,001 context | Exact caps accepted; overlong supplied observations are invalid_image_context, overlong model observations are invalid_model_output, combined overflow is corrective context_too_large; no hidden allowance/truncation |
| C08 | 4 MB incoming, 3 MB analysis and 6 MB verification envelopes; separate 64 KB/128 KB text caps | Each independent boundary enforced before the affected call; default answer remains text-only |
| C09 | Four independent image groups and normalized duplicate query wrappers | Up to four actual queries with correct per-group roots/caps; disjoint nonempty group duplicates run once with unioned provenance; text/overlapping duplicates fail |
| C10 | Three ordinary text queries or five image-related queries; unknown query/group/field | Invalid model output before DB I/O; no repair call |
| C11 | Unsupported grouping, ambiguous pronoun, missing picture | Valid clarify/needs_image behavior; no invented picture/work assignment |
| C12 | needs_image with original and missing targets | One clarification call, no DB/reference/answer call; valid action includes complete target set, visible stable target labels/jump links and no automatic POST |
| C13 | Summary-only identity request | Reread clarification before archive/reference access; forged historical identity is not new proof |
| C14 | Explicit reread click while a next draft/images exist; explicit grouping selection/removal; mixed new/history previews | One new intent/POST under lock; source question/context captured through clarification; new draft and later unrelated turns remain independent; captured hints are restricted to targets; removed memberships/choices do not return on reselection and new labels match previews |
| C15 | Rapid double click, cancellation/unmount, timeout and late completion | One active attempt; no duplicate user intent, stale answer or partial observation replacement |
| C16 | Current observations supersede an old version; verification correction to an unseen image | Correct version commits only on full success; unseen-image update rejected; old displayed answers unchanged |
| C17 | Reused tentative deity/unreadable inscription | Qualification retained; no guessed missing text or summary-only promotion to certainty |
| C18 | Unique clear collection/accession pair with verified scoped source support, including repeated consistent readings in different regions | Server-owned identifier identity for actual supporting images only; normalized-equal readings count as one value and retain their original regions; zero reference reads |
| C19 | Alias/translation/punctuation/leading-zero change, multiple records sharing a pair, conflicting readings, missing identifiers, unscoped source, unverified record or affectsIdentity=true limitation | Identifier gate stays closed; missing record values use incomplete-evidence reasons rather than mismatch/conflict, while real contradictions still block either route; visibility-only limitations do not independently block |
| C20 | Ordinary unnumbered positive with two qualifying distinctive features, or a qualified reference positive whose record identifiers are null/empty/whitespace-only | Authorized comparison plus complete alternative coverage can pass reference gate; missing identifier metadata alone is not a conflict; all E/R/task/owner relations validate |
| C21 | Similar different work, generic proof, redundant quotes, mismatch, unresolved alternative, conflicting final observation, or newly clear identifier beside a contrary issued comparison | No false definite identity; either route checks final observations and issued target-specific comparisons, including after identifier correction; explicit corrections cannot discard a remaining conflict or inherit unrelated-candidate conflicts |
| C22 | Four-task/reference cap, two references per artwork, shared reference across groups | Deterministic round-robin tasks; at most four pairs/downloads; unexamined candidates remain explicit |
| C23 | Empty/stale/denied grant versus malformed required configuration | No unauthorized fetch; normal pre-read limitation versus safe reference_unavailable; independent identifier route remains usable |
| C24 | Unexpected host/path/query/redirect, signing/listing/auth-refresh attempt | Fetch wrapper fails closed and never forwards credentials to another origin |
| C25 | 401/403/404, 429/5xx/network, oversized/corrupt/animated reference, digest mismatch, five-second reference expiry | Exact safe failure/retry matrix; no partial answer, automatic fallback or late second call |
| C26 | Manual retry after grant/content changes | Original visitor snapshot reused, fresh archive/grant/hash checks, no prior byte/identity authority |
| C27 | Unknown/duplicate/unused E/R/observation/task key, wrong artwork owner, wrong canonical text | Client/server reject before committing an assistant turn or observation version |
| C28 | Failed visible turn before/between successful picture questions | Page-stable display indices/source-image jump targets stay correct; canonical IDs remain unambiguous |
| C29 | Configuration combinations, stalled request body, two runtime admissions | Correct unavailable precedence, deadline from POST entry, no late paid dispatch and admission cleanup |
| C30 | Runtime browser upstreams with owner env files present | Synthetic settings/grants override local configuration, nonallowlisted network is blocked, no real AI/Supabase/Storage call |

C07 includes the accepted 12,900-point text-only transcript with no separate observations, plus a separate 12,900-text + 3,100-observation case fitting 16,000 and its one-over case. C08 uses decimal bytes, not physical file size, and exact base64 overhead. C22 distinguishes visitor inputs (4 distinct), reference inputs (4 distinct), comparison tasks (4) and repeated provider exposures. A second reference/verification call is permitted only under the chosen route, not as error repair.

## UI and Canonical Acceptance

Keep the existing shared shadcn/theme/Geist/Lucide system and the eight core viewport matrix in docs/testing.md. Cover empty/current/history selection, four thumbnails/reference chips, long mixed visual/archive/identity content, candidate/insufficient states, one-click reread, disabled/pending/error states, stable source-image targets and near-bottom versus older-message scrolling. Inspect intermediate widths and ordinary landscape/reduced height. Record browser/emulation limits; no percentage audience-coverage claim follows from viewport passes.

[Fixed visitor copy](contracts.md#interaction-copy) includes the counts, full-clear refresh consequence, selected-image DeepSeek processing, prior-observation notice, new-request cost hint on reread and neutral implemented-but-disabled image feedback. Tests must not expose UUIDs, grant reviewer names, bucket paths, signed URLs, raw provider errors or implementation terms as ordinary visitor instructions. Existing archive quotations/actual source labels remain data.

Canonical tests exercise exact block prefixes, display markers, server identity lines, E/R index order, fixed notices, clarifications/reread targets and 3,500-code-point overflow. Verify successful full commit and all-or-nothing rejection; snapshots alone are insufficient behavior tests.

## Real Model Quality Rubric

Routine mocks cannot establish this rubric. A domain reviewer supplies permitted reference/visitor pictures, actual record links, source-supported features and expected uncertainty before an authorized batch. Review processed copies, not only full-resolution originals. Preserve the fixed input, actual output/failure, model/mode, usage, latency, route, candidate/reference coverage and human judgment.

| Quality dimension | Pass rule |
| --- | --- |
| Correct record | Numbered positive and ordinary unnumbered positive identify the expected actual UUID when their evidence gates are available; candidates alone do not pass the ordinary-photo positive |
| False matches | Zero definite identity on similar-work negatives, ambiguous/unmatched images or unexamined plausible alternatives |
| Evidence support | Every identity field/feature is actually supported by its E-key value, source scope and real visual detail; a valid but irrelevant citation fails |
| Picture association | Every observation/comparison/identity belongs to the correct picture/group; no cross-image borrowing |
| Uncertainty | Tentative/unreadable/conflicting details remain qualified; reused summaries do not become new inspection or stronger certainty |
| Source integrity | No invented record, source title, URL, page/locator or model-authorized reference fetch |
| Continuity | Summary follow-up and explicit reread answer the original intent, with current visual versus historical context labelled correctly |
| Operational behavior | Complete valid response inside configured caps/deadlines; truncation/timeouts remain failed cases, not prose-quality passes |

A false definite identity, fabricated source, cross-image association or unsupported certainty is a hard failure. Do not average it away with good general explanations. A cautious candidate can pass a deliberately ambiguous case; it fails a designated positive identification case with sufficient expected evidence. No universal artwork-recognition accuracy is claimed from a small batch.

## Initial Paid Pilot Protocol

### Empty-Archive Stabilization Smoke

Before resuming deferred real-record identification acceptance, a separate empty-archive smoke can check the current output/retrieval/wording fixes without preparing replacement archive data. The protocol itself grants no paid authorization. On 2026-10-17 the owner explicitly authorized paid calls and continued fixes without per-batch reconfirmation; current stabilization uses that standing authorization with small reviewed batches. Use permitted synthetic visitor pictures with prewritten visible features/readings, the unchanged empty archive and empty production grants; record the exact processed inputs and expected behavior. The initial scope is six submissions/twelve provider calls per reviewed batch, with separately recorded unreadable/conflicting-label extensions and focused reruns under the owner's standing authorization. No product-level automatic retry/repair is introduced; review failures before running another manual batch. Explicit reread is the sixth submission. Do not modify persistent model switches or publish visitor/provider payloads in tracked reports.

| Case | Required check |
| --- | --- |
| E01: unmarked provisional artist/work name | Search the complete supplied name even when unfamiliar; completed empty retrieval is no_matches, with no invented record/date/source |
| E02: explicitly marked full artwork title | Exact name-only query, no inferred subject/style restriction or title-number-to-accession conversion; no false identity |
| E03: four selected synthetic pictures | Four complete correctly associated observations within 300 points each; unreadable text uses the exact placeholder; output completes inside stage/token caps |
| E04: summary follow-up | No unselected historical pixels, no new observations or promoted certainty; no unsupported material/date/source claims |
| E05: request for unseen historical detail | A genuine needs_image clarification with the correct target pictures; cached descriptions are not fresh pixels |
| E06: explicit reread | Captured original question and selected pixels, valid observation replacement, complete output, no duplicate labels or unsupported archive claims |

Record failure/usage/latency and the actual query/status for every case, including missing-versus-conflicting evidence and natural Chinese wording. Schema passes alone do not pass semantic assertions. These cases cannot establish specific-work identification accuracy, real reference permissions or domain acceptance; those remain deferred. Any failed case remains open and requires review before another funded batch.

### Deferred Real-Record Pilot

This protocol alone authorizes no funded calls. Real-data preparation and domain acceptance remain deferred by the owner; current paid stabilization authorization does not itself supply reviewed real assets or restart that data work. When that work resumes, the intended six-case set is: numbered positive, unnumbered positive using a changed crop/view of a known archive work, visually similar different-work negative, multi-picture/ambiguous interpretation, a follow-up needing new historical detail, and the explicit reread action for that follow-up. Count reread as the sixth new attempt, not an uncounted continuation. No automatic rerun/repair; unexpected results fail their cases and must be reviewed before more calls.

Confirm the actual assets, records, reviewed permission entries, domain reviewer and documented attempt/call/expenditure scope before activation; respect the owner's standing paid authorization rather than asking for it again within the authorized task. Disable paid generation after the authorized run. If some real data/permissions are unavailable, report the corresponding cases as not run, not passed; feature implementation can still be completed against synthetic evidence, while real identity accuracy remains explicitly unevaluated until the deferred data work resumes. Review measured latency/usage before changing stage/output caps.

## Completion Record

After implementation run npm run check, the production build and affected Chromium flows; record outputs and any failures. Validate OpenSpec strictly again. Keep every remaining real-data/paid/deployment check explicitly open until performed. The [final documentation review](review.md) closes task 1.3 with fixed contracts/gates/access and consistent scenarios; the future implementation and real acceptance results above are not implied by that closure.
