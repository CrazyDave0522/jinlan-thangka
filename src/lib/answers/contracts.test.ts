import { describe, expect, it } from "vitest";
import { assistant } from "../../../tests/fixtures/answer";
import { archiveId } from "../../../tests/fixtures/archive";
import { canonical, contextValid, jsonBytes, parseAssistant, parseBlocks, retryable, type AnswerReference } from "./contracts";

const ref: AnswerReference = { key: "E1", owner: { table: "artists", id: archiveId(1) }, label: "画师", field: "biography", value: "生平", reviewStatus: "pending", attributionStatus: null, sources: [] };
function grounded() {
  const message = assistant();
  if (message.kind !== "answer") throw new Error();
  message.blocks = [{ kind: "archive", text: "档案生平", evidenceKeys: ["E1"] }];
  message.references = [structuredClone(ref)];
  message.notices = ["record_only", "uncertain_records"];
  message.text = canonical(message);
  return message;
}
describe("public answer contract", () => {
  it("round trips canonical Chinese evidence indexes and notices exactly once", () => {
    const m = grounded();
    expect(parseAssistant(m)).toEqual(m);
    expect(m.text).toContain("记录索引：[E1] 画师 / 生平");
    expect(m.text).not.toContain("biography");
  });
  it.each([
    (m: ReturnType<typeof grounded>) => { m.references = []; },
    (m: ReturnType<typeof grounded>) => { m.references.push(m.references[0]); },
    (m: ReturnType<typeof grounded>) => { m.references[0].key = "E2"; },
    (m: ReturnType<typeof grounded>) => { m.references[0].owner = { table: "artists", id: "not-uuid" }; },
    (m: ReturnType<typeof grounded>) => { m.references[0].field = "nonexistent"; },
    (m: ReturnType<typeof grounded>) => { m.references[0].attributionStatus = "confirmed"; },
    (m: ReturnType<typeof grounded>) => { m.references[0].sources = [{ linkTable: "artwork_sources", linkId: archiveId(3), sourceId: archiveId(4), title: "来源", supportedField: "biography", locator: "12" }]; },
    (m: ReturnType<typeof grounded>) => { m.text += "tampered"; },
    (m: ReturnType<typeof grounded>) => { m.notices = ["no_retrieval"]; },
  ])("rejects invalid cross-scope or canonical variants %#", (change) => {
    const m = grounded(); change(m); expect(() => parseAssistant(m)).toThrow();
  });
  it("rejects extra fields, null arrays and legacy success", () => {
    expect(() => parseAssistant({ ...assistant(), tool: "hidden" })).toThrow();
    expect(() => parseAssistant({ ...assistant(), notices: null })).toThrow();
    expect(() => parseAssistant({ id: archiveId(3), role: "assistant", text: "旧格式" })).toThrow();
  });
  it("accepts clarification with image notice and no answer facts", () => {
    const m = { id: archiveId(3), role: "assistant" as const, kind: "clarification" as const, question: "哪位画师？", blocks: [] as [], references: [] as [], notices: ["image_history_omitted" as const], text: "" };
    m.text = canonical(m); expect(parseAssistant(m)).toEqual(m);
    expect(() => parseAssistant({ ...m, question: "" })).toThrow();
  });
  it("bounds block text with Unicode code points and rejects URLs/extra model objects", () => {
    const b = { kind: "general", text: "🪷".repeat(2000), evidenceKeys: [] };
    expect(parseBlocks({ blocks: [b] })).toHaveLength(1);
    for (const input of [{ blocks: [{ ...b, text: b.text + "字" }] }, { blocks: [] }, { blocks: [{ ...b, text: "https://example.com" }] }, { blocks: [{ ...b, source: {} }] }, { blocks: [{ ...b, evidenceKeys: ["E1"] }] }]) expect(() => parseBlocks(input)).toThrow();
  });
});
it("enforces context independently of serialized bytes and permits three long pairs", () => {
  const pairs = Array.from({ length: 3 }, () => [{ text: "字".repeat(600) }, { text: "字".repeat(3500) }]).flat();
  expect(contextValid([...pairs, { text: "字".repeat(600) }])).toBe(true);
  expect(contextValid([{ text: "x".repeat(14000) }, { text: "x".repeat(2000) }])).toBe(true);
  expect(contextValid([{ text: "x".repeat(14001) }, { text: "x".repeat(2000) }])).toBe(false);
  expect(contextValid([{ text: "🪷".repeat(2001) }])).toBe(false);
  expect(contextValid(Array.from({ length: 32 }, () => ({ text: "x" })))).toBe(true);
  expect(contextValid(Array.from({ length: 33 }, () => ({ text: "x" })))).toBe(false);
  expect(jsonBytes({ text: "字" })).toBeGreaterThan(jsonBytes({ text: "x" }));
});
it("keeps deterministic failures out of identical retry", () => {
  for (const code of ["invalid_model_output", "retrieval_failed", "image_understanding_unavailable", "generation_unavailable", "provider_unavailable", "context_too_large"] as const) expect(retryable(code)).toBe(false);
  for (const code of [undefined, "busy", "provider_busy", "provider_failed", "evidence_changed", "generation_timeout"] as const) expect(retryable(code)).toBe(true);
});
it("enforces exact block/key caps and deterministic public notice order", () => {
  const general = { kind: "general", text: "说明", evidenceKeys: [] };
  expect(parseBlocks({ blocks: Array.from({ length: 8 }, () => general) })).toHaveLength(8);
  expect(() => parseBlocks({ blocks: Array.from({ length: 9 }, () => general) })).toThrow();
  const archive = { kind: "archive", text: "依据", evidenceKeys: Array.from({ length: 8 }, (_, i) => `E${i + 1}`) };
  expect(parseBlocks({ blocks: [archive] })).toHaveLength(1);
  expect(() => parseBlocks({ blocks: [{ ...archive, evidenceKeys: [...archive.evidenceKeys, "E9"] }] })).toThrow();
  expect(() => parseBlocks({ blocks: [{ ...archive, evidenceKeys: ["E1", "E1"] }] })).toThrow();
  const m = grounded();
  expect(() => parseAssistant({ ...m, notices: ["uncertain_records", "record_only"] })).toThrow();
  expect(() => parseAssistant({ ...m, notices: ["record_only", "record_only"] })).toThrow();
});
