import { describe, expect, it } from "vitest";
import { canonical, jsonBytes, parseAssistant, type AnswerReference } from "./contracts";
import { canonicalImage, parseAssistantV2 } from "@/lib/vision/output";
import { exportAnswer, displayValue, referenceLines, groupLines } from "./presentation";
import { imageSourceAnswer, sourceAnswer, sourceId } from "../../../tests/fixtures/answer-sources";
import { successV2 } from "../../../tests/fixtures/vision";

function freeze(value: unknown) {
  if (value && typeof value === "object") { Object.freeze(value); Object.values(value).forEach(freeze); }
}
describe("single-answer presentation exports", () => {
  it("retains per-group caps and distinct same-label candidates even without requested identification", () => {
    const answer = imageSourceAnswer();
    const group = answer.structured.groups[0];
    group.identity = { status: "not_requested" };
    group.candidateLimitReached = true;
    group.candidates = [1, 2, 3, 4, 5].map((n) => ({ artworkId: sourceId(n), label: "同名合成作品" }));
    const output = groupLines(group, answer.imageContext).join("\n");
    expect(output).toContain("本组检索候选已达上限");
    expect(output).toContain("本次未请求确认具体作品");
    for (const candidate of group.candidates) expect(output).toContain(candidate.artworkId);
    expect(output.match(/候选档案：同名合成作品/g)).toHaveLength(5);
  });
  it("preserves actual scoped/unscoped source associations and uncertainty without mutating canonical context", () => {
    const answer = sourceAnswer();
    parseAssistant(answer.structured);
    freeze(answer);
    const output = exportAnswer(answer);
    expect(output.indexOf("数据库依据")).toBeLessThan(output.indexOf("通用知识补充"));
    expect(output.match(/来源：合成资料/g)).toHaveLength(2);
    expect(output).toContain("第 3 页"); expect(output).toContain("第 7 页");
    expect(output).toContain("未限定支持字段"); expect(output).toContain("待核验");
    expect(output).toContain(sourceId(11)); expect(output).toContain(sourceId(12));
    expect(output).not.toMatch(/复制回答|查看来源|已复制/);
    expect(answer.structured.text).toBe(canonical(answer.structured));
  });
  it.each([[null, "未记录"], ["   ", "未记录"], [[], "未记录"], [0, "0"], [false, "否"]])("keeps %j distinct from missing metadata", (value, expected) => {
    expect(displayValue("biography", value as AnswerReference["value"])).toBe(expected);
  });
  it("keeps explicit attribution statuses, composite identities and record-only evidence", () => {
    const ref: AnswerReference = { ...sourceAnswer().structured.references[0], owner: { table: "artwork_artists", artworkId: sourceId(1), artistId: sourceId(2), role: "workshop_of" }, field: "role", value: "workshop_of", reviewStatus: null, attributionStatus: "not_recorded", sources: [] };
    const output = referenceLines(ref).join("\n");
    expect(output).toContain("工作室"); expect(output).toContain("核验状态：未提供");
    expect(output).toContain("归属状态：未记录"); expect(output).toContain("仅数据库记录");
    expect(displayValue("attribution_status", "unknown")).toBe("未知");
  });
  it("preserves URL-like literal data without projecting transport or other turns", () => {
    const answer = imageSourceAnswer();
    answer.structured.references[0].sources[0].title = "blob:literal-source";
    answer.imageContext.messages.push({ id: "sentinel", role: "user", text: "UNRELATED_HISTORY_SENTINEL", imageIds: [] });
    answer.imageContext.inputs[0].data = "TRANSPORT_SENTINEL";
    answer.structured.text = canonicalImage(answer.structured, answer.imageContext);
    freeze(answer);
    const output = exportAnswer(answer);
    expect(output).toContain("blob:literal-source");
    expect(output).not.toMatch(/TRANSPORT_SENTINEL|UNRELATED_HISTORY_SENTINEL|synthetic-selected/);
    expect(output).toContain("无法辨认"); expect(output).toContain("暂定");
    expect(output).toContain("边框局部仍无法确定"); expect(output).toContain("访客图右下 / 参考图右下");
    expect(output).toContain("尚未确认具体对应");
    expect(answer.structured.text).toBe(canonicalImage(answer.structured, answer.imageContext));
  });
  it("includes proof-only references and every accepted maximum-count association", () => {
    for (const maximum of [false, true]) {
      const answer = imageSourceAnswer(maximum);
      parseAssistantV2(answer.structured, answer.imageContext);
      expect(jsonBytes({ version: 2, turnId: answer.imageContext.turnId, message: answer.structured })).toBeLessThan(128_000);
      freeze(answer);
      const output = exportAnswer(answer);
      for (const r of answer.structured.references) expect(output).toContain(`[${r.key}] ${r.label}`);
      for (const r of answer.structured.referenceImages) expect(output).toContain(`图片记录：${r.imageId}`);
      expect(answer.structured.references).toHaveLength(maximum ? 64 : 2);
    }
  });
  it("exports reread clarification targets and no fake archive section", () => {
    const answer = imageSourceAnswer();
    const message = { ...answer.structured, kind: "clarification" as const, question: "需要重看原图。", reread: { sourceTurnId: "q", sourceAssistantId: answer.id, imageIds: ["picture-2"] }, blocks: [], references: [], observations: [], groups: [], referenceImages: [], comparisons: [], notices: [] };
    const output = exportAnswer({ ...answer, structured: message });
    expect(output).toBe("需要重看原图。\n\n重新查看：图片 2");
  });
  it("retains only cited prior observations and never labels them as a fresh reading", () => {
    const original = imageSourceAnswer();
    const request = structuredClone(original.imageContext);
    request.turnId = "follow";
    request.inputs = [];
    request.observations = structuredClone(original.structured.observations);
    request.observations[1].facts[0].text = "UNRELATED_OBSERVATION_SENTINEL";
    request.messages.push({ id: original.id, role: "assistant", text: original.text, imageIds: [] }, { id: "follow", role: "user", text: "沿用观察", imageIds: [] });
    const message = successV2(request, "沿用此前观察。", sourceId(9003)).message;
    message.blocks = [{ kind: "visual", text: "沿用此前观察。", observationIds: [request.observations[0].id], evidenceKeys: [] }];
    message.notices = ["no_retrieval", "prior_observations"];
    message.text = canonicalImage(message, request);
    parseAssistantV2(message, request);
    freeze(message); freeze(request);
    const output = exportAnswer({ text: message.text, structured: message, imageContext: request });
    expect(output).toContain("此前图片观察"); expect(output).toContain("无法辨认");
    expect(output).not.toMatch(/本次图片观察|UNRELATED_OBSERVATION_SENTINEL/);
  });
  it("keeps old source snapshots independent from later values under the same identities", () => {
    const old = sourceAnswer("旧生平");
    const next = sourceAnswer("新生平", sourceId(9002));
    next.structured.references[0].sources[0].locator = "第 99 页";
    expect(exportAnswer(old)).toContain("旧生平"); expect(exportAnswer(old)).not.toContain("第 99 页");
    expect(exportAnswer(next)).toContain("新生平");
    expect(exportAnswer({ text: "" })).toBe("");
    expect(exportAnswer({ text: "说明", evidence: "材料不足", generalKnowledge: "一般知识" })).toBe("说明\n\n数据库依据\n材料不足\n\n通用知识补充\n一般知识");
  });
});
