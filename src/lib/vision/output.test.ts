// @vitest-environment node
import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { NOTICE_COPY, parseAssistantV2, parseGenerated } from "./output";
import { visitorRequest, artworkResult } from "../../../tests/fixtures/vision-archive";
import { successV2 } from "../../../tests/fixtures/vision";
import { buildCatalogue, publicReference } from "@/lib/answers/catalogue";
import { positive } from "./identity";
import type { GeneratedAnswer, VerificationTask } from "./types";

it("rejects forged current observations, cross-picture blocks, wrong groups and false notices before canonical commit", () => {
  const request = visitorRequest(), m = successV2(request).message;
  expect(parseAssistantV2(m, request).id).toBe(m.id);
  const bad = [
    { ...m, observations: [{ ...m.observations[0], imageSha256: "b".repeat(64) }] },
    { ...m, observations: [{ ...m.observations[0], originTurnId: "other" }] },
    { ...m, observations: [{ ...m.observations[0], supersedes: m.id }] },
    { ...m, observations: [{ ...m.observations[0], pass: "verification" }] },
    { ...m, blocks: [{ ...m.blocks[0], observationIds: [m.id] }] },
    { ...m, blocks: [{ ...m.blocks[0], evidenceKeys: ["E1"] }] },
    { ...m, groups: [{ ...m.groups[0], imageIds: ["unknown"] }] },
    { ...m, groups: [{ ...m.groups[0], id: "G2" }] },
    { ...m, notices: [] }, { ...m, notices: ["image_interpretation", "reference_compared"] },
  ];
  for (const value of bad) expect(() => parseAssistantV2(value, request)).toThrow("invalid_model_output");
});
it("validates actual tasks, source-key ownership, exact quotes and observation corrections", () => {
  const request = visitorRequest(), current = successV2(request).message;
  const catalogue = buildCatalogue(artworkResult().graph);
  const ref = publicReference(catalogue.find((f) => f.field === "description")!);
  const task: VerificationTask = { id: "V1", groupId: "G1", artworkId: artworkResult().graph.artworks[0].id, referenceKey: "R1", visitorImageId: request.inputs[0].imageId };
  const answer: GeneratedAnswer = { blocks: current.blocks, comparisons: [{ taskId: "V1", assessment: "uncertain", proofs: [], contradictions: [] }], observationUpdates: [] };
  expect(parseGenerated(answer, request, current.observations, [ref], [task]).comparisons).toHaveLength(1);
  expect(() => parseGenerated({ blocks: [{ kind: "archive", text: "本次未检索到匹配记录。", evidenceKeys: ["retrievalStatus"], observationIds: [] }], comparisons: [], observationUpdates: [] }, request, current.observations, [], [])).toThrow("invalid_model_output");
  for (const comparison of [{ ...answer.comparisons[0], taskId: "V2" }, { ...answer.comparisons[0], proofs: [{ evidenceKey: ref.key, quote: "不存在的文字", kind: "local_detail", finding: "match", visitorRegion: "center", referenceRegion: "center" }] }, { ...answer.comparisons[0], proofs: [{ evidenceKey: "E999999", quote: "中央主尊两侧", kind: "local_detail", finding: "match", visitorRegion: "center", referenceRegion: "center" }] }]) expect(() => parseGenerated({ ...answer, comparisons: [comparison] }, request, current.observations, [ref], [task])).toThrow("invalid_model_output");
  expect(() => parseGenerated({ ...answer, observationUpdates: [{ imageId: "unseen", facts: [{ text: "新观察", region: "whole" }], readings: [], interpretations: [], limitations: [{ text: "解释更正", affectsIdentity: false }] }] }, request, current.observations, [ref], [task])).toThrow("invalid_model_output");
});
it("treats generic, overlapping or unsourced proof as insufficient identity even with valid catalogue keys", () => {
  const result = artworkResult(), catalogue = buildCatalogue(result.graph), ref = catalogue.find((f) => f.field === "description")!;
  const proofs = [
    { evidenceKey: ref.key, quote: "中央主尊两侧分别排列四位侍者", kind: "composition" as const, finding: "match" as const, visitorRegion: "whole" as const, referenceRegion: "whole" as const },
    { evidenceKey: ref.key, quote: "右下角有一处独特的白色莲花", kind: "local_detail" as const, finding: "match" as const, visitorRegion: "bottom_right" as const, referenceRegion: "bottom_right" as const },
  ];
  const c = { taskId: "V1", assessment: "same_work" as const, proofs, contradictions: [] };
  expect(positive(c, result.candidates[0].id, catalogue)).toBe(true);
  expect(positive({ ...c, proofs: [proofs[0], { ...proofs[1], quote: "中央主尊两侧分别排列四位侍者" }] }, result.candidates[0].id, catalogue)).toBe(false);
  expect(positive({ ...c, proofs: proofs.map((p) => ({ ...p, visitorRegion: "whole", referenceRegion: "whole" })) }, result.candidates[0].id, catalogue)).toBe(false);
  expect(positive(c, result.candidates[0].id, catalogue.map((f) => ({ ...f, sources: [] })))).toBe(false);
});

it.each(["[图片1]", "[图片 1]", "[E1]", "[R1]"])("rejects model-written %s markers so canonical and visible links cannot duplicate", (marker) => {
  const request = visitorRequest(), current = successV2(request).message;
  const answer = { blocks: [{ ...current.blocks[0], text: `中央人物呈坐姿。${marker}` }], comparisons: [], observationUpdates: [] };
  expect(() => parseGenerated(answer, request, current.observations, [], [])).toThrow("invalid_model_output");
});

it("rejects the live-observed duplicate search paragraph and every other exact server-owned notice", () => {
  const request = visitorRequest(), current = successV2(request).message;
  for (const notice of Object.values(NOTICE_COPY)) {
    const answer = { blocks: [{ kind: "general", text: `${notice}未作真伪判断。`, evidenceKeys: [], observationIds: [] }], comparisons: [], observationUpdates: [] };
    expect(() => parseGenerated(answer, request, current.observations, [], [])).toThrow("invalid_model_output");
  }
});

it("keeps current reread and unrelated historical observations in separate visual blocks", () => {
  const initial = visitorRequest(2), previous = successV2(initial).message;
  const request = { ...initial, turnId: "next", inputs: initial.inputs.slice(0, 1), observations: previous.observations, messages: [...initial.messages, { id: previous.id, role: "assistant" as const, text: previous.text, imageIds: [] }, { id: "next", role: "user" as const, text: "重读第一张小字", imageIds: [initial.images[0].id] }] };
  const current = successV2(request, "新观察", "cccccccc-cccc-4ccc-8ccc-cccccccccccc").message;
  const blocks = [
    { kind: "visual", text: "本次重看的小字。", evidenceKeys: [], observationIds: [current.observations[0].id] },
    { kind: "visual", text: "此前另一张图的观察。", evidenceKeys: [], observationIds: [previous.observations[1].id] },
  ];
  expect(parseGenerated({ blocks, comparisons: [], observationUpdates: [] }, request, current.observations, [], []).blocks).toHaveLength(2);
  expect(() => parseGenerated({ blocks: [{ ...blocks[0], observationIds: blocks.flatMap((b) => b.observationIds) }], comparisons: [], observationUpdates: [] }, request, current.observations, [], [])).toThrow("invalid_model_output");
});
