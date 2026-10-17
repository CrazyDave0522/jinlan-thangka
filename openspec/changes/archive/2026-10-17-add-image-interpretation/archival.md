# Archive Readiness and Scope

The owner requested archival on 2026-10-17 if the current requirement met the project's archive conditions. This records the assessment and the scope of that archival; it does not assert a hands-on owner review, deployed acceptance or real-work recognition accuracy.

## Workflow Basis

The default [OpenSpec workflow](../../../AGENTS.md) describes archival after deployment. This project's [context](../../../project.md) and prior [retrieval archive](../2026-10-16-add-thangka-retrieval/verification.md) / [grounded-answer archive](../2026-10-16-add-grounded-answers/proposal.md) already record owner-requested archival of completed implementation before publication, merge or application deployment. The current owner request is handled at that same implementation-stage boundary. No global archive rule is changed and no deployment is inferred from moving the change.

## Conditions Checked

- Every implementation/refinement/verification task is complete, including the previously open task 3.5.
- Fresh `npm run check` passes: ESLint, TypeScript, 32 Vitest files / 356 tests. The unchanged runtime also has the recorded passing 70-case Chromium suite and ordinary production build; see [verification](verification.md).
- The [real-provider empty-archive evaluation](empty-archive-evaluation.md) retains intermediate failures, corrections, final eight-case passes and actual usage. It is independent of deterministic fixture success.
- Strict pre-archive OpenSpec validation passes for all eight active/spec items. All 14 modified requirements preserve their 51 pre-existing scenarios; the archive applied the new image-interpretation capability and all three modified capabilities without `--skip-specs` (+10 requirements, 14 modified, none removed).
- Curated-data preparation, real positive/negative identity examples, actual reference permissions and independent domain review were explicitly deferred by the owner. Their absence does not block this agreed implementation increment, and they are not marked passed.

## Carried Forward

Real Thangka/image-to-record accuracy, curated reference setup/access, deployed Vercel behavior/latency, publication/merge and final integrated demo acceptance remain unverified. The production reference manifest stays empty. Future work must use [the acceptance protocol](acceptance.md) and the owner's existing authorization and deferrals; it must not interpret archival as data-quality or deployment evidence.

This operation updates local OpenSpec history/current specifications and their links. It does not commit, push, merge, publish, mutate the database or alter the owner's environment settings.

## Completed Archive Checks

`openspec archive add-image-interpretation --yes` moved the change to `2026-10-17-add-image-interpretation`, created the formal image-interpretation specification and updated grounded-answers, image-upload and text-conversation. No requirement was removed and specification updates were not skipped. The new capability purpose was completed and promoted/inbound links were rebased to the archive.

Strict validation after promotion exposed nine overlong requirement leads. Their first sentences remain concise requirement statements; the remaining original normative sentences were moved verbatim into explicit contract-enforcement scenarios. An inverse-format/content audit confirmed all 34 resulting requirements match the expected promotion apart from link paths and this layout change, preserving the 51 original scenarios and every original constraint. Post-archive strict validation passes for all eight items (two active changes and six formal capabilities). The local file/anchor audit passes for 181 links; no live path to the former change directory remains. `git diff --check` passes.

The fresh 356-test check preceded this documentation-only archive; application code was unchanged by archival, so the previously passing browser suite, production build and real-model evaluation were not rerun or re-billed. The two remaining active changes are add-answer-sources and add-demo-release. Publication, merge, real-data/domain and deployment results retain the limitations above.
