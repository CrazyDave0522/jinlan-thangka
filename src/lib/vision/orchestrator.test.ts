// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { generateV2 } from "./orchestrator";
import { createScope } from "@/lib/answers/runtime";
import { selectReferences, readReferences, rowDigest } from "./references";
import type { complete, ProviderMessage } from "@/lib/answers/provider";
import type { ImageRequest, GeneratedAnswer, ObservationBody, VerificationTask } from "./types";
import { artworkResult, imagePlan, visitorRequest } from "../../../tests/fixtures/vision-archive";
import { archiveId } from "../../../tests/fixtures/archive";
import type { ReferenceConfiguration } from "./reference-manifest";
import { parseRequest } from "./validation";
import { AnswerFailure } from "@/lib/answers/contracts";
import { parseAssistantV2 } from "./output";
import { successV2 } from "../../../tests/fixtures/vision";
import type { RetrievalResult } from "@/lib/retrieval/contracts";

const config = { key: "synthetic-only", model: "deepseek-flash" as const };
const scopes: ReturnType<typeof createScope>[] = [];
const scope = () => { const s = createScope(); scopes.push(s); return s; };
afterEach(() => { scopes.splice(0).forEach((s) => s.close()); });
function data(messages: ProviderMessage[]) { const content = messages[1].content; return JSON.parse(typeof content === "string" ? content : content.find((p) => p.type === "text")!.text); }
function response(messages: ProviderMessage[]): GeneratedAnswer {
  const payload = data(messages);
  return { blocks: [{ kind: payload.observations.length ? "visual" : "general", text: "请结合可见特征和档案依据核对。", evidenceKeys: [], observationIds: payload.observations.map((o: { id: string }) => o.id) }], comparisons: [], observationUpdates: [] };
}
it.each([false, true])("keeps the question-answering introduction consistent with prior image context=%s", async (prior) => {
  const original = visitorRequest();
  const previous = successV2(original).message;
  const question = "你能帮我做什么？";
  const request: ImageRequest = prior
    ? { ...original, turnId: "introduction", inputs: [], observations: previous.observations, messages: [...original.messages, { id: previous.id, role: "assistant", text: previous.text, imageIds: [] }, { id: "introduction", role: "user", text: question, imageIds: [] }] }
    : { ...visitorRequest(0), messages: [{ id: "q", role: "user", text: question, imageIds: [] }] };
  parseRequest(request);
  const introduction = "我可以结合档案资料与相关知识，帮您解答唐卡的题材、风格与作品背景等问题。";
  const completeMock = vi.fn<typeof complete>(async (_config, stage, messages) => {
    expect(messages[0].content).toContain("answering Thangka questions");
    const payload = data(messages);
    if (stage === "planner") return { content: payload.protocol === 2 ? { action: "answer", observations: [], groups: [], queries: [] } : { action: "answer", queries: [] }, usage: {} };
    expect(messages[0].content).toContain("available archive information and relevant knowledge");
    expect(messages[0].content).toContain("no fixed greeting script");
    expect(messages[0].content).toContain("a full capability introduction is optional");
    expect(messages[0].content).not.toContain("A suitable introduction is");
    expect(messages[0].content).toContain("without implying that this turn already retrieved records");
    expect(payload.retrievalStatus).toBe("not_searched");
    return { content: payload.protocol === 2 ? { blocks: [{ kind: "general", text: introduction, evidenceKeys: [], observationIds: [] }], comparisons: [], observationUpdates: [] } : { blocks: [{ kind: "general", text: introduction, evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn(), read = vi.fn();
  const result = await generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences, readReferences: read });
  parseAssistantV2(result.message, request);
  expect(result.message.blocks).toEqual([{ kind: "general", text: introduction, evidenceKeys: [], observationIds: [] }]);
  expect(result.message.notices).toEqual(["no_retrieval"]);
  expect(result.message.observations).toEqual([]);
  expect(result.message.references).toEqual([]);
  expect(result.message.referenceImages).toEqual([]);
  expect(completeMock).toHaveBeenCalledTimes(2);
  expect(retrieve).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
});
it.each([false, true])("preserves model-written follow-up greetings with prior image context=%s", async (prior) => {
  const original = visitorRequest();
  const previous = successV2(original).message;
  const request: ImageRequest = prior
    ? { ...original, turnId: "greeting-1", inputs: [], observations: previous.observations, messages: [...original.messages, { id: previous.id, role: "assistant", text: previous.text, imageIds: [] }, { id: "greeting-1", role: "user", text: "你好", imageIds: [] }] }
    : { ...visitorRequest(0), messages: [{ id: "q", role: "user", text: "你好", imageIds: [] }] };
  const replies = ["你好！今天想了解唐卡的哪方面？", "又见面了！接着聊些什么？"];
  let nextReply = 0;
  const completeMock = vi.fn<typeof complete>(async (_config, stage, messages) => {
    const payload = data(messages);
    expect(payload.context.at(-1).text).toBe("你好");
    if (nextReply === 1) expect(payload.context.at(-2).text).toContain(replies[0]);
    if (stage === "planner") return { content: payload.protocol === 2 ? { action: "answer", observations: [], groups: [], queries: [] } : { action: "answer", queries: [] }, usage: {} };
    expect(messages[0].content).toContain("avoid repeating its wording or capability list");
    return { content: payload.protocol === 2 ? { blocks: [{ kind: "general", text: replies[nextReply], evidenceKeys: [], observationIds: [] }], comparisons: [], observationUpdates: [] } : { blocks: [{ kind: "general", text: replies[nextReply], evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn(), read = vi.fn();
  const deps = { complete: completeMock, retrieve, selectReferences, readReferences: read };
  const first = await generateV2(request, config, scope(), deps);
  expect(first.message.blocks[0].text).toBe(replies[0]);
  request.turnId = "greeting-2";
  request.messages.push({ id: first.message.id, role: "assistant", text: first.message.text, imageIds: [] }, { id: "greeting-2", role: "user", text: "你好", imageIds: [] });
  nextReply = 1;
  parseRequest(request);
  const second = await generateV2(request, config, scope(), deps);
  parseAssistantV2(second.message, request);
  expect(second.message.blocks).toEqual([{ kind: "general", text: replies[1], evidenceKeys: [], observationIds: [] }]);
  expect(second.message.notices).toEqual(["no_retrieval"]);
  expect(second.message.observations).toEqual([]);
  expect(second.message.references).toEqual([]);
  expect(second.message.referenceImages).toEqual([]);
  expect(completeMock).toHaveBeenCalledTimes(4);
  expect(retrieve).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
});
it("makes the captured reread question and current/prior observation sets explicit without resending unrelated pixels", async () => {
  const initial = visitorRequest(2), previous = successV2(initial).message;
  const clarificationId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const request: ImageRequest = { ...initial, turnId: "reread", inputs: initial.inputs.slice(0, 1), observations: previous.observations,
    messages: [...initial.messages, { id: previous.id, role: "assistant", text: previous.text, imageIds: [] }, { id: "detail", role: "user", text: "逐字读第一张右下角小字", imageIds: [] }, { id: clarificationId, role: "assistant", text: "请重看图片", imageIds: [] }, { id: "reread", role: "user", text: "逐字读第一张右下角小字", imageIds: [initial.images[0].id] }],
    intent: { kind: "reread", sourceTurnId: "detail", sourceAssistantId: clarificationId, imageIds: [initial.images[0].id] } };
  parseRequest(request);
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    const payload = data(messages);
    if (stage === "analysis") {
      expect(payload.question).toBe(request.messages.at(-1)!.text);
      expect(payload.intent).toBe("reread");
      expect(payload.selectedImageIds).toEqual([initial.images[0].id]);
      expect(Array.isArray(messages[1].content) && messages[1].content.filter((p) => p.type === "image_url")).toHaveLength(1);
      return { content: imagePlan(request), usage: {} };
    }
    expect(payload.answerTask).toEqual({ question: request.messages.at(-1)!.text, intent: "reread", selectedImageIds: [initial.images[0].id], currentObservationIds: payload.observations.map((o: { id: string }) => o.id), priorObservationIds: [previous.observations[1].id] });
    expect(payload.priorObservations.map((o: { id: string }) => o.id)).toEqual([previous.observations[1].id]);
    expect(typeof messages[1].content).toBe("string");
    return { content: response(messages), usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async (query): Promise<RetrievalResult> => ({ status: "no_matches", query, candidates: [], candidateLimitReached: false })), selectReferences, readReferences: vi.fn() });
  expect(answer.message.observations[0].supersedes).toBe(previous.observations[0].id);
  expect(completeMock).toHaveBeenCalledTimes(2);
});
it("keeps curated object locators out of text-only v2 model evidence and public answers", async () => {
  const result = artworkResult();
  const request: ImageRequest = { version: 2, turnId: "text", messages: [{ id: "text", role: "user", text: "介绍档案作品", imageIds: [] }], images: [], inputs: [], observations: [], sameWorkSets: [], intent: { kind: "question" } };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "planner") return { content: { action: "answer", queries: [result.query] }, usage: {} };
    const payload = data(messages);
    expect(payload.catalogue.some((f: { field: string }) => f.field === "storage_locator")).toBe(false);
    return { content: { blocks: [{ kind: "general", text: "图片的使用仍需结合授权依据核对。", evidenceKeys: [] }] }, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: vi.fn() });
  expect(JSON.stringify(answer)).not.toContain("fixture/1.png");
});
it("identifies four independently numbered works using four bound queries and only one visual pass", async () => {
  const request = visitorRequest(4), plan = imagePlan(request, true);
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") { expect(data(messages).selectedImageIds).toEqual(request.inputs.map((i) => i.imageId)); expect(Array.isArray(messages[1].content) && messages[1].content.filter((p) => p.type === "image_url")).toHaveLength(4); return { content: plan, usage: {} }; }
    expect(stage).toBe("image_answer"); expect(typeof messages[1].content).toBe("string");
    return { content: response(messages), usage: {} };
  });
  const retrieve = vi.fn(async (query) => { const number = Number(query.filters.find((f: { field: string }) => f.field === "accession").value.slice(2)); const result = artworkResult([number]); result.query = query; return result; });
  const read = vi.fn(readReferences);
  const result = await generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences: (g, r, graph) => selectReferences(g, r, graph, { invalid: "not needed for identifiers" }), readReferences: read });
  expect(result.message.groups.map((g) => g.identity.status)).toEqual(["identified", "identified", "identified", "identified"]);
  expect(result.message.groups[3].identity).toMatchObject({ method: "identifier", artworkId: archiveId(4), supportingImageIds: ["picture-4"] });
  expect(result.message.references).toHaveLength(8); expect(completeMock).toHaveBeenCalledTimes(2); expect(retrieve).toHaveBeenCalledTimes(4); expect(read).not.toHaveBeenCalled();
});
it("reports reference expansion beyond 64 keys as evidence overflow without truncating identity proof", async () => {
  const request = visitorRequest(4);
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: imagePlan(request, true), usage: {} };
    const keys = data(messages).catalogue.slice(0, 64).map((f: { key: string }) => f.key);
    return { content: { blocks: Array.from({ length: 8 }, (_, n) => ({ kind: "archive", text: "档案字段记录。", evidenceKeys: keys.slice(n * 8, n * 8 + 8), observationIds: [] })), comparisons: [], observationUpdates: [] }, usage: {} };
  });
  const retrieve = vi.fn(async (query) => { const number = Number(query.filters.find((f: { field: string }) => f.field === "accession").value.slice(2)); const result = artworkResult([number]); result.query = query; return result; });
  await expect(generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences, readReferences: vi.fn() })).rejects.toThrow("evidence_too_large");
  expect(completeMock).toHaveBeenCalledTimes(2);
});
it.each(["uncertain", "duplicate", "unscoped", "unverified", "capped", "punctuation", "conflict"])("retains candidates for a %s identifier gate", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request, true), result = artworkResult(variant === "duplicate" ? [1, 2] : [1]);
  if (variant === "uncertain") plan.observations[0].readings[0].certainty = "tentative";
  if (variant === "unscoped") result.graph.sourceLinks = result.graph.sourceLinks.map((l) => l.entity === "artwork" ? { ...l, row: { ...l.row, supported_field: "" } } : l);
  if (variant === "unverified") result.graph.artworks[0] = { ...result.graph.artworks[0], review_status: "pending" };
  if (variant === "capped") result.candidateLimitReached = true;
  if (variant === "punctuation") result.graph.artworks[0] = { ...result.graph.artworks[0], accession_number: "S1" };
  if (variant === "conflict") plan.observations[0].readings.push({ text: "S-999", kind: "accession", certainty: "clear", region: "top_left" });
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: vi.fn() });
  expect(answer.message.groups[0].identity.status).toBe("candidates");
  expect(answer.message.referenceImages).toEqual([]);
});
it.each(["collection", "accession", "unicode-collection"])("accepts consistent repeated %s readings without reference reads", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request, true), result = artworkResult();
  const readings = plan.observations[0].readings;
  if (variant === "unicode-collection") {
    readings[0].text = "Colléction";
    result.graph.artworks[0] = { ...result.graph.artworks[0], collection_name: " COLLéCTION " };
    plan.queries[0].query = { kind: "search", entity: "artwork", filters: [{ field: "collection", mode: "exact", value: "Colléction" }, { field: "accession", mode: "exact", value: "S-1" }], limit: 5 };
  }
  const reading = readings[variant === "accession" ? 1 : 0];
  readings.push({ ...reading, text: variant === "accession" ? "s-1" : variant === "unicode-collection" ? "colle\u0301ction" : reading.text, region: "top_left" });
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: plan, usage: {} };
    expect(stage).toBe("image_answer");
    return { content: response(messages), usage: {} };
  });
  const read = vi.fn(readReferences);
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "identified", method: "identifier", supportingImageIds: ["picture-1"], referenceKeys: [] });
  expect(answer.message.observations[0].readings).toEqual(readings);
  expect(completeMock).toHaveBeenCalledTimes(2); expect(read).not.toHaveBeenCalled();
});
it.each(["collection", "accession"])("rejects genuinely different repeated %s readings", async (kind) => {
  const request = visitorRequest(), plan = imagePlan(request, true), result = artworkResult();
  const reading = plan.observations[0].readings.find((r) => r.kind === kind)!;
  plan.observations[0].readings.push({ ...reading, text: kind === "collection" ? "另一收藏机构" : "S-01", region: "top_left" });
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: vi.fn() });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
});
function referenceCase(numbers = [1, 2]) {
  const result = artworkResult(numbers);
  const manifest: ReferenceConfiguration = { version: 1, grants: result.graph.images.map((row) => ({ imageId: row.id, rowDigest: rowDigest(row), bucket: "fixtures", objectPath: `${row.id}.png`, contentSha256: "b".repeat(64), permissionReference: row.license_or_permission_reference!, aiProcessing: true, reviewedBy: "Synthetic reviewer", reviewedOn: "2026-10-17" })) };
  const read = vi.fn<typeof readReferences>(async (s) => s.references.map((r) => ({ evidence: r.evidence, mimeType: "image/png", data: `synthetic-reference-${r.row.id}` })));
  return { result, manifest, read };
}
function referenceAnswer(messages: ProviderMessage[]): GeneratedAnswer {
  const payload = data(messages), answer = response(messages);
  answer.comparisons = payload.tasks.map((task: VerificationTask) => {
    const key = payload.catalogue.find((f: { owner: { id: string }; field: string }) => f.owner.id === task.artworkId && f.field === "description").key;
    const positive = task.artworkId === archiveId(1);
    return { taskId: task.id, assessment: positive ? "same_work" : "different_work", proofs: positive ? [
      { evidenceKey: key, quote: "中央主尊两侧分别排列四位侍者", kind: "composition", finding: "match", visitorRegion: "whole", referenceRegion: "whole" },
      { evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "match", visitorRegion: "bottom_right", referenceRegion: "bottom_right" },
    ] : [{ evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "mismatch", visitorRegion: "bottom_right", referenceRegion: "bottom_right" }], contradictions: positive ? [] : ["右下角花瓣与所选图片不同。"] };
  });
  return answer;
}
it.each([
  { field: "collection_name" as const, value: null },
  { field: "collection_name" as const, value: "" },
  { field: "collection_name" as const, value: " \t " },
  { field: "accession_number" as const, value: null },
  { field: "accession_number" as const, value: "" },
  { field: "accession_number" as const, value: " \t " },
  { field: "both" as const, value: null },
])("allows qualified reference identity when record $field is $value", async ({ field, value }) => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase();
  plan.observations = imagePlan(request, true).observations;
  for (const key of ["collection_name", "accession_number"] as const) if (field === "both" || field === key) fixture.result.graph.artworks[0] = { ...fixture.result.graph.artworks[0], [key]: value };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : referenceAnswer(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "identified", method: "reference", artworkId: archiveId(1), referenceKeys: ["R1"] });
  expect(completeMock).toHaveBeenCalledTimes(2); expect(fixture.read).toHaveBeenCalledTimes(1);
});
it("does not confirm a missing record identifier without qualified reference evidence", async () => {
  const request = visitorRequest(), plan = imagePlan(request, true), result = artworkResult();
  result.graph.artworks[0] = { ...result.graph.artworks[0], collection_name: null, accession_number: null };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const read = vi.fn(readReferences);
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: read });
  expect(answer.message.groups[0].identity.status).toBe("candidates");
  expect(answer.message.groups[0].identity).toMatchObject({ reasons: expect.arrayContaining(["identifier_unclear"]) });
  for (const reason of ["identity_conflict", "identifier_mismatch"]) expect(answer.message.groups[0].identity).not.toMatchObject({ reasons: expect.arrayContaining([reason]) });
  expect(read).not.toHaveBeenCalled();
});
it.each(["collection", "accession"])("preserves real %s conflicts when the other record identifier is missing", async (kind) => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase([1]);
  plan.observations = imagePlan(request, true).observations;
  fixture.result.graph.artworks[0] = { ...fixture.result.graph.artworks[0], collection_name: kind === "collection" ? "另一收藏机构" : null, accession_number: kind === "accession" ? "S-999" : null };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : referenceAnswer(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
});
it.each(["collection", "accession"])("preserves conflicting visitor %s readings even without a record value", async (kind) => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase([1]);
  plan.observations = imagePlan(request, true).observations;
  const reading = plan.observations[0].readings.find((r) => r.kind === kind)!;
  plan.observations[0].readings.push({ ...reading, text: kind === "collection" ? "另一收藏机构" : "S-999", region: "top_left" });
  fixture.result.graph.artworks[0] = { ...fixture.result.graph.artworks[0], [kind === "collection" ? "collection_name" : "accession_number"]: null };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : referenceAnswer(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
});
it.each(["different_work", "contradiction", "mismatch", "consistent"])("checks issued comparisons even when corrected identifiers can confirm the work: %s", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request, true), fixture = referenceCase([1]);
  plan.observations[0].readings[1].certainty = "tentative";
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: plan, usage: {} };
    expect(stage).toBe("verification");
    const answer = referenceAnswer(messages);
    if (variant === "different_work") answer.comparisons[0] = { taskId: "V1", assessment: "different_work", proofs: [], contradictions: [] };
    if (variant === "contradiction") answer.comparisons[0] = { taskId: "V1", assessment: "uncertain", proofs: [], contradictions: ["编号虽已读清，但画面与档案参考图存在冲突。"] };
    if (variant === "mismatch") answer.comparisons[0].proofs[1].finding = "mismatch";
    answer.observationUpdates = [{ ...imagePlan(request, true).observations[0], limitations: [{ text: "实际重看确认此前模糊的编号为 S-1。", affectsIdentity: false }] }];
    return { content: answer, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity.status).toBe(variant === "consistent" ? "identified" : "candidates");
  if (variant === "consistent") {
    expect(answer.message.groups[0].identity).toMatchObject({ method: "identifier", referenceKeys: [] });
    const forged = structuredClone(answer.message);
    forged.comparisons[0].assessment = "different_work";
    expect(() => parseAssistantV2(forged, request)).toThrow("invalid_model_output");
  } else expect(answer.message.groups[0].identity).toMatchObject({ reasons: expect.arrayContaining(["identity_conflict"]) });
  expect(completeMock).toHaveBeenCalledTimes(2);
});
it.each([true, false])("blocks identifier confirmation only for identity-affecting limitations: %s", async (affectsIdentity) => {
  const request = visitorRequest(), plan = imagePlan(request, true), result = artworkResult();
  plan.observations[0].limitations = [{ text: affectsIdentity ? "标签与作品本体存在未解决的冲突。" : "局部反光，但收藏机构与编号清晰。", affectsIdentity }];
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => result), selectReferences, readReferences: vi.fn() });
  expect(answer.message.groups[0].identity.status).toBe(affectsIdentity ? "candidates" : "identified");
  if (affectsIdentity) expect(answer.message.groups[0].identity).toMatchObject({ reasons: expect.arrayContaining(["identity_conflict"]) });
  else expect(() => parseAssistantV2({ ...answer.message, observations: answer.message.observations.map((o) => ({ ...o, limitations: [{ text: "存在未解决的对应冲突。", affectsIdentity: true }] })) }, request)).toThrow("invalid_model_output");
});
it.each(["unresolved-number", "new-number", "corrected-number", "unresolved-limitation", "new-limitation", "corrected-limitation", "visibility"])("checks final observations before reference confirmation: %s", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase();
  if (variant.includes("number")) plan.observations[0].readings = [{ text: variant === "new-number" ? "S-1" : "S-999", kind: "accession", certainty: "clear", region: "bottom_left" }];
  if (variant === "unresolved-limitation" || variant === "corrected-limitation") plan.observations[0].limitations = [{ text: "标签与作品本体存在未解决的冲突。", affectsIdentity: true }];
  if (variant === "visibility") plan.observations[0].limitations = [{ text: "边缘有反光，中央与右下角仍清楚可见。", affectsIdentity: false }];
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: plan, usage: {} };
    const answer = referenceAnswer(messages);
    let correction: ObservationBody | undefined;
    if (variant === "new-number" || variant === "corrected-number") correction = { ...plan.observations[0], readings: [{ text: variant === "new-number" ? "S-999" : "S-1", kind: "accession", certainty: "clear", region: "bottom_left" }], limitations: [{ text: "实际重看标牌后，更正此前的编号读数。", affectsIdentity: false }] };
    if (variant === "new-limitation") correction = { ...plan.observations[0], limitations: [{ text: "重看发现标签与画面存在冲突，尚未解决。", affectsIdentity: true }] };
    if (variant === "corrected-limitation") correction = { ...plan.observations[0], limitations: [{ text: "实际重看确认此前把画框阴影误作标签接缝，冲突已消除。", affectsIdentity: false }] };
    if (correction) answer.observationUpdates = [correction];
    return { content: answer, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  const blocked = ["unresolved-number", "new-number", "unresolved-limitation", "new-limitation"].includes(variant);
  expect(answer.message.groups[0].identity.status).toBe(blocked ? "candidates" : "identified");
  if (blocked) expect(answer.message.groups[0].identity).toMatchObject({ reasons: expect.arrayContaining(["identity_conflict"]) });
  if (variant.startsWith("corrected")) expect(answer.message.observations[0].pass).toBe("verification");
  expect(completeMock).toHaveBeenCalledTimes(2);
});
it("does not let a representative's matching features erase a conflict in another current group picture", async () => {
  const request = visitorRequest(2), plan = imagePlan(request), fixture = referenceCase();
  request.sameWorkSets = [["picture-1", "picture-2"]];
  plan.groups = [{ ...plan.groups[0], imageIds: ["picture-1", "picture-2"] }]; plan.queries = [plan.queries[0]];
  plan.observations[1].readings = [{ text: "S-999", kind: "accession", certainty: "clear", region: "bottom_left" }];
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : referenceAnswer(messages), usage: {} }));
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
});
it("keeps a target unconfirmed when another supplied reference comparison reports an unresolved contradiction", async () => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase();
  const secondReference = { ...fixture.result.graph.images[0], id: archiveId(103), is_primary: false };
  fixture.result.graph.images.push(secondReference);
  fixture.manifest.grants.push({ ...fixture.manifest.grants[0], imageId: secondReference.id, rowDigest: rowDigest(secondReference), objectPath: `${secondReference.id}.png` });
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: plan, usage: {} };
    const answer = referenceAnswer(messages);
    expect(answer.comparisons).toHaveLength(3);
    answer.comparisons[2] = { taskId: "V3", assessment: "uncertain", proofs: [], contradictions: ["局部题记与另一参考图存在尚未解决的冲突。"] };
    return { content: answer, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
});
it.each([true, false])("requires both distinctive positive proof and complete competing negatives: %s", async (negativeAvailable) => {
  const request = visitorRequest(), plan = imagePlan(request), fixture = referenceCase();
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: plan, usage: {} };
    expect(stage).toBe("verification");
    expect(Array.isArray(messages[1].content) && messages[1].content.filter((p) => p.type === "image_url")).toHaveLength(3);
    const payload = data(messages);
    const answer = response(messages);
    answer.comparisons = payload.tasks.map((task: { id: string; artworkId: string }) => {
      const key = payload.catalogue.find((f: { owner: { id: string }; field: string }) => f.owner.id === task.artworkId && f.field === "description").key;
      return { taskId: task.id, assessment: task.artworkId === archiveId(1) ? "same_work" : negativeAvailable ? "different_work" : "uncertain", proofs: task.artworkId === archiveId(1) ? [
        { evidenceKey: key, quote: "中央主尊两侧分别排列四位侍者", kind: "composition", finding: "match", visitorRegion: "whole", referenceRegion: "whole" },
        { evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "match", visitorRegion: "bottom_right", referenceRegion: "bottom_right" },
      ] : negativeAvailable ? [{ evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "mismatch", visitorRegion: "bottom_right", referenceRegion: "bottom_right" }] : [], contradictions: task.artworkId !== archiveId(1) && negativeAvailable ? ["右下角的花瓣形状与所选图片不同。"] : [] };
    });
    return { content: answer, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.groups[0].identity.status).toBe(negativeAvailable ? "identified" : "candidates");
  if (negativeAvailable) expect(answer.message.groups[0].identity).toMatchObject({ method: "reference", supportingImageIds: ["picture-1"], referenceKeys: ["R1"] });
  expect(answer.message.references).toHaveLength(negativeAvailable ? 2 : 1); expect(answer.message.comparisons).toHaveLength(2);
  expect(JSON.stringify(answer)).not.toContain("synthetic-reference"); expect(JSON.stringify(answer)).not.toContain("fixtures/");
});
it("stops a required reference failure without publishing partial identity or a second model call", async () => {
  const request = visitorRequest(), fixture = referenceCase();
  const completeMock = vi.fn<typeof complete>(async () => ({ content: imagePlan(request), usage: {} }));
  await expect(generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: vi.fn(async () => { throw new AnswerFailure("reference_failed"); }) })).rejects.toThrow("reference_failed");
  expect(completeMock).toHaveBeenCalledTimes(1);
});
it("returns one-call reread before any archive/reference access for summary-only identity", async () => {
  const request = visitorRequest();
  const priorId = "10000000-0000-0000-0000-000000000001";
  const follow: ImageRequest = { ...request, turnId: "next", inputs: [], messages: [...request.messages, { id: priorId, role: "assistant", text: "此前观察", imageIds: [] }, { id: "next", role: "user", text: "请确认具体档案作品", imageIds: [] }] };
  parseRequest(follow);
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    expect(stage).toBe("planner");
    expect(data(messages).selectedImageIds).toEqual([]);
    expect(data(messages).images).toHaveLength(1);
    expect(Array.isArray(messages[1].content) && messages[1].content.some((p) => p.type === "image_url")).toBe(false);
    return { content: { ...imagePlan(request), observations: [], groups: [{ ...imagePlan(request).groups[0], representativeImageId: null }] }, usage: {} };
  });
  const retrieve = vi.fn(), select = vi.fn(), read = vi.fn();
  const answer = await generateV2(follow, config, scope(), { complete: completeMock, retrieve, selectReferences: select, readReferences: read });
  expect(answer.message).toMatchObject({ kind: "clarification", reread: { sourceTurnId: "next", imageIds: ["picture-1"] }, observations: [] });
  expect(completeMock).toHaveBeenCalledTimes(1); expect(retrieve).not.toHaveBeenCalled(); expect(select).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled();
});
it("distinguishes a completed empty archive search from a failed lookup", async () => {
  const request = visitorRequest(), plan = imagePlan(request);
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const result = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async (query): Promise<RetrievalResult> => ({ status: "no_matches", query, candidates: [], candidateLimitReached: false })), selectReferences, readReferences: vi.fn() });
  expect(result.message.groups[0].identity.status).toBe("no_match"); expect(result.message.notices).toContain("no_matches"); expect(result.message.references).toEqual([]);
});
it.each(["skipped", "overfiltered"])("performs literal named retrieval with selected pixels after a %s plan, without granting identity from the title", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request);
  request.messages[0].text = "这张图与作品《合成作品17》有什么关系？";
  const expected = { kind: "search" as const, entity: "artwork" as const, filters: [{ field: "name" as const, mode: "exact" as const, value: "合成作品17" }], limit: 5 };
  if (variant === "skipped") { plan.queries = []; plan.groups[0].search = "no_clue"; }
  else plan.queries[0].query = { ...expected, filters: [...expected.filters, { field: "subject", mode: "exact", value: "观音" }] };
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    const payload = data(messages);
    if (stage === "analysis") { expect(payload.requiredLookups).toEqual([expected]); return { content: plan, usage: {} }; }
    expect(stage).toBe("image_answer");
    expect(payload.retrievalStatus).toBe("no_matches");
    expect(payload.catalogue).toEqual([]);
    expect(payload.provenance[0].query).toEqual(expected);
    expect(typeof messages[1].content).toBe("string");
    return { content: response(messages), usage: {} };
  });
  const retrieve = vi.fn(async (query): Promise<RetrievalResult> => ({ status: "no_matches", query, candidates: [], candidateLimitReached: false })), read = vi.fn();
  const result = await generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences, readReferences: read });
  expect(retrieve).toHaveBeenCalledExactlyOnceWith(expected, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(completeMock).toHaveBeenCalledTimes(2);
  expect(read).not.toHaveBeenCalled();
  expect(result.message.references).toEqual([]);
  expect(result.message.referenceImages).toEqual([]);
  expect(result.message.groups[0].searchStatus).toBe(variant === "skipped" ? "not_searched" : "no_matches");
  expect(result.message.groups[0].identity.status).toBe(variant === "skipped" ? "insufficient_evidence" : "no_match");
  expect(result.message.notices).toContain("no_matches");
});

it.each(["wrapper", "missing-action", "long-observation", "unreadable"])("rejects %s planner output before retrieval, without truncation or repair calls", async (variant) => {
  const request = visitorRequest(), plan = imagePlan(request);
  let content: unknown = plan;
  if (variant === "wrapper") content = { type: "json_object", ...plan };
  if (variant === "missing-action") { const { action: _action, ...rest } = plan; void _action; content = rest; }
  if (variant === "long-observation") {
    plan.observations[0].facts = Array.from({ length: 4 }, (_, n) => ({ text: `${n}${"字".repeat(75)}`, region: "whole" }));
  }
  if (variant === "unreadable") plan.observations[0].readings = [{ text: "看不清，可能是编号", certainty: "unreadable", kind: "accession", region: "whole" }];
  const completeMock = vi.fn<typeof complete>(async () => ({ content, usage: {} })), retrieve = vi.fn(), read = vi.fn();
  await expect(generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences, readReferences: read })).rejects.toThrow("invalid_model_output");
  expect(completeMock).toHaveBeenCalledTimes(1);
  expect(retrieve).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled();
});

it("does not turn a matching literal title into pixel-to-record evidence or authorize reference reads", async () => {
  const request = visitorRequest(), plan = imagePlan(request);
  request.messages[0].text = "这张图和作品《合成作品 1》相同吗？";
  plan.queries = []; plan.groups[0].search = "no_clue";
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => ({ content: stage === "analysis" ? plan : response(messages), usage: {} }));
  const read = vi.fn();
  const result = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async (query) => ({ ...artworkResult(), query })), selectReferences, readReferences: read });
  expect(result.message.groups[0]).toMatchObject({ searchStatus: "not_searched", candidates: [], identity: { status: "insufficient_evidence" } });
  expect(result.message.referenceImages).toEqual([]);
  expect(read).not.toHaveBeenCalled();
  expect(completeMock).toHaveBeenCalledTimes(2);
});
it.each(["retrieval_failed", "evidence_changed"])("publishes no visual-only fallback after %s", async (code) => {
  const request = visitorRequest(2), first = artworkResult([1]), second = artworkResult([1]);
  second.graph.artworks[0] = { ...second.graph.artworks[0], accession_number: "S-2" };
  const completeMock = vi.fn<typeof complete>(async () => ({ content: imagePlan(request, true), usage: {} }));
  const retrieve = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(code === "retrieval_failed" ? { status: "error", error: { code: "timeout" } } : second);
  await expect(generateV2(request, config, scope(), { complete: completeMock, retrieve, selectReferences, readReferences: vi.fn() })).rejects.toThrow(code);
  expect(completeMock).toHaveBeenCalledTimes(1);
});
it("publishes verification corrections only for supplied pictures and keeps their version provenance", async () => {
  const request = visitorRequest(), fixture = referenceCase();
  const completeMock = vi.fn<typeof complete>(async (_c, stage, messages) => {
    if (stage === "analysis") return { content: imagePlan(request), usage: {} };
    const answer = response(messages), payload = data(messages);
    answer.comparisons = payload.tasks.map((t: { id: string }) => ({ taskId: t.id, assessment: "uncertain", proofs: [], contradictions: [] }));
    answer.observationUpdates = [{ ...imagePlan(request).observations[0], limitations: [{ text: "本次重看仍未能辨认角落文字。", affectsIdentity: false }] }];
    return { content: answer, usage: {} };
  });
  const answer = await generateV2(request, config, scope(), { complete: completeMock, retrieve: vi.fn(async () => fixture.result), selectReferences: (g, r, graph) => selectReferences(g, r, graph, fixture.manifest), readReferences: fixture.read });
  expect(answer.message.observations[0]).toMatchObject({ pass: "verification", originTurnId: "q", originAssistantId: answer.message.id, limitations: [{ text: "本次重看仍未能辨认角落文字。", affectsIdentity: false }] });
});
