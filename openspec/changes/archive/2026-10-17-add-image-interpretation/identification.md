# Archive Identity Evidence Matrix

## Scope and Authority

This is the final task-1.3 identity policy for the [contracts](contracts.md). The server owns identity status; a model supplies observations/comparisons, not an authoritative match badge. All current records remain eligible for retrieval. Stronger gates for an identified result do not exclude pending/disputed records from candidates or ordinary grounded answers. Correspondence to an archive record does not establish physical genuineness or certain authorship.

A group's candidate pool is the actual artwork roots of its bound artwork queries, in query/candidate order. Artist neighbors do not enter the identity pool. Deduplicate by UUID; show at most five. Any source query cap or union above five sets candidateLimitReached. No model-added UUID, historical identity, visitor assertion or reference URL enters this pool. Evidence from another group's query cannot establish this group's identity.

## Route Selection and Outcomes

Evaluate the readable-identifier gate first, separately for each identify group. A passing group requires no reference reads. If it fails with real candidates, consider the reference route only when current selected visitor bytes exist. A request needing a new identity with summary-only context ends as a reread clarification before database/reference reads; historical record discussion may still use fresh textual retrieval without asserting a new identity.

| Condition | Server result |
| --- | --- |
| Group task is interpret/compare, with no explicit identity request | not_requested; ordinary facts/observations remain available |
| Identify requested but no usable query clue | insufficient_evidence with no_clue; do not claim a search |
| Valid bound artwork query completes with zero roots | no_match; do not claim the work does not exist |
| Candidates exist but neither positive gate passes | candidates with applicable ordered reasons |
| Any retrieval fails or same-identity evidence drifts | fail whole attempt with accepted retrieval/evidence code |
| Required authorized reference read/preparation fails | fail whole attempt under reference-access.md; no partial answer |
| A positive gate passes | identified for the evidence-supported visitor image IDs only |

CandidateLimitReached blocks a definitive identity for that group. Caps on unrelated groups do not invalidate a separately complete identifier match. The first passing positive route wins; do not fetch optional references to re-prove an identifier match. If verification was already issued before a corrected observation satisfies the identifier route, its target-specific different_work assessment, contradiction or mismatch still prevents confirmation. A route change cannot discard an issued contrary comparison. Within reference verification, exactly one candidate may pass; competing positives, unresolved alternatives or material contradictions remain candidates with identity_conflict/visual_uncertain/reference_limit as applicable.

## A. Readable Collection and Accession

All conditions are required:

1. Current selected bytes were actually inspected. One selected image in the group contains both a collection reading and an accession reading with certainty=clear. Repeated readings at different regions count as one value per kind only when equal under the normalization in condition 3; preserve their original text/regions. Distinct clear values remain conflicts. Both kinds are grounded in that picture, not pasted from a record or inferred from a visitor's typed claim. The model may read a museum label photographed with the work; this establishes correspondence to the documented label/work context, not authenticity.
2. A bound artwork search includes both collection and accession filters with mode=exact and values matching those readings. Query normalization still enforces all accepted limits. Exactly one root is returned, without a cap, and the group's candidate pool is also uncapped.
3. Both actual record values are nonblank and equal the readings after `trim -> Unicode NFC -> ASCII A–Z lowercase`. A null, empty or whitespace-only value cannot satisfy this route. Do not remove punctuation/leading zeroes, transliterate, translate institution names or collapse internal whitespace. If PostgreSQL matching returns a row that fails this stricter comparison, it remains a candidate.
4. The artwork review_status is verified. Each of collection_name/accession_number has a fresh catalogue key and at least one actual field-scoped source relationship with supported_field equal to that exact column. Unscoped sources, links to other owners and history citations do not count.
5. There is no explicit current identity contradiction: another clearly read identifier in the group pointing elsewhere, a structured limitation with affectsIdentity=true, or competing source/record identity information. Every limitation has exact `{text,affectsIdentity}` fields; incompatible source/label/work evidence must set the flag, rather than rely on the server to interpret free prose. Uncertain/unreadable other views do not prove identity, and the result's supportingImageIds is only the picture carrying the clear pair. Attribution uncertainty alone does not disprove record correspondence; preserve it in notices/claims.

The server returns method=identifier, the actual root UUID, exactly the two supporting E keys and no R keys. If several pictures independently supply the same clear pair, include those IDs in display order. Never identify other group pictures merely because the visitor placed them in the same group. Missing/denied reference permissions do not affect this independent route.

Failure reasons: source_support_missing for absent scoped source support, identifier_unclear for missing/tentative readings or missing record identifiers, identifier_mismatch for disagreement between nonblank values, record_unverified for a nonverified record, identity_conflict for contradictions, candidate_limit for incomplete coverage. Missing record identifiers alone do not imply identifier_mismatch or identity_conflict. These reasons limit confidence; they do not hide candidate records.

## B. Ordinary Unnumbered Photograph

The successful ordinary-photo route is required for this increment's eventual real acceptance. It is not satisfied by only returning a plausible title or by passing route A.

### Required Reference and Record Evidence

- The candidate artwork is verified and belongs to the group's uncapped root pool.
- Collection/accession metadata may be absent (null, empty or whitespace-only). Absence blocks route A but is not contrary evidence against this route. A nonblank record value conflicting with a clear reading still blocks confirmation, as do distinct clear visitor values of the same identifier kind even if the record has no value.
- At least one actual image row for that artwork is verified, passes the current operator grant/content checks in [reference access](reference-access.md), and is actually supplied in the second call.
- The visitor representative is selected in this attempt and actually supplied beside that reference. A cached summary or visitor-provided reference URL cannot substitute.
- Supporting record fields are strings in this allowlist: subject_details, iconography_notes, description, provenance_notes. Their catalogue facts belong to the same artwork and have actual matching field-scoped sources. Title, deity name, style, material, review status and general dimensions alone are not distinctive feature proof.

### Positive and Negative Feature Rules

FeatureProof additionally has a required `finding: "match" | "mismatch"` field. A qualifying positive comparison requires assessment=same_work, contradictions=[], no mismatch proof, and 2–3 valid match proofs:

- At least two different feature kinds from composition/local_detail/inscription/condition.
- At least one local_detail, inscription or condition proof with both visitor/reference regions other than whole.
- Each quote is an exact 4–60-code-point substring of its E-key field value, and that field has scoped source support. For two quotes from the same field, their first occurrences must not overlap; duplicating/rephrasing one span does not establish two features. Different field keys may still be semantically redundant; that fails real quality review.
- The final current observations for the whole group have no affectsIdentity=true limitation or clearly read collection/accession conflicting with this target record. Matching visual proofs cannot override those conflicts. A contradiction/mismatch in another issued comparison for the same target also blocks confirmation even when that comparison is uncertain or its negative proof is insufficient. Tentative first-pass reading cannot be silently made clear by copying archive text. A second-pass correction must come from actual pixels, be explicit in observationUpdates/limitations, and preserve stage provenance. Recheck final observations after updates, so a genuinely corrected conflict can pass; aggregate reasons concerning a different candidate do not by themselves veto the target.

For a competing candidate to be ruled out, its issued comparison must have assessment=different_work, at least one valid mismatch proof of kind local_detail/inscription/condition with non-whole regions, and a nonempty contradiction. A bare assessment, unmatched generic style or missing reference does not rule out a competitor. assessment=uncertain never rules out a competitor.

One target candidate must have a qualifying positive and every other candidate in the complete group pool must have a qualifying negative. Any unexamined plausible alternative, denied/missing reference, reference/task cap, unverified competing artwork, contradictory positive/negative on one candidate or second positive blocks uniqueness. With at most four verification tasks, larger/ambiguous pools naturally remain candidates; no hidden extra comparisons are permitted.

A passing result uses method=reference, the target UUID, the 1–3 distinct E keys used by the qualifying comparison's 2–3 proofs and its one R key. supportingImageIds contains that task's representative only. Other group views remain explicitly unconfirmed unless they independently satisfy a route; no group-wide physical-identity assertion is inferred.

### Fixed Task Allocation

Eligible reference rows come from the actual candidate graph; rights/version checks precede selection. Within a candidate, order primary first, then image UUID. Candidates retain actual query/root order. Build queues per group: first eligible reference for each candidate in candidate order, followed by a second reference per candidate if available. Allocate one task per group per round in group order until four tasks total; never more than two distinct references per artwork across the attempt. Each task uses that group's first selected visitor image as representative.

When the same reference image serves several groups, download it once and reuse its R key, but each pair still consumes one of the four tasks. Assign R1–R4 by first-use order and V1–V4 by task order. Record missing/denied/capped candidates before the model call so the model cannot claim they were inspected. If no legal task exists, answer from observations/candidates without a verification call; the second call stays text-only and no definitive reference identity is possible.

## What Mechanical Validation Does Not Prove

The server checks current-byte presence, identifiers, query/root membership, field values, source-link scope, permissions/content digest, reference/task IDs, quote spans and the required evidence pattern. It cannot prove OCR accuracy, that a source really supports a field, or that two visual details establish correspondence. These are mandatory semantic acceptance judgments, not implied by JSON validity or a count of matching keys. Numeric confidence is neither generated nor used as a gate.

The [acceptance cases](acceptance.md) require a permitted numbered positive, an ordinary unnumbered positive with a changed crop/view, and a visually similar different-work negative. A false definite match, cross-image assignment, invented source, unsupported field quote or silent uncertainty promotion fails that case. The owner/domain reviewer supplies expected links when real samples exist; an empty archive does not count as a successful identity evaluation.
