// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { generateAnswer, parsePlan, ANSWER_PROMPT } from "./orchestrator";
import { createScope } from "./runtime";
import { buildCatalogue, mergeEvidence } from "./catalogue";
import { archiveId as id, archiveRow as row } from "../../../tests/fixtures/archive";
import type { RetrievalResult } from "@/lib/retrieval/contracts";
import type { ChatRequest } from "@/lib/chat/conversation";
const config = { key: "synthetic-unit-key", model: "deepseek-flash" as const };
const query = { kind: "search", entity: "artist", filters: [{ field: "name", value: "画师", mode: "contains" }], limit: 5 } as const;
function matched(): Extract<RetrievalResult, { status: "matched" }> {
  return { status: "matched", query: { ...query, filters: [...query.filters] }, candidates: [{ entity: "artist", id: id(1), rank: 0, matches: [{ field: "name", mode: "exact", column: "display_name" }] }], candidateLimitReached: false, traversal: "root-associations-v1", evidenceCompleteForReturnedGraph: true,
    graph: { artists: [row("artists", { id: id(1), display_name: "画师", biography: "生平记录", review_status: "disputed" })], artworks: [], images: [], artworkArtists: [],
      sources: [row("sources", { id: id(3), title: "同名来源" }), row("sources", { id: id(4), title: "同名来源" })],
      sourceLinks: [{ entity: "artist", entityId: id(1), row: row("artist_sources", { id: id(5), artist_id: id(1), source_id: id(3), supported_field: "biography", locator: "12" }) }, { entity: "artist", entityId: id(1), row: row("artist_sources", { id: id(6), artist_id: id(1), source_id: id(4), supported_field: "", locator: "" }) }] } };
}
function request(text = "介绍画师") { return { turnId: "q", messages: [{ id: "q", role: "user" as const, text }] }; }
const scopes: ReturnType<typeof createScope>[] = [];
const scope = () => { const s = createScope(); scopes.push(s); return s; };
afterEach(() => { scopes.forEach((s) => s.close()); scopes.length = 0; });
it.each([
  ["你好", "你好！想聊聊唐卡的哪方面？"],
  ["早上好", "早上好！有什么唐卡问题想一起看看？"],
  ["你能帮我做什么？", "我可以结合档案资料和相关知识，帮您理解唐卡题材、风格与作品背景。"],
])("preserves the model's contextual reply without inventing retrieval for %s", async (question, introduction) => {
  const complete = vi.fn(async (_config, stage, messages) => {
    expect(messages[0].content).toContain("answering Thangka questions");
    if (stage === "planner") return { content: { action: "answer", queries: [] }, usage: {} };
    expect(messages[0].content).toContain("available archive information and relevant knowledge");
    expect(messages[0].content).toContain("no fixed greeting script");
    expect(messages[0].content).toContain("a full capability introduction is optional");
    expect(messages[0].content).not.toContain("A suitable introduction is");
    expect(messages[0].content).toContain("without implying that this turn already retrieved records");
    const data = JSON.parse(messages[1].content);
    expect(data.retrievalStatus).toBe("not_searched");
    expect(data.catalogue).toEqual([]);
    return { content: { blocks: [{ kind: "general", text: introduction, evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn();
  const result = await generateAnswer(request(question), config, scope(), { complete, retrieve });
  expect(result.message.blocks).toEqual([{ kind: "general", text: introduction, evidenceKeys: [] }]);
  expect(result.message.references).toEqual([]);
  expect(result.message.notices).toEqual(["no_retrieval"]);
  expect(complete).toHaveBeenCalledTimes(2);
  expect(retrieve).not.toHaveBeenCalled();
});
it("supplies previous greetings to the model and preserves a fresh reply on the next greeting", async () => {
  const request: ChatRequest = { turnId: "greeting-1", messages: [{ id: "greeting-1", role: "user", text: "你好" }] };
  const replies = ["你好！想了解唐卡的什么内容？", "又见面了！接着聊些什么？"];
  const complete = vi.fn(async (_config, stage, messages) => {
    const payload = JSON.parse(messages[1].content);
    expect(payload.context).toEqual(request.messages.map(({ role, text }) => ({ role, text })));
    if (stage === "planner") return { content: { action: "answer", queries: [] }, usage: {} };
    expect(messages[0].content).toContain("avoid repeating its wording or capability list");
    expect(messages[0].content).toContain("prioritize that question");
    return { content: { blocks: [{ kind: "general", text: replies[request.messages.length === 1 ? 0 : 1], evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn();
  const first = await generateAnswer(request, config, scope(), { complete, retrieve });
  expect(first.message.blocks[0].text).toBe(replies[0]);
  request.turnId = "greeting-2";
  request.messages.push({ id: first.message.id, role: "assistant", text: first.message.text }, { id: "greeting-2", role: "user", text: "你好" });
  const second = await generateAnswer(request, config, scope(), { complete, retrieve });
  expect(second.message.blocks[0].text).toBe(replies[1]);
  expect(second.message.references).toEqual([]);
  expect(second.message.notices).toEqual(["no_retrieval"]);
  expect(complete).toHaveBeenCalledTimes(4);
  expect(retrieve).not.toHaveBeenCalled();
});
it("validates two long three-filter queries but refuses widened fields/limits/duplicates/extra instructions", () => {
  const long = { ...query, entity: "artwork", filters: ["name", "style", "subject"].map((field) => ({ field, value: "字".repeat(64), mode: "contains" })) };
  expect(parsePlan({ action: "answer", queries: [long, { ...long, filters: long.filters.map((f) => ({ ...f, value: "另".repeat(64) })) }] }).action).toBe("answer");
  for (const q of [{ ...query, limit: 6 }, { ...query, sql: "select" }, { ...query, filters: [{ field: "name", value: "字".repeat(65), mode: "exact" }] }, { ...query, filters: [{ field: "name", value: "https://evil.test", mode: "exact" }] }]) expect(() => parsePlan({ action: "answer", queries: [q] })).toThrow();
  expect(() => parsePlan({ action: "answer", queries: [query, query] })).toThrow();
  expect(() => parsePlan({ action: "clarify", question: "" })).toThrow();
});
it("deduplicates identical graphs, detects same-key drift in records/links/associations and preserves nulls", () => {
  const a = matched(), b = structuredClone(a);
  expect(mergeEvidence([a, b]).artists).toHaveLength(1);
  b.graph.artists[0] = { ...b.graph.artists[0], notes: "changed" };
  expect(() => mergeEvidence([a, b])).toThrow("evidence_changed");
  const c = structuredClone(a); c.graph.sourceLinks[0] = { entity: "artist", entityId: id(1), row: row("artist_sources", { id: id(5), artist_id: id(1), source_id: id(3), supported_field: "biography", locator: "99" }) };
  expect(() => mergeEvidence([a, c])).toThrow("evidence_changed");
  const d = structuredClone(a); a.graph.artworkArtists = [row("artwork_artists", { artwork_id: id(7), artist_id: id(1) })];
  d.graph.artworkArtists = [row("artwork_artists", { artwork_id: id(7), artist_id: id(1), attribution_status: "disputed" })];
  expect(() => mergeEvidence([a, d])).toThrow("evidence_changed");
});
it("builds deterministic native field-scoped facts and does not borrow association sources", () => {
  const m = matched(); m.graph.artworkArtists = [row("artwork_artists", { artwork_id: id(7), artist_id: id(1) })];
  const facts = buildCatalogue(mergeEvidence([m]));
  expect(facts.find((f) => f.field === "biography")!.sources).toHaveLength(2);
  expect(facts.find((f) => f.field === "display_name")!.sources).toHaveLength(1);
  expect(facts.filter((f) => f.owner.table === "artwork_artists").every((f) => !f.sources.length)).toBe(true);
  expect(facts.find((f) => f.field === "biography")!.reviewStatus).toBe("disputed");
});
it("uses two calls, real catalogue keys, scoped sources and fresh query provenance", async () => {
  const retrieve = vi.fn(async () => matched());
  const complete = vi.fn(async (_config, stage, messages) => {
    if (stage === "planner") return { content: { action: "answer", queries: [query] }, usage: {} };
    const data = JSON.parse(messages[1].content);
    expect(data.provenance[0].roots[0].id).toBe(id(1));
    const fact = data.catalogue.find((f: {field: string}) => f.field === "biography");
    return { content: { blocks: [{ kind: "archive", text: "档案生平存在争议。", evidenceKeys: [fact.key] }, { kind: "general", text: "通用知识需核实。", evidenceKeys: [] }] }, usage: {} };
  });
  const result = await generateAnswer(request(), config, scope(), { complete, retrieve });
  expect(complete).toHaveBeenCalledTimes(2); expect(retrieve).toHaveBeenCalledTimes(1);
  expect(result.message.references[0]).toMatchObject({ field: "biography", sources: [{ linkId: id(5) }, { linkId: id(6) }] });
  expect(result.message.notices).toEqual(["uncertain_records"]);
  expect(result.message.references[0]).not.toHaveProperty("evidenceNotes");
});
it.each(["clarify", "needs_image", "invalid"])("stops before retrieval/second call for %s", async (action) => {
  const complete = vi.fn(async () => ({ content: action === "clarify" ? { action, question: "请问哪位画师？" } : { action }, usage: {} }));
  const retrieve = vi.fn();
  if (action === "clarify") expect((await generateAnswer(request(), config, scope(), { complete, retrieve })).message.kind).toBe("clarification");
  else await expect(generateAnswer(request(), config, scope(), { complete, retrieve })).rejects.toThrow(action === "needs_image" ? "image_understanding_unavailable" : "invalid_model_output");
  expect(complete).toHaveBeenCalledTimes(1); expect(retrieve).not.toHaveBeenCalled();
});
it("reports no match without archive claims; strips all historical image contents", async () => {
  const complete = vi.fn(async (_c, stage, messages) => {
    expect(messages[1].content).not.toContain("secret-image-bytes");
    expect(messages[1].content).toContain("图片未被读取");
    return { content: stage === "planner" ? { action: "answer", queries: [query] } : { blocks: [{ kind: "general", text: "没有匹配记录，无法确认。", evidenceKeys: [] }] }, usage: {} };
  });
  const r = request(); r.messages.unshift({ id: "old", role: "user", text: "旧图", images: [{ data: "secret-image-bytes" }] } as never);
  const retrieve = vi.fn(async (): Promise<RetrievalResult> => ({ status: "no_matches", query: { ...query, filters: [...query.filters] }, candidates: [], candidateLimitReached: false }));
  expect((await generateAnswer(r, config, scope(), { complete, retrieve })).message.notices).toEqual(["no_matches", "image_history_omitted"]);
});
it.each(["retrieval_failed", "evidence_changed"])("does not answer partial evidence after %s", async (failure) => {
  const complete = vi.fn(async () => ({ content: { action: "answer", queries: [query, { kind: "lookup", entity: "artist", id: id(1) }] }, usage: {} }));
  const second = matched(); second.graph.artists[0] = { ...second.graph.artists[0], updated_at: "changed" };
  const retrieve = vi.fn().mockResolvedValueOnce(matched()).mockResolvedValueOnce(failure === "retrieval_failed" ? { status: "error", error: { code: "timeout" } } : second);
  await expect(generateAnswer(request(), config, scope(), { complete, retrieve })).rejects.toThrow(failure);
  expect(complete).toHaveBeenCalledTimes(1);
});
it("rejects fabricated keys without a paid repair; prompts demand semantic support beyond valid IDs", async () => {
  const complete = vi.fn().mockResolvedValueOnce({ content: { action: "answer", queries: [query] } }).mockResolvedValueOnce({ content: { blocks: [{ kind: "archive", text: "伪造", evidenceKeys: ["E999999"] }] } });
  await expect(generateAnswer(request(), config, scope(), { complete, retrieve: vi.fn(async () => matched()) })).rejects.toThrow("invalid_model_output");
  expect(complete).toHaveBeenCalledTimes(2);
  expect(ANSWER_PROMPT).toContain("EVERY archive claim");
  expect(ANSWER_PROMPT).toContain("never disguise unsupported archive claims");
});

it("does not crop long labels or silently exceed canonical reply budgets", async () => {
  const result = matched();
  result.graph.artists[0] = { ...result.graph.artists[0], display_name: "长".repeat(4000) };
  const complete = vi.fn(async (_c, stage, messages) => {
    const content = stage === "planner" ? { action: "answer", queries: [query] } : { blocks: [{ kind: "archive", text: "生平记录。", evidenceKeys: [JSON.parse(messages[1].content).catalogue.find((f: {field:string}) => f.field === "biography").key] }] };
    return { content, usage: {} };
  });
  await expect(generateAnswer(request(), config, scope(), { complete, retrieve: vi.fn(async () => result) })).rejects.toThrow("evidence_too_large");
});

it("rejects the observed needs-image extra-question variant without weakening the strict schema", async () => {
  const complete = vi.fn(async () => ({ content: { action: "needs_image", question: "请提供图片。" }, usage: {} }));
  const retrieve = vi.fn();
  await expect(generateAnswer(request("比较上面图片的设色"), config, scope(), { complete, retrieve })).rejects.toThrow("invalid_model_output");
  expect(complete).toHaveBeenCalledTimes(1);
  expect(retrieve).not.toHaveBeenCalled();
});

it.each([false, true])("supplies an authoritative search status rather than implying an empty archive: searched=%s", async (searched) => {
  const complete = vi.fn(async (_config, stage, messages) => {
    if (stage === "planner") return { content: { action: "answer", queries: searched ? [query] : [] }, usage: {} };
    const data = JSON.parse(messages[1].content);
    expect(data.retrievalStatus).toBe(searched ? "no_matches" : "not_searched");
    expect(data.catalogue).toEqual([]);
    return { content: { blocks: [{ kind: "general", text: "通用说明。", evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn(async (): Promise<RetrievalResult> => ({ status: "no_matches", query: { ...query, filters: [...query.filters] }, candidates: [], candidateLimitReached: false }));
  const result = await generateAnswer(request(), config, scope(), { complete, retrieve });
  expect(result.message.notices).toEqual([searched ? "no_matches" : "no_retrieval"]);
  expect(retrieve).toHaveBeenCalledTimes(searched ? 1 : 0);
});

it("rejects the observed later-block missing-key output without filling fields or adding paid repair calls", async () => {
  const complete = vi.fn().mockResolvedValueOnce({ content: { action: "answer", queries: [] }, usage: {} })
    .mockResolvedValueOnce({ content: { blocks: [
      { kind: "general", text: "题材指表现内容。", evidenceKeys: [] },
      { kind: "general", text: "风格指表现方式。" },
    ] }, usage: {} });
  const retrieve = vi.fn();
  await expect(generateAnswer(request("唐卡的题材和风格有什么区别？"), config, scope(), { complete, retrieve })).rejects.toThrow("invalid_model_output");
  expect(complete).toHaveBeenCalledTimes(2);
  expect(retrieve).not.toHaveBeenCalled();
});

it.each(["skipped", "overfiltered"])("executes the complete explicit name search against an empty archive after a %s plan", async (variant) => {
  const expected = { kind: "search", entity: "artwork", filters: [{ field: "name", mode: "exact", value: "合成作品17" }], limit: 5 };
  const complete = vi.fn(async (_c, stage, messages) => {
    const data = JSON.parse(messages[1].content);
    if (stage === "planner") {
      expect(data.requiredLookups).toEqual([expected]);
      return { content: { action: "answer", queries: variant === "skipped" ? [] : [{ ...expected, filters: [...expected.filters, { field: "subject", mode: "exact", value: "观音" }] }] }, usage: {} };
    }
    expect(data.retrievalStatus).toBe("no_matches");
    expect(data.catalogue).toEqual([]);
    expect(data.provenance[0].query).toEqual(expected);
    return { content: { blocks: [{ kind: "general", text: "本次未找到匹配档案，无法确认作者或年代。", evidenceKeys: [] }] }, usage: {} };
  });
  const retrieve = vi.fn(async (query): Promise<RetrievalResult> => ({ status: "no_matches", query, candidates: [], candidateLimitReached: false }));
  const result = await generateAnswer(request("作品《合成作品17》的作者和年代？"), config, scope(), { complete, retrieve });
  expect(retrieve).toHaveBeenCalledExactlyOnceWith(expected, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(complete).toHaveBeenCalledTimes(2);
  expect(result.message.notices).toEqual(["no_matches"]);
  expect(result.message.references).toEqual([]);
});
