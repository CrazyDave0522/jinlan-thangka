import "server-only";
import type { AnswerReference } from "@/lib/answers/contracts";
import type { Graph } from "@/lib/answers/catalogue";
import type { RetrievalResult } from "@/lib/retrieval/contracts";
import {
  REASONS,
  type Comparison,
  type FeatureProof,
  type Group,
  type GroupResult,
  type Identity,
  type Observation,
  type Plan,
  type Reason,
  type VerificationTask,
} from "./types";
import { comparisonContradicts, fail, prose } from "./validation";
import type { ArtworkRow } from "@/lib/retrieval/database";

export type SuccessResult = Exclude<RetrievalResult, { status: "error" }>;
export function limitedIdentity(
  group: GroupResult,
  reasons: Reason[],
): Identity {
  return {
    status: group.candidates.length ? "candidates" : "insufficient_evidence",
    reasons: REASONS.filter((r) => reasons.includes(r)).length
      ? REASONS.filter((r) => reasons.includes(r))
      : ["visual_uncertain"],
  };
}
export function buildGroups(
  plan: Extract<Plan, { action: "answer" }>,
  results: SuccessResult[],
  graph: Graph,
): GroupResult[] {
  return plan.groups.map((g) => {
    const allBound = results.filter((_, n) =>
      plan.queries[n].groupIds.includes(g.id),
    );
    const bound = results.filter(
      (_, n) =>
        plan.queries[n].groupIds.includes(g.id) &&
        plan.queries[n].query.entity === "artwork",
    );
    const ids = [
      ...new Set(
        bound.flatMap((r) =>
          r.candidates.filter((c) => c.entity === "artwork").map((c) => c.id),
        ),
      ),
    ];
    const candidateLimitReached =
      allBound.some((r) => r.candidateLimitReached) || ids.length > 5;
    const candidates = ids.slice(0, 5).map((artworkId) => {
      const artwork = graph.artworks.find((a) => a.id === artworkId);
      if (!artwork || !prose(artwork.title, 200))
        return fail("evidence_too_large");
      return { artworkId, label: artwork.title };
    });
    const result: GroupResult = {
      id: g.id,
      imageIds: g.imageIds,
      candidates,
      candidateLimitReached,
      searchStatus: !allBound.length
        ? "not_searched"
        : allBound.some((r) => r.candidates.length)
          ? "matched"
          : "no_matches",
      identity: { status: "not_requested" },
    };
    if (g.task === "identify")
      result.identity = !bound.length
        ? limitedIdentity(result, ["no_clue"])
        : !candidates.length
          ? { status: "no_match" }
          : limitedIdentity(
              result,
              candidateLimitReached
                ? ["candidate_limit"]
                : ["visual_uncertain"],
            );
    return result;
  });
}
const normalize = (v: string) =>
  v
    .trim()
    .normalize("NFC")
    .replace(/[A-Z]/g, (c) => c.toLowerCase());
const supported = (
  fact: AnswerReference | undefined,
): fact is AnswerReference =>
  !!fact && fact.sources.some((s) => s.supportedField === fact.field);
function clearReadingValues(
  observations: Observation[],
  kind: "collection" | "accession",
) {
  return [
    ...new Set(
      observations.flatMap((o) =>
        o.readings
          .filter((r) => r.kind === kind && r.certainty === "clear")
          .map((r) => normalize(r.text)),
      ),
    ),
  ];
}
function identityConflict(observations: Observation[], row: ArtworkRow) {
  if (observations.some((o) => o.limitations.some((l) => l.affectsIdentity)))
    return true;
  return ([
    ["collection", row.collection_name],
    ["accession", row.accession_number],
  ] as const).some(([kind, value]) => {
    const readings = clearReadingValues(observations, kind);
    const recorded = normalize(value ?? "");
    return (
      readings.length > 1 ||
      (!!recorded && readings.some((r) => r !== recorded))
    );
  });
}
export function identifyByNumber(
  group: Group,
  result: GroupResult,
  observations: Observation[],
  plan: Extract<Plan, { action: "answer" }>,
  results: SuccessResult[],
  graph: Graph,
  catalogue: AnswerReference[],
): Identity {
  if (group.task !== "identify" || result.identity.status === "no_match")
    return result.identity;
  const reasons: Reason[] = result.candidateLimitReached
    ? ["candidate_limit"]
    : [];
  const current = observations.filter((o) =>
    group.imageIds.includes(o.imageId),
  );
  for (const candidate of result.candidates) {
    const row = graph.artworks.find((a) => a.id === candidate.artworkId)!;
    const collection = catalogue.find(
      (f) =>
        f.owner.table === "artworks" &&
        f.owner.id === row.id &&
        f.field === "collection_name",
    );
    const accession = catalogue.find(
      (f) =>
        f.owner.table === "artworks" &&
        f.owner.id === row.id &&
        f.field === "accession_number",
    );
    const hasSources = supported(collection) && supported(accession);
    if (row.review_status !== "verified") reasons.push("record_unverified");
    if (!hasSources) reasons.push("source_support_missing");
    const images = current.filter((o) => {
      const c = clearReadingValues([o], "collection");
      const a = clearReadingValues([o], "accession");
      if (c.length !== 1 || a.length !== 1) {
        reasons.push("identifier_unclear");
        return false;
      }
      const recordedCollection = normalize(row.collection_name ?? "");
      const recordedAccession = normalize(row.accession_number ?? "");
      if (!recordedCollection || !recordedAccession) {
        reasons.push("identifier_unclear");
        return false;
      }
      if (c[0] !== recordedCollection || a[0] !== recordedAccession) {
        reasons.push("identifier_mismatch");
        return false;
      }
      return plan.queries.some(
        (q, n) =>
          q.groupIds.includes(group.id) &&
          q.query.kind === "search" &&
          q.query.entity === "artwork" &&
          q.query.filters.some(
            (f) =>
              f.field === "collection" &&
              f.mode === "exact" &&
              normalize(f.value) === c[0],
          ) &&
          q.query.filters.some(
            (f) =>
              f.field === "accession" &&
              f.mode === "exact" &&
              normalize(f.value) === a[0],
          ) &&
          !results[n].candidateLimitReached &&
          results[n].candidates.length === 1 &&
          results[n].candidates[0].id === row.id,
      );
    });
    const conflicting = identityConflict(current, row);
    if (conflicting) reasons.push("identity_conflict");
    if (
      images.length &&
      hasSources &&
      row.review_status === "verified" &&
      !result.candidateLimitReached &&
      result.candidates.length === 1 &&
      !conflicting
    )
      return {
        status: "identified",
        method: "identifier",
        artworkId: row.id,
        supportingImageIds: images.map((o) => o.imageId),
        evidenceKeys: [collection.key, accession.key].sort(
          (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
        ),
        referenceKeys: [],
      };
  }
  return limitedIdentity(
    result,
    reasons.length ? reasons : ["identifier_unclear"],
  );
}
const fields = [
  "subject_details",
  "iconography_notes",
  "description",
  "provenance_notes",
];
function feature(
  p: FeatureProof,
  artworkId: string,
  catalogue: AnswerReference[],
) {
  const fact = catalogue.find((f) => f.key === p.evidenceKey);
  return (
    !!fact &&
    fact.owner.table === "artworks" &&
    fact.owner.id === artworkId &&
    fields.includes(fact.field) &&
    supported(fact) &&
    typeof fact.value === "string" &&
    fact.value.includes(p.quote)
  );
}
const local = (p: FeatureProof) =>
  p.kind !== "composition" &&
  p.visitorRegion !== "whole" &&
  p.referenceRegion !== "whole";
export function positive(
  comparison: Comparison,
  artworkId: string,
  catalogue: AnswerReference[],
) {
  if (
    comparison.assessment !== "same_work" ||
    comparison.contradictions.length ||
    comparison.proofs.length < 2 ||
    comparison.proofs.length > 3 ||
    comparison.proofs.some(
      (p) => p.finding !== "match" || !feature(p, artworkId, catalogue),
    ) ||
    new Set(comparison.proofs.map((p) => p.kind)).size < 2 ||
    !comparison.proofs.some(local)
  )
    return false;
  for (const [n, p] of comparison.proofs.entries())
    for (const other of comparison.proofs.slice(n + 1)) {
      if (p.evidenceKey !== other.evidenceKey) continue;
      const value = catalogue.find((f) => f.key === p.evidenceKey)!
        .value as string;
      const a = value.indexOf(p.quote),
        b = value.indexOf(other.quote);
      if (a < b + other.quote.length && b < a + p.quote.length) return false;
    }
  return true;
}
export function negative(
  comparison: Comparison,
  artworkId: string,
  catalogue: AnswerReference[],
) {
  return (
    comparison.assessment === "different_work" &&
    comparison.contradictions.length > 0 &&
    comparison.proofs.some(
      (p) =>
        p.finding === "mismatch" &&
        local(p) &&
        feature(p, artworkId, catalogue),
    )
  );
}
export function identifyByReference(
  group: GroupResult,
  comparisons: Comparison[],
  tasks: VerificationTask[],
  catalogue: AnswerReference[],
  graph: Graph,
  reasons: Reason[],
  observations: Observation[],
): Identity {
  if (
    group.identity.status === "not_requested" ||
    group.identity.status === "no_match"
  )
    return group.identity;
  const own = tasks
    .map((t, n) => ({ task: t, comparison: comparisons[n] }))
    .filter((v) => v.task.groupId === group.id);
  if (group.identity.status === "identified") {
    const identity = group.identity;
    return own.some((v) => v.task.artworkId === identity.artworkId && comparisonContradicts(v.comparison))
      ? limitedIdentity(group, [...reasons, "identity_conflict"])
      : identity;
  }
  const positives = own.filter(
    (v) =>
      v.comparison &&
      positive(v.comparison, v.task.artworkId, catalogue) &&
      graph.artworks.find((a) => a.id === v.task.artworkId)?.review_status ===
        "verified",
  );
  const positiveIds = new Set(positives.map((v) => v.task.artworkId));
  const target = positives[0];
  const conflict =
    positiveIds.size > 1 ||
    !!(
      target &&
      identityConflict(
        observations.filter((o) => group.imageIds.includes(o.imageId)),
        graph.artworks.find((a) => a.id === target.task.artworkId)!,
      )
    ) ||
    [...positiveIds].some((artworkId) =>
      own.some(
        (v) =>
          v.task.artworkId === artworkId &&
          comparisonContradicts(v.comparison),
      ),
    );
  if (conflict) reasons.push("identity_conflict");
  if (group.candidateLimitReached) reasons.push("candidate_limit");
  const complete =
    target &&
    group.candidates.every(
      (c) =>
        c.artworkId === target.task.artworkId ||
        (graph.artworks.find((a) => a.id === c.artworkId)?.review_status ===
          "verified" &&
          own.some(
            (v) =>
              v.task.artworkId === c.artworkId &&
              negative(v.comparison, c.artworkId, catalogue),
          )),
    );
  if (target && complete && !conflict && !group.candidateLimitReached)
    return {
      status: "identified",
      method: "reference",
      artworkId: target.task.artworkId,
      supportingImageIds: [target.task.visitorImageId],
      evidenceKeys: [
        ...new Set(target.comparison.proofs.map((p) => p.evidenceKey)),
      ].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))),
      referenceKeys: [target.task.referenceKey],
    };
  if (!complete && own.length) reasons.push("visual_uncertain");
  if (!positives.length && own.length) reasons.push("insufficient_features");
  return limitedIdentity(group, [
    ...(group.identity.status === "candidates" ||
    group.identity.status === "insufficient_evidence"
      ? group.identity.reasons
      : []),
    ...reasons,
  ]);
}
