import type { AnswerReference, AssistantMessage } from "./contracts";
import { FIELD_LABELS, NOTICE_TEXT, fieldValueLabel } from "./labels";
import type { Assistant, Block, GroupResult, ImageRequest, Observation, PublicComparison, Region } from "@/lib/vision/types";
import { NOTICE_COPY } from "@/lib/vision/output";

export type ImagePresentationContext = Pick<ImageRequest, "images" | "observations">;
export type DisplayAnswer = { text: string; structured?: AssistantMessage | Assistant; imageContext?: ImagePresentationContext;
  evidence?: string; generalKnowledge?: string; sourceLabel?: string };
export const REASON_COPY = {
  no_clue: "缺少可用的检索线索", record_unverified: "相关记录尚未核验", source_support_missing: "缺少对应字段的来源支持",
  identifier_unclear: "收藏机构或藏品编号的依据不完整", identifier_mismatch: "图片编号与记录不一致", identity_conflict: "对应依据存在冲突",
  candidate_limit: "候选范围尚不完整", references_missing: "缺少可核对的参考图", reference_not_authorized: "参考图尚无可用的处理许可",
  reference_limit: "本次参考图核对范围有限", visual_uncertain: "图片对应关系仍不确定", insufficient_features: "可确认的独特特征不足",
} as const;
export const REGION_COPY: Record<Region, string> = { whole: "全图", top_left: "左上", top_center: "上部中央", top_right: "右上",
  middle_left: "左侧", center: "中央", middle_right: "右侧", bottom_left: "左下", bottom_center: "下部中央", bottom_right: "右下" };
const KIND_COPY = { composition: "构图", local_detail: "局部细节", inscription: "题记", condition: "保存状况" };
const READING_COPY = { collection: "收藏机构", accession: "藏品编号", inscription: "题记", other: "其他文字" };
const CERTAINTY_COPY = { clear: "较清晰（模型观察）", tentative: "暂定", unreadable: "无法辨认" };
const TABLE_COPY = { artists: "艺术家记录", artworks: "作品记录", images: "图片记录", artwork_artists: "创作关系记录" };
export const isImageAnswer = (message: AssistantMessage | Assistant): message is Assistant => "observations" in message;
export const providedText = (value: string, fallback: string) => value.trim() ? value : fallback;
export function displayValue(field: string, value: AnswerReference["value"]) {
  return typeof value === "string" && !value.trim() ? "未记录" : fieldValueLabel(field, value);
}
export function pictureLabel(id: string, request: ImagePresentationContext) {
  return `图片 ${request.images.find((image) => image.id === id)!.displayIndex}`;
}
export function relevantObservations(message: Assistant, request: ImagePresentationContext) {
  const used = new Set(message.blocks.flatMap((block) => block.observationIds));
  const current = new Set(message.observations.map((o) => o.imageId));
  return [...request.observations.filter((o) => used.has(o.id) && !current.has(o.imageId)), ...message.observations];
}
export function observationLines(observation: Observation, current: boolean): string[] {
  return [current ? "本次图片观察" : "此前图片观察", observation.pass === "verification" ? current ? "经本次图像复核" : "经此前图像复核" : "图像分析",
    ...observation.facts.map((f) => `可见内容（${REGION_COPY[f.region]}）：${f.text}`),
    ...observation.readings.map((r) => `${READING_COPY[r.kind]}（${REGION_COPY[r.region]}；${CERTAINTY_COPY[r.certainty]}）：${r.text}`),
    ...observation.interpretations.map((i) => `解读（${CERTAINTY_COPY[i.certainty]}）：${i.text}`),
    ...observation.limitations.map((l) => `观察限制${l.affectsIdentity ? "（影响作品对应判断）" : ""}：${l.text}`)];
}
export function referenceLines(reference: AnswerReference): string[] {
  const owner = reference.owner;
  return [`[${reference.key}] ${reference.label} · ${FIELD_LABELS[reference.field]}`,
    `${TABLE_COPY[owner.table]}：${owner.table === "artwork_artists" ? `作品 ${owner.artworkId} / 艺术家 ${owner.artistId} / ${displayValue("role", owner.role)}` : owner.id}`,
    `${FIELD_LABELS[reference.field]}：${displayValue(reference.field, reference.value)}`,
    `核验状态：${reference.reviewStatus === null ? "未提供" : displayValue("review_status", reference.reviewStatus)}`,
    ...(reference.attributionStatus === null ? [] : [`归属状态：${displayValue("attribution_status", reference.attributionStatus)}`]),
    ...(reference.sources.length ? reference.sources.flatMap((source) => [
      `来源：${providedText(source.title, "未记录标题")}`,
      `来源记录：${source.sourceId} · 引用关系：${source.linkId}`,
      source.supportedField ? `支持字段：${FIELD_LABELS[source.supportedField]}` : "未限定支持字段",
      `引用位置：${providedText(source.locator, "未记录引用位置")}`,
    ]) : ["仅数据库记录，暂无字段来源。"])];
}
export function groupLines(group: GroupResult, request: ImagePresentationContext): string[] {
  const state = group.identity;
  return [`${group.imageIds.map((id) => pictureLabel(id, request)).join("、")} · ${group.searchStatus === "not_searched" ? "本次未检索档案" : group.searchStatus === "no_matches" ? "未找到匹配档案记录" : "已检索到相关档案记录"}`,
    ...(group.candidateLimitReached ? ["本组检索候选已达上限，结果不代表完整档案。"] : []),
    ...(state.status === "identified" ? [
      `档案对应：${group.candidates.find((c) => c.artworkId === state.artworkId)!.label}（${state.method === "identifier" ? "编号核对" : "图像与档案特征核对"}）。`,
      `实际支持图片：${state.supportingImageIds.map((id) => pictureLabel(id, request)).join("、")}${[...state.evidenceKeys, ...state.referenceKeys].map((key) => `[${key}]`).join("")}`,
    ] : state.status === "not_requested" ? ["本次未请求确认具体作品。"] : state.status === "no_match" ? ["未找到匹配作品记录。"] : [
      state.status === "candidates" ? "待核对候选，尚未确认具体对应。" : "依据不足，暂无法确认具体作品。",
      "reasons" in state ? state.reasons.map((reason) => REASON_COPY[reason]).join("；") : "",
    ]),
    ...group.candidates.map((c) => `候选档案：${c.label} · ${c.artworkId}`)];
}
export function comparisonLines(comparison: PublicComparison, message: Assistant, request: ImagePresentationContext): string[] {
  const group = message.groups.find((g) => g.id === comparison.groupId)!;
  const candidate = group.candidates.find((c) => c.artworkId === comparison.artworkId)!;
  return [`图片组（${group.imageIds.map((id) => pictureLabel(id, request)).join("、")}） · ${pictureLabel(comparison.visitorImageId, request)} · ${candidate.label} · ${candidate.artworkId} · [${comparison.referenceKey}]`,
    `图像核对判断：${{ same_work: "倾向同一作品", different_work: "倾向不同作品", uncertain: "无法确定" }[comparison.assessment]}（模型判断，以档案对应状态为准）`,
    ...comparison.proofs.map((p) => `${KIND_COPY[p.kind]} · ${p.finding === "match" ? "相符" : "不符"} · 访客图${REGION_COPY[p.visitorRegion]} / 参考图${REGION_COPY[p.referenceRegion]}：“${p.quote}” [${p.evidenceKey}]`),
    ...(!comparison.proofs.length ? ["未提供可用的特征依据。"] : []),
    ...comparison.contradictions.map((text) => `核对冲突：${text}`)];
}
export function referenceImageLines(message: Assistant, key: string) {
  const image = message.referenceImages.find((r) => r.key === key)!;
  const label = message.groups.flatMap((g) => g.candidates).find((c) => c.artworkId === image.artworkId)!.label;
  return [`[${key}] ${label} · 档案参考图核对`, `作品记录：${image.artworkId}`, `图片记录：${image.imageId}`, "已使用获准的档案参考图；参考图本身不证明作品对应或真伪。"];
}
export function blockTitle(block: Block, message: Assistant) {
  return block.kind === "archive" ? "数据库依据" : block.kind === "general" ? "通用知识补充" : block.observationIds.every((id) => message.observations.some((o) => o.id === id)) ? "图片观察与解读" : "此前图片观察";
}
export function exportAnswer(answer: DisplayAnswer): string {
  const message = answer.structured;
  const parts: string[] = [];
  if (!message) {
    if (answer.text.trim()) parts.push(answer.text);
  } else if (message.kind === "clarification") {
    parts.push(message.question);
    if (isImageAnswer(message) && message.reread && answer.imageContext) parts.push(`重新查看：${message.reread.imageIds.map((id) => pictureLabel(id, answer.imageContext!)).join("、")}`);
  } else {
    let lastTitle = "";
    const image = isImageAnswer(message) ? message : null;
    const request = answer.imageContext;
    const observations = image && request ? relevantObservations(image, request) : [];
    for (const block of message.blocks) {
      const title = image ? blockTitle(block as Block, image) : block.kind === "archive" ? "数据库依据" : "通用知识补充";
      if (title !== lastTitle) parts.push(title);
      lastTitle = title;
      const pictures = image && request ? [...new Set((block as Block).observationIds.map((id) => observations.find((o) => o.id === id)!.imageId))].map((id) => `[${pictureLabel(id, request)}]`).join("") : "";
      parts.push(`${block.text}${block.evidenceKeys.map((key) => `[${key}]`).join("")}${pictures}`);
    }
    if (image && request) {
      for (const observation of observations) parts.push([pictureLabel(observation.imageId, request), ...observationLines(observation, image.observations.some((o) => o.id === observation.id))].join("\n"));
      for (const group of image.groups) parts.push(groupLines(group, request).join("\n"));
    }
    if (message.references.length) parts.push("本条回答使用的依据", ...message.references.map((r) => referenceLines(r).join("\n")));
    if (image && request) for (const reference of image.referenceImages) {
      parts.push(referenceImageLines(image, reference.key).join("\n"));
      parts.push(...image.comparisons.filter((c) => c.referenceKey === reference.key).map((c) => comparisonLines(c, image, request).join("\n")));
    }
  }
  if (answer.evidence?.trim()) parts.push(`数据库依据\n${answer.evidence}`);
  if (answer.generalKnowledge?.trim()) parts.push(`通用知识补充\n${answer.generalKnowledge}`);
  if (message) parts.push(...message.notices.map((code) => isImageAnswer(message) ? NOTICE_COPY[code as keyof typeof NOTICE_COPY] : NOTICE_TEXT[code as keyof typeof NOTICE_TEXT]));
  return parts.filter(Boolean).join("\n\n").trim();
}
