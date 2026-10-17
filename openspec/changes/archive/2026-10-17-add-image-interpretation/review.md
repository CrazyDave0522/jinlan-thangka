# Final Documentation Review

Reviewed on 2026-10-17. The scope, strict contracts, identity evidence gates, reference access and acceptance cases were finalized before implementation approval. Current application results are recorded in [verification](verification.md). Task 1.3 is complete. This records the documentation review; the subsequently approved image implementation is now complete locally. Current remaining feature failures and the owner-deferred data work are recorded in [verification](verification.md); this design review itself authorizes no paid calls.

## Decisions and Consistency

- Preserve the owner's specific-work identification requirement, four new/four active/twenty retained visitor-image limits, selected history and bounded uncertainty-preserving observations. Do not return to candidate-only scope or automatic full-history byte retransmission.
- [Contracts](contracts.md) fix request/response v2, minimal-text protocol opt-in, observation versions, model variants, group/query provenance, stable first-submission picture labels, exact canonical text, Chinese interaction copy and corrective/transient outcomes. Unversioned stale requests fail before paid work.
- [Identification](identification.md) fixes both positive routes. The same-picture collection/accession route needs a unique uncapped verified artwork and two scoped field references. Ordinary-photo identity needs source-supported distinctive features, authorized current comparison bytes and qualifying negative coverage of every alternative. Grouping alone never certifies all pictures or authenticity.
- [Reference access](reference-access.md) fixes a compiled empty-by-default manifest, row/permission/content binding and bounded existing-anon SDK downloads from the configured project. Missing grants limit reference-dependent identity; attempted authorized read failures stop the whole answer. No signing, arbitrary URL, stronger credential fallback, visitor persistence or curated-image display is introduced.
- [Acceptance](acceptance.md) fixes thirty contract cases, responsive/lifecycle checks and a real semantic rubric. The proposed six-attempt/twelve-call pilot counts explicit reread as its own attempt and is not paid authorization.
- Default image analysis sees selected inputs and answering uses text. Targeted verification may use at most four scoped visitor inputs/four references/four comparison tasks in the second call. Image analysis uses 2,048 tokens/25s, default answer 1,536/20s and targeted verification 3,072/20s, with separate 3 MB/6 MB full payload caps and one 55s deadline.
- A one-click reread creates one new user intent/POST, carrying the source question and captured context through its clarification. It preserves newer drafts and excludes later unrelated turns. A successful full attempt atomically replaces observations; failed/late work does not change them or old displayed answers.
- Pure text and summary follow-ups carry no unselected historical bytes. A new summary-only identity requires explicit reread before archive/reference access. The 12,900-point example is text-only; separately supplied observation text shares the 16,000-point limit.

The proposal, design, tasks, four capability deltas, readiness review, roadmap/project notes and downstream source/release drafts use these same boundaries. Current setup/storage/testing guides distinguish proposed behavior from shipped code. Requirement 5 is present in local main at fa44708; remote publication/deployment remains unverified. Current accepted specs and archived records remain unchanged until the normal implementation/archive workflow.

## Corrections in the Final Pass

Removed stale statements that exact contracts/access choices were still unspecified. Aligned verification token limits and duplicate-query policy. Qualified the upload spec's old no-Storage-call wording so it prohibits visitor uploads while allowing the independently gated archive reference reader. Added full modified failure/retry requirements, preserving all original scenarios. Fixed observation-boundary error classification and explicit grouping/canonical behavior rather than leaving them to an undefined later choice.

## Verification

- OpenSpec strict validation of all items: 8 passed, 0 failed.
- Local Markdown file/anchor targets checked across every changed/new document.
- All 14 modified requirements preserve their 51 original scenario names; additions are explicit.
- All 6 TypeScript documentation examples parse without syntax errors. This is not runtime or semantic type validation.
- git diff --check passes.

The initial documentation review did not run application checks. Subsequent npm/build/browser and fake-SDK results are recorded in [verification](verification.md); current model-contract/retrieval/semantic failures and deferred real-data acceptance are recorded there as well.

## Readiness and Remaining Inputs

No unresolved technical choice or owner-supplied information blocks deterministic implementation. The owner subsequently approved implementation on 2026-10-17 under the [OpenSpec workflow](../../../AGENTS.md); task 1.4 is closed. Real identification acceptance later requires permitted records/pictures, reviewed grants, actual configured object access, expected evidence and domain review. Separately funded quality/latency evaluation and deployment verification remain outstanding; fixture success cannot establish them.


The documentation-only review above preceded implementation. See [implementation verification](verification.md) for current code/test results; no funded real-image evaluation is implied.

## Subsequent Implementation Consistency Review

The owner requested fixes for three reproduced gaps: unresolved current identifier conflicts could be overridden by reference proofs, free-text identity limitations did not block identifier confirmation, and reread targets were absent from the visible clarification. The implementation now uses strict `{text,affectsIdentity}` limitations, rechecks both identity routes against final target-specific observations after explicit corrections, and shows stable target labels/jump links before reread activation. Contracts, evidence policy, acceptance cases and delta scenarios reflect those corrections. Permanent regression coverage includes blocked conflicts, successful explained corrections, other current group views, unrelated candidate conflicts and mobile/desktop target links. Updated execution results are recorded in verification.md; real-image/domain acceptance remains open.

The follow-up implementation review also closed a corrected-identifier bypass of issued contrary comparisons, an asynchronous mixed-image count race, restored stale group membership and inconsistent new-picture grouping labels. Obsolete client protocol helpers were removed and useful old tests migrated/consolidated into the v2 path. Actual browser flows cover corrected identifiers, concurrent real preparation and mixed selection/group removal across the core viewport matrix. The latest counts and isolation results are recorded in verification.md; no paid or deployment acceptance is implied.

The next review reproduced two false negatives: absent collection/accession metadata incorrectly vetoed independently qualified reference proof, and consistent repeated readings at different regions incorrectly failed the identifier gate. Record absence now limits only the identifier route and uses incomplete-evidence wording; nonblank mismatches and distinct clear visitor values still prevent confirmation. Repeated readings are compared as normalized distinct values without changing their original text/regions. Permanent regressions cover null/empty/whitespace metadata, actual conflicts beside missing fields, normalized-equal repeats, conflicting repeats, fallback without reference evidence and the Chinese explanation. See verification.md for renewed execution results; real acceptance remains open.

The owner subsequently withdrew the previous dataset and deferred curated-data work until after this feature. Dataset-specific reports, access artifacts and local snapshots are removed. The subsequent owner-authorized empty-archive stabilization corrected output guidance, required named lookup, evidence kinds, missing/conflicting wording and reread focus. [Verification](verification.md) and [runtime evaluation](empty-archive-evaluation.md) retain the intermediate failures and passing final eight-case real-provider round. Task 3.5 is complete for scoped stabilization; future curated-data/domain acceptance is explicitly deferred.
