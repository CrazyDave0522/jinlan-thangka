# Proposal Completeness and Decision Review

Final review updated on 2026-10-17 after owner-requested refinement. This review does not implement the proposal or authorize paid calls. The [design](design.md) and [proposal](proposal.md) incorporate the owner-approved direction for ordinary-photo identification, one-click reread, uncertainty-preserving observations and four-work queries. They replace the earlier candidate-only/full-history design and make single-pass interpretation a default with bounded targeted verification, not an absolute ban on a second visual comparison. The final contracts are fixed; strict validation establishes document structure, not real-model quality.

## Owner Decisions and Delegated Defaults

### D1. Specific archive-work identification: required

The owner explicitly requires identification of a specific archived work in this increment. The earlier recommendation to defer every definite image-to-record identity is superseded. The revised scope includes identified/candidate/no-match/insufficient-evidence outcomes with both readable-identifier matching and ordinary unnumbered-photo/reference verification. The evidence matrices must distinguish clear supported links from mere similarity, uncertainty and unresolved competing candidates. Catalogue correspondence does not establish physical genuineness.

Real identity acceptance still requires representative records/pictures and expected linking evidence; an empty archive does not remove the implementation goal or establish accuracy. Exact evidence gates and associations are fixed in [identification](identification.md) and [contracts](contracts.md); whether identification belongs in scope is settled.

### D2. Total counts and selective history: direction decided

The owner requires total limits, delegated the initial count and rejected repeated full-history image inputs. Set the engineering starting policy to:

| Scope | Limit |
| --- | --- |
| New attachments per message | 4 |
| Distinct active visitor images per attempt, new plus selected history | 4 |
| Distinct retained prepared attachments across the page | 20 |

The previous eight-input/all-history suggestion is superseded. Twenty supports five full four-picture sets or twenty single-picture inputs in a short demo. Four active inputs supports existing comparison behavior while keeping maximum prepared base64 near 2.67 MB before bounded metadata/text, within the separate 4,000,000-byte request cap. These are engineering defaults to validate, not measured usage statistics. Existing 32,000,000 retained-byte and per-image guards remain additional checks.

Preserve eligible text/references and bounded prior observations, not automatically all image bytes. Add explicit historical-picture selection when fresh detail/comparison is needed. Default to reading selected images in analysis and answering from text observations/evidence. Ordinary-photo identity verification may instead use the relevant already-selected visitor pictures plus at most four authorized archive reference images in the second call. References have separate transient server count/byte/time budgets; they do not consume visitor retention slots. No hidden rereads, persistent Files API objects or automatic provider retries are introduced.

The [official Vision guide](https://api-docs.deepseek.com/guides/vision/) documents independent image tokenization; [multi-round guidance](https://api-docs.deepseek.com/guides/multi_round_chat/) documents stateless requests. The proposal reduces duplicate image inputs; it does not promise that a provider remembers previous pictures, zero token charges for summaries or a fixed percentage monetary saving.

## Refinement Resolution

All eight design gaps are closed in the documents below. Their future tests remain implementation work; design closure does not claim runtime verification.

| ID | Fixed decision | Contract and future acceptance |
| --- | --- | --- |
| G1: multi-picture coverage | At most four image-group/two ordinary text queries; disjoint image-group duplicates merge, text/overlapping duplicates fail; five artwork roots per query and one shared evidence cap. | [Planning contracts](contracts.md#planning-output-and-query-authority), C09–C10 |
| G2: identity and permission | Clear same-picture collection/accession route, or source-supported distinctive comparison plus all-alternative negative coverage; compiled per-image row/content grants and stateless anon SDK access. | [Evidence matrices](identification.md), [reference access](reference-access.md), C18–C26 |
| G3: picture grouping | Explicit visitor grouping hints only; separate observations and deterministic selected representative; grouping alone proves no physical identity. | [Request contract](contracts.md#request-version-2), C11/C20/C22 |
| G4: labels and reread | Stable first-submission indices; one explicit new intent/POST captures source context through clarification, preserves newer drafts and holds the ordinary attempt lock. | [Reread contract](contracts.md#captured-reread-intent), C12–C15/C28 |
| G5: observation versions and migration | Strict 300-point observations, server version/hash/origin, atomic replacement only after whole success; v2 protocol opt-in prevents stale-client paid requests. | [Observations](contracts.md#observations), C01–C07/C16–C17/C27 |
| G6: latency/detail | Image analysis 2,048 tokens/25s; default answer 1,536/20s; targeted verification 3,072/20s. Reference stage ≤5s inside the same 55s deadline; 3 MB/6 MB full outbound caps and existing text envelopes. | [Design](design.md), C08/C25/C29; actual latency remains a later funded measurement |
| G7: processing copy | Fixed Chinese labels/help for selection, grouping, reread/cost, retention and selected-image DeepSeek processing; no provider-deletion promise. | [Interaction copy](contracts.md#interaction-copy), [UI acceptance](acceptance.md#ui-and-canonical-acceptance) |
| G8: quality acceptance | Per-case hard failures, mandatory numbered/unnumbered positives and similar-work negative; six-attempt/twelve-call proposed pilot counts reread as a new attempt. | [Quality rubric](acceptance.md#real-model-quality-rubric), [pilot](acceptance.md#initial-paid-pilot-protocol) |

D1/D2 and all technical choices above are resolved. The owner need not choose parser shapes, database algorithms or UI tokens. Task 1.4 was closed by owner implementation approval on 2026-10-17; funded evaluation still needs its own allowance.

## Prior Agreements Checked

The [archived upload review](../2026-10-16-add-image-upload/review.md) records four JPEG/PNG attachments per message and an accumulated-context warning with deliberate refresh clearing conversation/images/draft. The [archived proposal](../2026-10-16-add-image-upload/proposal.md) specifies 4,000,000 serialized request bytes and 32,000,000 retained prepared bytes. Thus total image use was discussed, but no fixed page-wide picture count had been set. The new twenty-picture count adds a bound, while selected history changes the earlier all-eligible-bytes transport policy through the pending spec deltas. Archived/current accepted specs remain untouched until implementation/archive.

## Information Needed Later

The owner deferred curated-data preparation on 2026-10-17 and withdrew the previous dataset. No placeholder records, new Storage buckets or chat-shared keys are needed for current feature work. Future real identity evaluation needs permitted pictures, corresponding reviewed records, distinctive field sources and independent expected links, alongside ambiguous subjects, unreadable text, non-Thangka input, same-work details, multi-work comparisons and historical follow-ups.

Before a real paid batch, agree cases, attempts/call allowance and expenditure scope; prior text-evaluation authorization does not apply. A small six-attempt pilot would allow at most twelve provider calls in total without automatic retries, then review before expansion. Explicit reread attempts count toward the same authorized attempt/call allowance; they are not free continuations. This is a proposal, not paid authorization or a guaranteed currency ceiling. A domain reviewer should judge semantic results against expected evidence rather than schema validity alone.

Before deployed activation, verify actual Vercel duration/configuration and end-to-end selected-image upload/latency. [Official Vercel limits](https://vercel.com/docs/functions/limitations) document a 4.5 MB request/response maximum; the app's 4,000,000-byte incoming limit remains below it nominally. The 3,000,000-byte analysis and 6,000,000-byte targeted-verification caps are separate outbound application limits, not Vercel incoming-payload allowances. No account upgrade is established as necessary.

## Readiness

Scope, exact contracts, evidence gates, access method and acceptance scenarios are fixed. The [final document checks](review.md#verification) pass and task 1.3 is complete; the owner approved implementation under task 1.4 on 2026-10-17. No further owner information is needed for deterministic implementation. Permitted real assets/records, rights review, funded quality evaluation and deployment verification remain later acceptance inputs. No application code or owner environment was changed during this review.


Implementation and executed deterministic checks are recorded in [verification](verification.md). The review above records design closure; actual real-image/permission/latency acceptance remains outstanding.

The owner has now deferred curated-data preparation and requested removal of the previous dataset and its dedicated artifacts. Current feature verification uses synthetic fixtures and empty-archive behavior. Earlier runtime trials still exposed unresolved output/retrieval/semantic failures, retained in [verification](verification.md); their removal from dataset reports does not establish live acceptance. No further owner data is needed to work on these implementation issues.

The owner subsequently authorized paid model calls and continued fixes without per-batch reconfirmation. The [empty-archive runtime evaluation](empty-archive-evaluation.md) records actual provider/readonly archive traffic, intermediate failures, corrections and a passing final eight-case round; task 3.5 is now complete. This supersedes the earlier unfunded stabilization status, while real curated-data/domain acceptance and deployed runtime verification remain deferred/unverified.
