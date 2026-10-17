## ADDED Requirements

### Requirement: Fixed versioned image contracts

The system SHALL implement the exact fields, variants, bounds, provenance and canonical formats in [contracts](../../contracts.md). Version-2 bodies or explicitly opted-in minimal text requests SHALL be required. Both ends SHALL reject incompatible data before publication; unknown request versions SHALL fail before paid work.

#### Scenario: Reject stale clients without spending

- **WHEN** an unversioned request lacks X-Chat-Protocol: 2, contains legacy inline images or supplies a mismatched version/header
- **THEN** the endpoint returns invalid_request before provider access
- **AND** updated clients accept only fully validated version-2 success data; deliberate reload clears the old page-local state.

#### Scenario: Preserve explicitly opted-in text calls

- **WHEN** a valid minimal text request opts in with X-Chat-Protocol: 2 or an image-free version-2 request is submitted
- **THEN** it uses the accepted text orchestration limits and the new strict success format with empty visual arrays
- **AND** neither compatibility path bypasses canonical/reference validation.

### Requirement: Bounded selected-image understanding

The system SHALL interpret selected JPEG/PNG inputs only with valid enabled server vision settings. Limits SHALL be four new attachments per message, four distinct active visitor images including selected history, and twenty retained prepared attachments per page, with existing byte/pixel guards. Shared attachment identities SHALL count once. Visitor images/observations SHALL remain page-local with transient processing and no intentional persistence.

#### Scenario: Enforce combined current and historical input limits

- **WHEN** three new pictures and two historical pictures are selected for one attempt
- **THEN** preflight rejects the five-picture active set with corrective feedback before dispatch or paid work
- **AND** the complete draft/selection remains available until the visitor adjusts it.

#### Scenario: Enforce page retention independently

- **WHEN** a new selection would exceed twenty retained prepared attachment identities across drafts, completed/failed previews and shared snapshots
- **THEN** the new batch is rejected atomically with the deliberate-refresh/full-clear explanation
- **AND** existing state remains intact; repeated references to the same retained identity consume no additional slot.

#### Scenario: Keep capability feedback separate from invalid input

- **WHEN** selected image inputs pass validation but vision configuration is missing, invalid or off
- **THEN** image_understanding_unavailable is returned without provider calls
- **AND** corrupt bytes, invalid references and count/byte overflow retain their own corrective outcomes.

### Requirement: On-demand historical-image context

The system SHALL preserve eligible text/references and prior observations while sending only selected visitor bytes. Ordinary follow-ups SHALL not claim fresh inspection. When new detail is needed, an unambiguous target SHALL offer one-click reread of the original question/pictures without replacing a newer draft. Retry selections SHALL remain immutable; failed/unavailable turns SHALL stay outside new context.

#### Scenario: Ask an ordinary follow-up

- **WHEN** a text follow-up can be answered from a completed turn's existing observations and fresh archive evidence
- **THEN** no historical image bytes are sent to the application/provider for that turn by default
- **AND** any reused visual observations are labelled as prior observations, not a new reading.

#### Scenario: Ask about new detail in a historical picture

- **WHEN** a question requires visual detail unavailable in prior observations and the relevant picture is not selected
- **THEN** the assistant offers one-click reread with the original question and validated target references, or selection/clarification when ambiguous
- **AND** the clarification visibly lists only its captured target pictures with page-stable labels and links to their original pictures before activation
- **AND** no request starts before the explicit click; clicking starts one new attempt/POST with its own at-most-two-call allowance, never a hidden resend or a third call in the settled attempt.

#### Scenario: Select history explicitly

- **WHEN** a visitor chooses a completed historical picture for the current question
- **THEN** its original attachment identity and page-local bytes are included once in the active set and visibly removable from the composer selection
- **AND** unselected history retains metadata/text context without being silently represented as inspected.

### Requirement: Bounded analysis and targeted verification

The system SHALL use at most two provider calls and four bounded image-group queries, retaining two queries for ordinary text-only requests. Default answering SHALL use text observations/evidence after one visual analysis. Necessary identity verification MAY use scoped selected visitor pictures and authorized archive references in the second call, never unselected history or a third call. Plans, observations and group/query provenance SHALL be strictly validated before reads.

#### Scenario: Answer an image-only question

- **WHEN** up to four valid new pictures are submitted without text with vision enabled
- **THEN** the first call inspects them and plans useful retrieval, and default answering uses those observations plus fresh evidence as text
- **AND** ordinary interpretation does not repeat picture bytes; targeted identity verification follows its separate scoped budget.

#### Scenario: Preserve one-call clarification

- **WHEN** planning requires clarification or explicit selection of a missing picture
- **THEN** a validated short clarification ends the attempt without retrieval or answer generation
- **AND** no unseen image content or archive identity is invented.

#### Scenario: Enforce revised analysis limits

- **WHEN** selected-image analysis and either default answering or targeted verification are dispatched
- **THEN** analysis fits 64,000 text-envelope bytes, 3,000,000 complete UTF-8 payload bytes, 2,048 output tokens and 25 seconds; default answering fits a 128,000-byte text envelope, 1,536 tokens and 20 seconds; targeted verification uses 3,072 tokens/20 seconds and additionally fits 6,000,000 full bytes with at most four active visitor pictures and four prepared references
- **AND** shared 55-second request/65-second client deadlines and existing response/canonical caps remain enforced, without silent cropping or automatic paid retry.

### Requirement: Specific archive-work identification

The system SHALL distinguish identified archive works, candidates, no matches and insufficient evidence using [identification](../../identification.md). Identified associations SHALL require actual artwork-root provenance, verified rows and fresh field-scoped sources under the selected evidence gate. Similarity, model confidence or a lone candidate SHALL NOT suffice. Catalogue correspondence SHALL NOT certify physical genuineness.

#### Scenario: Identify a uniquely evidenced archive work

- **WHEN** the same selected picture clearly provides collection/accession readings, an exact query returns one uncapped verified artwork, and both fields have matching field-scoped sources without unresolved identity conflicts
- **THEN** the server can identify that actual artwork using exactly the two field keys, with zero reference reads
- **AND** normalization is trim/NFC/ASCII lowercase only; supportingImageIds contains only pictures independently carrying that clear pair, never other group views by implication.

#### Scenario: Preserve uncertain or conflicting identity

- **WHEN** identifying text is uncertain, records share the identifier pair, evidence conflicts, results are capped or only visual/title similarity is available
- **THEN** the response remains candidate-based or insufficient-evidence and explains the limitation
- **AND** it never converts a guessed image reading into an established identity by copying values from a retrieved record.

#### Scenario: Accept consistent repeated identifier readings

- **WHEN** different regions of the same selected picture repeat a clear collection or accession value equal under trim/NFC/ASCII lowercase and every other identifier-gate condition passes
- **THEN** repeated readings count as one value and permit identifier confirmation without reference reads
- **AND** their original text/regions remain in observations; distinct clear values remain conflicts rather than being merged.

#### Scenario: Distinguish missing record identifiers from conflicts

- **WHEN** a candidate's collection or accession field is null, empty or whitespace-only
- **THEN** it cannot pass the identifier route but may pass the independently complete reference route; missing metadata alone is incomplete evidence rather than a mismatch or identity conflict
- **AND** a clear reading disagreeing with a nonblank field or distinct clear visitor values of the same kind still blocks confirmation, including when another record field is missing.

#### Scenario: Distinguish missing and failed retrieval

- **WHEN** retrieval finds no matches versus failing or encountering changed evidence
- **THEN** no matches permits useful cautious interpretation without invented citations, while failure/evidence drift stops the entire attempt
- **AND** empty results do not prove that the artwork does not exist.

### Requirement: Image grouping and honest search coverage

The system SHALL distinguish pictures from works, require explicit visitor sameWorkSets hints for multi-picture groups, clarify ambiguous references and state per-group retrieval coverage within the global four-query ceiling. Grouping SHALL NOT establish physical identity. Candidates SHALL be actual bound artwork roots, never another group's results or artist neighbors; a pool above five SHALL mark incomplete coverage.

#### Scenario: Compare full and detail views

- **WHEN** a visitor supplies full/back/detail pictures of one work or pictures of different works
- **THEN** interpretation preserves the stated grouping and image-specific observations
- **AND** ambiguity about which work or picture is meant prompts clarification rather than definite unsupported grouping.

#### Scenario: Bind an explicit multi-picture group

- **WHEN** full/detail views are explicitly grouped by the visitor
- **THEN** the planner may use that grouping hint while retaining separate picture observations and the first selected picture as representative
- **AND** unsupported multi-picture groups fail validation; a grouped identity still names only the pictures supported by its evidence gate.

#### Scenario: Keep draft grouping consistent with selection

- **WHEN** historical and new pictures are mixed, or a member is removed and later selected again
- **THEN** new-picture labels follow the same new-only order as previews, and removal updates stored group membership and pending grouping choices
- **AND** singleton groups dissolve without automatic restoration on reselection; remaining multi-picture groups retain only their current members.

#### Scenario: Request identification of four independent works

- **WHEN** four independent works each provide a usable clue requiring their own archive query
- **THEN** one attempt can execute four validated bounded queries, without a forced extra user round
- **AND** all four groups retain their own query/result provenance, with at most five roots each and the shared evidence-payload cap unchanged.

### Requirement: Validated visual presentation and continuity

The system SHALL distinguish current/prior observations, archive evidence, general knowledge and validated identity states in Simplified Chinese. References SHALL follow the finalized strict schema and stable original image identities. Failed turns SHALL NOT shift labels. The shared responsive UI, draft/retry ownership and accurate third-party-processing copy SHALL be preserved without promising provider deletion.

#### Scenario: Reject invalid cross-image associations

- **WHEN** output references unknown/duplicate IDs, unsupported observations, an unsearched group's candidate or unsupported identity evidence
- **THEN** it is rejected before assistant publication without paid repair/fallback
- **AND** schema-valid but semantically unsupported claims remain quality-evaluation failures rather than proof of accuracy.

#### Scenario: Preserve labels and drafts across failure

- **WHEN** failed visible turns precede a successful picture question or a new draft is entered while an attempt is pending
- **THEN** source-image labels/jump targets still identify the correct original picture and completion never overwrites the newer draft
- **AND** scrolling, selection and references remain usable across the project's viewport/height baseline.

### Requirement: Independent image and identification verification

The system SHALL use isolated synthetic evidence/images and server-process fake upstreams for routine verification without paid APIs or seeded owner data. Curated bytes SHALL enter only the rights-gated bounded reference-verification branch and SHALL not be displayed as product assets. Real interpretation and specific-record identification acceptance SHALL require separately authorized representative real samples, expected results and domain review.

#### Scenario: Verify image traffic deterministically

- **WHEN** real-route browser tests exercise image interpretation and summary-only follow-ups
- **THEN** upstream assertions confirm default answering is text-only, targeted verification contains only scoped selected/authorized reference pictures, and unselected historical bytes never leave the page
- **AND** passing fixtures establish application behavior rather than real-model identification quality.

#### Scenario: Accept real identification with evidence

- **WHEN** real identification quality is evaluated
- **THEN** agreed image/record cases include positive identity, duplicate/conflicting identifiers, uncertain readings, cross-image errors and no matches, scored against expected evidence
- **AND** empty-data or mock success cannot substitute for these results; funded calls require separately bounded authorization.

### Requirement: Uncertainty-preserving observation revisions

The system SHALL keep visible facts, readings, interpretations and missing details separate in bounded per-image observations. Reuse SHALL preserve uncertainty. A successful reread SHALL replace that picture's current observation version without rewriting historical answers; failed/cancelled rereads SHALL keep the previous version. Summaries SHALL count toward the combined context budget and SHALL not establish fresh archive identity.

#### Scenario: Validate bounded observation provenance

- **WHEN** analysis produces facts/readings/interpretations/limitations for selected pictures
- **THEN** every selected picture has one strict observation body with at most 300 total text code points, server-assigned version/origin/hash and no archive proof
- **AND** historical observations resolve to their descriptor and adjacent originating message pair; their text shares the 16,000-point context cap and remains untrusted.

#### Scenario: Reuse a tentative deity interpretation

- **WHEN** a prior observation says a deity reading is tentative or an inscription is unreadable
- **THEN** a summary-only follow-up retains that qualification and cannot invent missing detail
- **AND** only an actual reread can supply a new observation version; semantic correctness remains separately evaluated.

#### Scenario: Preserve explicit identity limitations

- **WHEN** an observation reports an unresolved label/work, identifier, source or record identity contradiction
- **THEN** its bounded limitation has exact text and affectsIdentity=true fields, and either identity route remains unconfirmed for that group
- **AND** a missing flag or free-text limitation fails schema validation; visibility/crop limitations and attribution uncertainty alone use false and do not independently block confirmation.

#### Scenario: Reread while a newer draft exists

- **WHEN** the visitor explicitly clicks reread for an unambiguous historical target while a newer composer draft exists
- **THEN** one new attempt uses the stored question/context through its clarification and specified picture set under the attempt lock, preserving the new draft and original turn
- **AND** only full successful completion publishes a replacement observation; failure, cancellation or a late reply cannot overwrite the previous observation/draft; later unrelated turns cannot silently replace the captured question context.

### Requirement: Controlled archive reference verification

The system SHALL follow [reference access](../../reference-access.md) for at most four curated reference images/four comparison tasks. A compiled empty-by-default grant manifest SHALL pin the full row, permission and original content. Stateless existing-anon SDK downloads SHALL use the fixed configured project endpoint and bounded fetch. Metadata eligibility SHALL NOT grant byte use; arbitrary URLs, signing and stronger credential fallbacks SHALL be prohibited.

#### Scenario: Authorize and bound reference reads

- **WHEN** ordinary-photo verification needs candidate references and the relevant visitor bytes are explicitly selected and validated for this attempt
- **THEN** at most four references, two per artwork, pass explicit version-bound permission, fixed endpoint/object mapping, streamed-byte and actual JPEG/PNG validation
- **AND** each original fits 5,000,000 bytes/16,000,000 pixels/8192 side, all originals fit 20,000,000 bytes, prepared references fit 500,000 bytes/1600 side each, and the shared reference stage is at most five seconds within the request deadline.

#### Scenario: Allocate comparison pairs deterministically

- **WHEN** multiple groups/candidates have eligible references
- **THEN** group round-robin allocation uses first references before second references, primary/UUID order, at most four tasks/four distinct downloads and two distinct references per artwork
- **AND** shared references download once but each visitor/reference pair consumes a task; unexamined alternatives block uniqueness.

#### Scenario: Preserve missing permission and reference failures

- **WHEN** reference bytes are absent/unauthorized or an authorized read/preparation fails
- **THEN** absence/denial remains a visible evidence limitation, while attempted-read failures return a safe explicit reference failure
- **AND** neither condition is identity proof or a fabricated no-match; absence/denial limits the reference-dependent group, read failure stops the attempt, and an independent identifier match requiring no reference read retains its own gate.

#### Scenario: Identify an ordinary unnumbered work

- **WHEN** one verified candidate/reference has 2–3 source-supported matching features of at least two kinds, including a localized detail, inscription or condition, and every competing candidate has a qualifying localized mismatch
- **THEN** targeted verification may identify its actual artwork with its representative picture, one reference key and the deduplicated 1–3 field keys from those proofs
- **AND** numbered-positive, unnumbered-positive and visually-similar-different-work-negative cases are mandatory real identity acceptance cases; reference caps or unresolved plausible alternatives prevent a uniqueness claim.

#### Scenario: Reject generic or incomplete visual proof

- **WHEN** proof is only generic style/deity resemblance, repeats overlapping field quotes, lacks actual scoped source support or leaves another candidate unexamined/uncertain
- **THEN** identity remains candidate/insufficient evidence even if the model says same_work
- **AND** each qualifying quote is an exact 4–60-point allowed-field substring; mechanical proof validation does not establish semantic correctness.

#### Scenario: Recheck conflicts after targeted verification

- **WHEN** matching reference proofs coexist with a clearly read identifier or structured identity limitation conflicting with the target in any current group picture
- **THEN** identity remains a candidate with identity_conflict; a contradictory comparison for that same target also blocks confirmation
- **AND** only an explicit correction from actually supplied visitor pixels with a limitation explaining the change can resolve the conflict; both gates recheck final observations and do not treat a conflict against another candidate as an automatic veto of the target.
- **AND** a corrected clear identifier cannot bypass an already issued different_work assessment, contradiction or mismatch for that target; client response validation rejects the same contradictory confirmed result.

#### Scenario: Do not verify identity from a summary alone

- **WHEN** only historical observations/references are supplied and a new image confirmation is required
- **THEN** planning returns an explicit reread clarification without fetching curated reference bytes or making an answer/verification call
- **AND** stored IDs, summaries and old identity results cannot authorize reference access or establish a new image-to-record match.

#### Scenario: Revalidate references on a manual retry

- **WHEN** an eligible transient failure is manually retried with the original visitor selection/question snapshot
- **THEN** archive evidence and reference permission/version state are retrieved and checked afresh
- **AND** old signed URLs/reference bytes/identity decisions are not reused as authority, and all provider calls count toward the same funded batch allowance.
