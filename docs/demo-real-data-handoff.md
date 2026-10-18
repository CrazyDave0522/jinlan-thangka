# Real-Data Demo Acceptance Handoff

## Current Boundary

The owner reconfirmed on 2026-10-18 that replacement material is not ready and requested archival plus B-stage preparation. Milestone A remains accepted for its recorded artifact. B01–B06 and whole-release tasks remain open in the [release checklist](../openspec/changes/add-demo-release/tasks.md); this handoff is preparation rather than a new acceptance pass.

The current checked application is main@3a32a19, with the tested runtime from 16fb474. All eight business tables and the review ledger remain empty, and the production reference manifest contains no grants. Do not recreate removed data, import test fixtures or clear later curated material to repeat historical A. No new importer, gallery or search scope is introduced.

## Material to Hand Over

Local file paths and source/permission document locations are sufficient to start review. Keep original files and their original record identifiers. A collector need not invent database UUIDs or fill unsupported facts; preserve a stable original-record-to-UUID mapping during the later reviewed import.

| Material | Required information for the applicable case | Unknown or conflicting information |
| --- | --- | --- |
| Artist records | Actual display name; collector/handoff responsibility; original record identifier; source for the facts to be tested | Preserve unknown values and competing accounts; names are not unique identifiers |
| Artwork records | Actual title; original identifier; collector; intended artist associations and their uncertainty; fields needed by each frozen case | Do not create placeholder artists or infer normalized dates/attribution |
| Sources and links | Actual bibliography/URL/document; exact page or section; target record; exact supported field; supported statement or conflict | Put citation-specific detail on link locator/evidence_notes, distinct from source-wide notes |
| Curated reference originals | Real artwork association; stable original path; provider; rights status; actual permission evidence and scope for AI processing | Public availability or a verified record alone is insufficient permission |
| Visitor test pictures | Original file plus the expected artwork UUID or explicit ambiguous/unmatched outcome; permission to process the visitor input | Keep changed-crop/view examples separate from the exact reference original |
| Independent expected judgments | A named reviewer, expected record/evidence or uncertainty, and reasons fixed before model output is seen | Do not use the model's own answer as its acceptance oracle |

SQL-required names/titles/paths still need valid values. Optional facts remain optional. Technical image hashes/dimensions can be measured from actual originals; collection templates do not request thumbnails or operator-supplied revisions/current-review pointers. Use [database conventions](database.md) and [review maintenance](archive-curation.md).

## Freeze the Six Acceptance Cases

The table describes the existing [B acceptance matrix](../openspec/changes/add-demo-release/acceptance.md#b-deferred-real-data-acceptance), not dispatched cases. All rows are currently **not run: real material unavailable**. One record may serve several cases if it meets each case's independent requirements; there is no invented minimum dataset size or reliability claim.

| Case | Freeze before evaluation | Expected review |
| --- | --- | --- |
| B01 | Actual artist/artwork question, UUID mapping, relevant fields and sources | Correct record/context; missing, disputed and conflicting facts remain explicit |
| B02 | A real sourced answer case, field-specific locators and expected supporting passages | Each claim/E key/source/export agrees with the actual supporting material |
| B03 | A permitted numbered work/label picture containing both readable collection and accession; verified record with exact scoped support for both fields | Correct UUID only through the existing identifier gate; a typed name or copied identifier is not visual proof |
| B04 | A permitted ordinary unnumbered photo with a changed crop/view; verified target/image; scoped distinctive features and permitted references for plausible alternatives | Correct UUID only when the reference gate and alternative coverage pass; a generic deity/style resemblance is insufficient |
| B05 | Similar different-work, ambiguous and unmatched examples, with independent negative expectations | No false definite identity; incomplete coverage and contradictions remain qualified |
| B06 | Actual image rows, original bytes, reviewed grant binding and actual scoped anon object access | Correct row/content/permission binding and bounded download; metadata or a public URL alone does not prove access |

Use the unchanged [identity gates](../openspec/changes/archive/2026-10-17-add-image-interpretation/identification.md), [reference-access contract](../openspec/changes/archive/2026-10-17-add-image-interpretation/reference-access.md) and [evaluation protocol](../openspec/changes/archive/2026-10-17-add-image-interpretation/acceptance.md). Pending/disputed records remain retrievable; confirmed identity has its separate stronger gates. Even a confirmed archive correspondence does not authenticate the physical object.

## Execution Order When Material Arrives

1. Inspect the originals, source support, uncertainty and actual permission documents. Resolve ambiguous record mappings with the owner/reviewer; retain original files and explicit unresolved items.
2. Reinspect the current shared database, application revision and permissions. Preview the proposed import and reconcile existing records rather than deleting or matching by name alone. Use the established transactional import order; do not rerun the initializer or installed migrations.
3. Import only the reviewed real material under trusted SQL authority, then record actual review decisions against the versions inspected. Do not insert preverified rows or forge revisions/history. A stale-review conflict requires reinspection.
4. Finalize image technical fields and review state before granting reference access. Verify actual anon object access through the chosen SDK path. Do not broaden a bucket, add elevated application credentials or create visitor Storage. Record actual original-byte hashes and complete current-row digests; later content or review changes require renewed binding through the existing process.
5. Freeze B01–B06 questions/pictures, independent expectations, candidate source/config/archive/grant state, audience, time window, submission/call allowance and stop rules before any funded dispatch. The historical A/P/R allowance is not a new B batch. Keep the test candidate disabled while these inputs are incomplete.
6. Run applicable deterministic checks and non-paid read/access checks, then the agreed real evaluation sequentially. Count failures/rereads, stop on a failed prerequisite or result, and retain failures, limitations and observed/unknown usage. No automatic paid repair or replacement case.
7. Restore the agreed test state, verify final aliases/direct-URL access and compare the final candidate with A/B evidence. Obtain final integrated owner acceptance before whole-release archival. Never erase curated data to restore A's empty archive.

This is an execution checklist, not an authorized import, Storage-policy mutation, grant entry or paid dispatch before real material and its concrete scope are reviewed.

## Result Record to Complete Later

| Field | Required entry |
| --- | --- |
| Candidate | Commit, exact deployment ID/URL, switches, archive inspection time and manifest/grant state |
| Case | B ID, frozen question, input file/hash, actual UUID mapping or explicit negative expectation |
| Independent review | Reviewer/date, source passages/locators, expected result and support/uncertainty judgment |
| Dispatch | Time, outcome/error, stage/call/token observations, elapsed time and unknown usage/cost |
| Assessment | Passed/failed/not run, reason, discrepancies and any remaining limitation |
| Closure | Final configuration/access/rollback checks, changed evidence and final owner decision |

Keep credential-free shared summaries in release verification. Raw permitted material and detailed evaluation artifacts belong in an owner-approved local location; ignored `evaluation-results/` is available for task artifacts. Never store credentials, image base64 or real material in tracked result prose.
