import { codePoints, exact, validReference, type AnswerReference } from "@/lib/answers/contracts";
import { FIELD_LABELS } from "@/lib/answers/labels";
import { REGIONS, REASONS, VISION_NOTICES, type Assistant, type Block, type Comparison, type GeneratedAnswer, type ImageRequest, type Observation, type VerificationTask } from "./types";
import { comparisonContradicts, fail, list, parseObservation, parseObservationBody, prose, same, sha, uuid } from "./validation";

export const NOTICE_COPY = {
  no_retrieval: "本次未检索数据库。",
  no_matches: "数据库未找到匹配记录，以下内容不代表数据库结论。",
  record_only: "部分依据仅为数据库记录，尚无对应字段的外部来源确认。",
  candidate_limit: "检索候选已达上限，结果不代表完整档案。",
  uncertain_records: "引用记录存在待核验或归属不确定的信息，请结合来源核实。",
  image_interpretation: "图片观察可能有误，细节与作品对应关系请结合档案依据核实。",
  prior_observations: "沿用此前图片观察，本次未重新读取这些图片。",
  reference_compared: "本次已对所选图片与获准的档案参考图进行定向核对。",
  reference_limited: "参考图不足、权限限制或核对范围有限，部分对应关系仍待确认。",
} as const;
export const REREAD_QUESTION = "需要重新读取相关图片才能继续判断，请点击“重看图片并回答”。";
export function availableObservations(request: ImageRequest, current: Observation[]) {
  return [...request.observations.filter((o) => !current.some((c) => c.imageId === o.imageId)), ...current];
}
function parseBlocks(value: unknown, pool: Observation[], current: Observation[]): Block[] {
  if (!Array.isArray(value) || !value.length || value.length > 8) return fail();
  let length = 0;
  for (const b of value) {
    if (!exact(b, ["kind", "text", "evidenceKeys", "observationIds"]) || !["visual", "archive", "general"].includes(String(b.kind)) || !prose(b.text, 2000) || /https?:\/\/|www\./i.test(b.text) || /\[(?:图片\s*\d+|[ER]\d+)\]/u.test(b.text) || !list(b.evidenceKeys, 8) || !list(b.observationIds, 4)) return fail();
    const blockText = b.text;
    if (Object.values(NOTICE_COPY).some((notice) => blockText.includes(notice))) return fail();
    length += codePoints(b.text);
    if (b.evidenceKeys.some((k) => !/^E[1-9]\d*$/.test(k)) || b.observationIds.some((k) => !pool.some((o) => o.id === k))) return fail();
    if (b.kind === "visual") {
      if (b.evidenceKeys.length || !b.observationIds.length) return fail();
      const count = b.observationIds.filter((k) => current.some((o) => o.id === k)).length;
      if (count && count !== b.observationIds.length) return fail();
    } else if (b.observationIds.length || (b.kind === "archive" ? !b.evidenceKeys.length : b.evidenceKeys.length)) return fail();
  }
  if (length > 2000) return fail();
  return value as Block[];
}
export function parseComparison(value: unknown, references: AnswerReference[]): Comparison {
  if (!exact(value, ["taskId", "assessment", "proofs", "contradictions"]) || !/^V[1-4]$/.test(String(value.taskId)) || !["same_work", "different_work", "uncertain"].includes(String(value.assessment)) || !Array.isArray(value.proofs) || value.proofs.length > 3 || !Array.isArray(value.contradictions) || value.contradictions.length > 3 || !value.contradictions.every((c) => prose(c, 80)) || new Set(value.contradictions).size !== value.contradictions.length) return fail();
  const seen = new Set<string>();
  for (const p of value.proofs) {
    if (!exact(p, ["evidenceKey", "quote", "kind", "finding", "visitorRegion", "referenceRegion"]) || !prose(p.quote, 60) || codePoints(p.quote) < 4 || !["composition", "local_detail", "inscription", "condition"].includes(String(p.kind)) || !["match", "mismatch"].includes(String(p.finding)) || !REGIONS.includes(p.visitorRegion as never) || !REGIONS.includes(p.referenceRegion as never)) return fail();
    const fact = references.find((r) => r.key === p.evidenceKey);
    if (!fact || typeof fact.value !== "string" || !fact.value.includes(p.quote)) return fail();
    const key = JSON.stringify([p.evidenceKey, p.quote, p.kind, p.visitorRegion, p.referenceRegion]);
    if (seen.has(key)) return fail();
    seen.add(key);
  }
  return value as Comparison;
}
export function parseGenerated(value: unknown, request: ImageRequest, current: Observation[], references: AnswerReference[], tasks: VerificationTask[]): GeneratedAnswer {
  if (!exact(value, ["blocks", "comparisons", "observationUpdates"]) || !Array.isArray(value.comparisons) || value.comparisons.length !== tasks.length || !Array.isArray(value.observationUpdates) || value.observationUpdates.length > 4) return fail();
  const blocks = parseBlocks(value.blocks, availableObservations(request, current), current);
  if (blocks.flatMap((b) => b.evidenceKeys).some((k) => !references.some((r) => r.key === k))) return fail();
  const comparisons = value.comparisons.map((c, n) => {
    const comparison = parseComparison(c, references);
    if (comparison.taskId !== tasks[n].id || comparison.proofs.some((p) => { const fact = references.find((r) => r.key === p.evidenceKey)!; return fact.owner.table !== "artworks" || fact.owner.id !== tasks[n].artworkId; })) return fail();
    return comparison;
  });
  const updates = value.observationUpdates.map((o) => parseObservationBody(o));
  if (new Set(updates.map((o) => o.imageId)).size !== updates.length || updates.some((o) => !tasks.some((t) => t.visitorImageId === o.imageId) || !o.limitations.length)) return fail();
  return { blocks, comparisons, observationUpdates: updates };
}

export function canonicalImage(message: Assistant, request: ImageRequest) {
  const indices = (ids: string[]) => [...ids].sort((a, b) => request.images.find((i) => i.id === a)!.displayIndex - request.images.find((i) => i.id === b)!.displayIndex).map((i) => request.images.find((d) => d.id === i)!.displayIndex);
  const markers = (keys: string[]) => [...keys].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))).map((k) => `[${k}]`).join("");
  if (message.kind === "clarification") return message.question.trim() + (message.reread ? `\n重新查看：${indices(message.reread.imageIds).map((i) => `[图片${i}]`).join("")}` : "");
  const pool = availableObservations(request, message.observations);
  const parts = message.blocks.map((b) => {
    const prefix = b.kind === "archive" ? "数据库依据：" : b.kind === "general" ? "通用知识补充：" : b.observationIds.every((i) => message.observations.some((o) => o.id === i)) ? "图片观察与解读：" : "此前图片观察：";
    return prefix + b.text.trim() + (b.kind === "visual" ? indices([...new Set(b.observationIds.map((i) => pool.find((o) => o.id === i)!.imageId))]).map((n) => `[图片${n}]`).join("") : markers(b.evidenceKeys));
  });
  for (const g of message.groups) {
    const status = g.identity;
    if (status.status === "not_requested") continue;
    const all = indices(g.imageIds).join(",");
    if (status.status === "identified") parts.push(`档案对应：图片 ${indices(status.supportingImageIds).join(",")} → ${g.candidates.find((c) => c.artworkId === status.artworkId)!.label}（${status.method === "identifier" ? "编号核对" : "图像与档案特征核对"}）。${markers(status.evidenceKeys)}${markers(status.referenceKeys)}`);
    else if (status.status === "candidates") parts.push(`待核对候选：图片 ${all} → ${g.candidates.map((c) => c.label).join("、")}。尚未确认具体对应。`);
    else if (status.status === "no_match") parts.push(`档案检索：图片 ${all}未找到匹配作品记录。`);
    else parts.push(`档案对应：图片 ${all}的依据不足，暂无法确认。`);
  }
  parts.push(...message.references.map((r) => `记录索引：[${r.key}] ${r.label} / ${FIELD_LABELS[r.field]}`));
  parts.push(...message.referenceImages.map((r) => `对照图索引：[${r.key}] ${message.groups.flatMap((g) => g.candidates).find((c) => c.artworkId === r.artworkId)!.label} / 档案参考图`));
  return [parts.join("\n\n"), ...message.notices.map((n) => NOTICE_COPY[n])].join("\n").trim();
}

export function parseAssistantV2(value: unknown, request: ImageRequest): Assistant {
  if (!exact(value, ["id", "role", "text", "notices", "blocks", "references", "observations", "groups", "referenceImages", "comparisons", "kind", "reread", ...(typeof value === "object" && value !== null && "kind" in value && value.kind === "clarification" ? ["question"] : [])]) || !uuid(value.id) || request.messages.some((m) => m.id === value.id) || value.role !== "assistant" || !prose(value.text, 3500) || !Array.isArray(value.notices)) return fail();
  const notices = value.notices;
  if (!same(notices, VISION_NOTICES.filter((n) => notices.includes(n))) || (notices.includes("no_retrieval") && notices.includes("no_matches"))) return fail();
  const m = value as Assistant;
  if (![m.blocks, m.references, m.observations, m.groups, m.referenceImages, m.comparisons].every(Array.isArray)) return fail();
  if (m.kind === "clarification") {
    if (!prose(m.question, 200) || m.notices.length || [m.blocks, m.references, m.observations, m.groups, m.referenceImages, m.comparisons].some((a) => a.length)) return fail();
    if (m.reread !== null && (!exact(m.reread, ["sourceTurnId", "sourceAssistantId", "imageIds"]) || m.reread.sourceTurnId !== request.turnId || m.reread.sourceAssistantId !== m.id || !list(m.reread.imageIds, 4) || !m.reread.imageIds.length || m.reread.imageIds.some((i) => !request.images.some((d) => d.id === i)))) return fail();
  } else {
    if (m.kind !== "answer" || m.reread !== null || m.observations.length !== request.inputs.length || m.groups.length > 4 || m.references.length > 64 || m.referenceImages.length > 4 || m.comparisons.length > 4) return fail();
    m.observations.forEach((o) => {
      parseObservation(o, "invalid_model_output");
      const descriptor = request.images.find((d) => d.id === o.imageId);
      if (!descriptor || !request.inputs.some((i) => i.imageId === o.imageId) || o.imageSha256 !== descriptor.sha256 || o.originTurnId !== request.turnId || o.originAssistantId !== m.id || o.supersedes !== (request.observations.find((old) => old.imageId === o.imageId)?.id ?? null)) return fail();
    });
    if (new Set(m.observations.map((o) => o.id)).size !== m.observations.length || new Set(m.observations.map((o) => o.imageId)).size !== m.observations.length || m.observations.some((o) => request.observations.some((old) => old.id === o.id))) return fail();
    parseBlocks(m.blocks, availableObservations(request, m.observations), m.observations);
    if (!m.references.every((r) => validReference(r) && (r.owner.table !== "images" || r.field !== "storage_locator")) || !same(m.references.map((r) => r.key), [...new Set(m.references.map((r) => r.key))].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))) return fail();
    for (const [n, g] of m.groups.entries()) {
      if (!exact(g, ["id", "imageIds", "searchStatus", "candidates", "candidateLimitReached", "identity"]) || g.id !== `G${n + 1}` || !list(g.imageIds, 4) || !g.imageIds.length || g.imageIds.some((i) => !request.images.some((d) => d.id === i)) || !["not_searched", "no_matches", "matched"].includes(g.searchStatus) || typeof g.candidateLimitReached !== "boolean" || !Array.isArray(g.candidates) || g.candidates.length > 5 || !g.candidates.every((c) => exact(c, ["artworkId", "label"]) && uuid(c.artworkId) && prose(c.label, 200)) || new Set(g.candidates.map((c) => c.artworkId)).size !== g.candidates.length) return fail();
      if (!same(g.imageIds, [...g.imageIds].sort((a, b) => request.images.find((i) => i.id === a)!.displayIndex - request.images.find((i) => i.id === b)!.displayIndex)) || (g.imageIds.length > 1 && !request.sameWorkSets.some((s) => g.imageIds.every((i) => s.includes(i)))) || (g.searchStatus !== "matched" && g.candidates.length) || (g.searchStatus === "not_searched" && g.candidateLimitReached)) return fail();
      const state = g.identity;
      if (state?.status === "identified") {
        if (m.observations.some((o) => g.imageIds.includes(o.imageId) && o.limitations.some((l) => l.affectsIdentity))) return fail();
        if (!exact(state, ["status", "method", "artworkId", "supportingImageIds", "evidenceKeys", "referenceKeys"]) || !["identifier", "reference"].includes(state.method) || !g.candidates.some((c) => c.artworkId === state.artworkId) || g.candidateLimitReached || !list(state.supportingImageIds, 4) || !state.supportingImageIds.length || state.supportingImageIds.some((i) => !g.imageIds.includes(i) || !request.inputs.some((s) => s.imageId === i)) || !list(state.evidenceKeys, 3) || !list(state.referenceKeys, 1) || (state.method === "identifier" ? state.evidenceKeys.length !== 2 || state.referenceKeys.length !== 0 : state.evidenceKeys.length < 1 || state.referenceKeys.length !== 1 || state.supportingImageIds.length !== 1)) return fail();
        if (g.searchStatus !== "matched" || state.evidenceKeys.some((k) => !m.references.some((r) => r.key === k && r.owner.table === "artworks" && r.owner.id === state.artworkId && r.reviewStatus === "verified" && r.sources.some((s) => s.supportedField === r.field)))) return fail();
      } else if (state?.status === "candidates" || state?.status === "insufficient_evidence") {
        if (!exact(state, ["status", "reasons"]) || !Array.isArray(state.reasons) || !state.reasons.length || !same(state.reasons, REASONS.filter((r) => state.reasons.includes(r))) || (state.status === "candidates" && !g.candidates.length)) return fail();
      } else if (!exact(state, ["status"]) || !["not_requested", "no_match"].includes(state.status) || (state.status === "no_match" && (g.searchStatus !== "no_matches" || g.candidates.length))) return fail();
    }
    const grouped = m.groups.flatMap((g) => g.imageIds);
    if (grouped.length > 4 || new Set(grouped).size !== grouped.length || request.inputs.some((i) => !grouped.includes(i.imageId))) return fail();
    for (const [n, r] of m.referenceImages.entries()) if (!exact(r, ["key", "imageId", "artworkId", "contentSha256"]) || r.key !== `R${n + 1}` || !uuid(r.imageId) || !uuid(r.artworkId) || !sha(r.contentSha256)) return fail();
    if (new Set(m.referenceImages.map((r) => r.imageId)).size !== m.referenceImages.length) return fail();
    for (const [n, c] of m.comparisons.entries()) {
      if (!exact(c, ["taskId", "assessment", "proofs", "contradictions", "groupId", "artworkId", "referenceKey", "visitorImageId"])) return fail();
      const { taskId, assessment, proofs, contradictions } = c;
      parseComparison({ taskId, assessment, proofs, contradictions }, m.references);
      const group = m.groups.find((g) => g.id === c.groupId);
      if (c.taskId !== `V${n + 1}` || !group || !group.candidates.some((a) => a.artworkId === c.artworkId) || !group.imageIds.includes(c.visitorImageId) || !request.inputs.some((i) => i.imageId === c.visitorImageId) || !m.referenceImages.some((r) => r.key === c.referenceKey && r.artworkId === c.artworkId) || c.proofs.some((p) => !m.references.some((r) => r.key === p.evidenceKey && r.owner.table === "artworks" && r.owner.id === c.artworkId))) return fail();
      if (c.visitorImageId !== group.imageIds.find((i) => request.inputs.some((input) => input.imageId === i))) return fail();
    }
    if (m.referenceImages.some((r) => !m.comparisons.some((c) => c.referenceKey === r.key)) || m.observations.some((o) => o.pass === "verification" && !m.comparisons.some((c) => c.visitorImageId === o.imageId))) return fail();
    for (const g of m.groups) if (g.identity.status === "identified") {
      const identity = g.identity;
      if (m.comparisons.some((c) => c.groupId === g.id && c.artworkId === identity.artworkId && comparisonContradicts(c))) return fail();
      if (identity.method === "reference" && !m.comparisons.some((c) => c.groupId === g.id && c.artworkId === identity.artworkId && c.referenceKey === identity.referenceKeys[0] && c.visitorImageId === identity.supportingImageIds[0] && c.assessment === "same_work")) return fail();
    }
    const used = new Set([...m.blocks.flatMap((b) => b.evidenceKeys), ...m.comparisons.flatMap((c) => c.proofs.map((p) => p.evidenceKey)), ...m.groups.flatMap((g) => g.identity.status === "identified" ? g.identity.evidenceKeys : [])]);
    if (used.size !== m.references.length || m.references.some((r) => !used.has(r.key))) return fail();
    const historical = m.blocks.some((b) => b.observationIds.some((id) => !m.observations.some((o) => o.id === id)));
    const limited = m.groups.some((g) => (g.identity.status === "candidates" || g.identity.status === "insufficient_evidence") && g.identity.reasons.some((r) => ["references_missing", "reference_not_authorized", "reference_limit"].includes(r)));
    if (m.notices.includes("image_interpretation") !== !!m.observations.length || m.notices.includes("prior_observations") !== historical || m.notices.includes("reference_compared") !== !!m.comparisons.length || m.notices.includes("reference_limited") !== limited || (m.notices.includes("no_retrieval") && (m.references.length || m.groups.some((g) => g.searchStatus !== "not_searched"))) || (m.notices.includes("no_matches") && (m.references.length || m.groups.some((g) => g.searchStatus === "matched")))) return fail();
  }
  if (canonicalImage(m, request) !== m.text) return fail();
  return m;
}
