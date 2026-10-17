import { describe, expect, it } from "vitest";
import { parseImagePlan, parseObservationBody, parseRequest } from "./validation";
import type { ImageRequest } from "./types";

const assistantId = "10000000-0000-0000-0000-000000000001";
export const observation = { imageId: "picture", facts: [{ text: "中央有一位人物。", region: "center" as const }], readings: [], interpretations: [], limitations: [] };
export function request(): ImageRequest { return { version: 2, turnId: "q", messages: [{ id: "q", role: "user", text: "请解读", imageIds: [] }], images: [], inputs: [], observations: [], sameWorkSets: [], intent: { kind: "question" } }; }
export function imageRequest(): ImageRequest { const r = request(); r.messages[0].imageIds = ["picture"]; r.images = [{ id: "picture", ownerMessageId: "q", displayIndex: 1, mimeType: "image/png", width: 1, height: 1, sha256: "a".repeat(64) }]; r.inputs = [{ imageId: "picture", data: "YQ==" }]; return r; }
describe("versioned selected-image contracts", () => {
  it("rejects malformed current message shapes and permits consecutive textual user entries", () => {
    const base = request(), user = base.messages[0];
    for (const invalid of [null, {}, { ...base, messages: [] }, { ...base, turnId: "wrong" },
      { ...base, messages: [user, user] }, { ...base, messages: [{ ...user, role: "system" }] },
      { ...base, messages: [{ ...user, text: " \n " }] }, { ...base, messages: [{ ...user, id: " " }] },
      { ...base, messages: [{ ...user, role: "assistant" }] }, { ...base, messages: [null] },
    ]) expect(() => parseRequest(invalid)).toThrow("invalid_request");
    const consecutive = { ...base, turnId: "next", messages: [user, { ...user, id: "next" }] };
    expect(parseRequest(consecutive).messages).toHaveLength(2);
  });
  it("supports image-only and four-input v2 questions while rejecting malformed image manifests", () => {
    const base = imageRequest(); base.messages[0].text = "";
    expect(parseRequest(base).inputs).toHaveLength(1);
    const images = Array.from({ length: 4 }, (_, n) => ({ ...base.images[0], id: `image-${n}`, displayIndex: n + 1 }));
    const four = { ...base, images, messages: [{ ...base.messages[0], imageIds: images.map((i) => i.id) }], inputs: images.map((i) => ({ imageId: i.id, data: "YQ==" })) };
    expect(parseRequest(four).inputs).toHaveLength(4);
    expect(parseRequest(request()).images).toEqual([]);
    for (const invalid of [
      { ...base, images: [], inputs: [], messages: [{ ...base.messages[0], imageIds: [] }] },
      { ...base, images: [null] },
      ...[{ width: 0 }, { height: 1.5 }, { mimeType: "image/webp" }].map((change) => ({ ...base, images: [{ ...base.images[0], ...change }] })),
      { ...base, images: [base.images[0], base.images[0]] },
      { ...four, inputs: [...four.inputs, { imageId: "fifth", data: "YQ==" }] },
      { ...base, messages: [{ ...base.messages[0], role: "assistant", text: "回答" }] },
    ]) expect(() => parseRequest(invalid)).toThrow();
  });
  it("trims submitted edges and accepts a whitespace-only image question without hiding forbidden controls", () => {
    const r = imageRequest(); r.messages[0].text = "  \n ";
    expect(parseRequest(r).messages[0].text).toBe("");
    expect(() => parseRequest({ ...r, messages: [{ ...r.messages[0], text: "\u000b问题" }] })).toThrow("invalid_request");
  });
  it("counts exactly 300 observation text points and rejects the next point", () => {
    const facts = ["甲", "乙", "丙"].map((s) => ({ text: s.repeat(80), region: "whole" }));
    const body = { ...observation, facts, interpretations: [{ text: "丁".repeat(60), certainty: "tentative" }] };
    expect(parseObservationBody(body).interpretations[0].text).toHaveLength(60);
    expect(() => parseObservationBody({ ...body, interpretations: [{ text: "丁".repeat(61), certainty: "tentative" }] })).toThrow("invalid_model_output");
  });
  it("requires an explicit identity effect on each limitation and counts its text in the same budget", () => {
    const limitation = { text: "标签与作品本体存在冲突。", affectsIdentity: true };
    expect(parseObservationBody({ ...observation, limitations: [limitation] }).limitations).toEqual([limitation]);
    for (const invalid of [limitation.text, { text: limitation.text }, { ...limitation, affectsIdentity: "true" }, { ...limitation, extra: true }]) {
      expect(() => parseObservationBody({ ...observation, limitations: [invalid] })).toThrow("invalid_model_output");
    }
    const body = { ...observation, facts: ["甲", "乙", "丙"].map((s) => ({ text: s.repeat(80), region: "whole" })), limitations: [{ text: "丁".repeat(60), affectsIdentity: false }] };
    expect(parseObservationBody(body).limitations[0].text).toHaveLength(60);
    expect(() => parseObservationBody({ ...body, limitations: [{ text: "丁".repeat(61), affectsIdentity: false }] })).toThrow("invalid_model_output");
  });
  it("fits 12,900 transcript points plus 3,100 observation points, but rejects one more", () => {
    const r = request(); r.messages = [];
    for (let n = 0; n < 3; n++) {
      const userId = `prior-${n}`, assistantId = `10000000-0000-0000-0000-${String(n + 1).padStart(12, "0")}`;
      const ids = Array.from({ length: n === 2 ? 3 : 4 }, (_, j) => `p${n * 4 + j}`);
      r.messages.push({ id: userId, role: "user", text: "问".repeat(600), imageIds: ids }, { id: assistantId, role: "assistant", text: "答".repeat(3500), imageIds: [] });
      for (const imageId of ids) {
        const index = r.images.length;
        r.images.push({ id: imageId, ownerMessageId: userId, displayIndex: index + 1, mimeType: "image/png", width: 1, height: 1, sha256: "a".repeat(64) });
        r.observations.push({ imageId, id: `20000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`, imageSha256: "a".repeat(64), originTurnId: userId, originAssistantId: assistantId, pass: "analysis", supersedes: null,
          facts: (index < 10 ? ["甲", "乙", "丙"] : ["甲"]).map((s) => ({ text: s.repeat(80), region: "whole" })), readings: [], interpretations: [{ text: "丁".repeat(index < 10 ? 60 : 20), certainty: "tentative" }], limitations: [] });
      }
    }
    r.messages.push({ id: r.turnId, role: "user", text: "续".repeat(600), imageIds: [] });
    expect(parseRequest(r).observations).toHaveLength(11);
    r.observations[10].interpretations[0].text += "丁";
    expect(() => parseRequest(r)).toThrow("context_too_large");
  });
  it("rejects stale bodies before generation and requires explicit minimal-text opt-in", () => {
    const minimal = { turnId: "q", messages: [{ id: "q", role: "user", text: "问题" }] };
    expect(() => parseRequest(minimal)).toThrow(expect.objectContaining({ code: "invalid_request" }));
    expect(parseRequest(minimal, "2").version).toBe(2);
    expect(() => parseRequest(request(), "3")).toThrow();
    expect(() => parseRequest({ ...request(), extra: true })).toThrow();
  });
  it("validates original ownership, selection and observation origins independently", () => {
    const r = imageRequest();
    r.messages = [{ ...r.messages[0], id: "old" }, { id: assistantId, role: "assistant", text: "此前答复", imageIds: [] }, { id: "q", role: "user", text: "继续", imageIds: [] }];
    r.images[0].ownerMessageId = "old"; r.inputs = [];
    r.observations = [{ ...observation, id: "20000000-0000-0000-0000-000000000002", imageSha256: "a".repeat(64), originTurnId: "old", originAssistantId: assistantId, pass: "analysis", supersedes: null }];
    expect(parseRequest(r).inputs).toEqual([]);
    expect(() => parseRequest({ ...r, observations: [{ ...r.observations[0], originTurnId: "q" }] })).toThrow(expect.objectContaining({ code: "invalid_image_context" }));
    expect(() => parseRequest({ ...r, inputs: [{ imageId: "picture", data: "YQ==" }] })).toThrow();
  });
  it("shares the context budget with bounded observations and preserves unreadable uncertainty", () => {
    for (const text of ["猜测", "画面有细密文字，内容未能辨认。"])
      expect(() => parseObservationBody({ ...observation, readings: [{ kind: "inscription", certainty: "unreadable", region: "whole", text }] })).toThrow("invalid_model_output");
    expect(parseObservationBody({ ...observation, readings: [{ kind: "inscription", certainty: "unreadable", region: "whole", text: "未能辨认" }] }).readings[0].certainty).toBe("unreadable");
    expect(() => parseObservationBody({ ...observation, facts: Array.from({ length: 4 }, (_, n) => ({ text: `${n}${"字".repeat(75)}`, region: "whole" })) })).toThrow();
    const r = request(); r.messages[0].text = "字".repeat(2001);
    expect(() => parseRequest(r)).toThrow(expect.objectContaining({ code: "context_too_large" }));
  });
  it("validates image/query provenance and merges only disjoint image-group duplicates", () => {
    const r = imageRequest();
    r.images.push({ ...r.images[0], id: "second", displayIndex: 2 }); r.messages[0].imageIds.push("second"); r.inputs.push({ imageId: "second", data: "YQ==" });
    const groups = r.inputs.map((i, n) => ({ id: `G${n + 1}`, imageIds: [i.imageId], representativeImageId: i.imageId, task: "identify", search: "planned" }));
    const query = { kind: "search", entity: "artwork", filters: [{ field: "subject", value: "观音", mode: "exact" }], limit: 5 };
    const plan = { action: "answer", observations: [observation, { ...observation, imageId: "second" }], groups, queries: groups.map((g) => ({ query, groupIds: [g.id] })) };
    const parsed = parseImagePlan(plan, r);
    expect(parsed.action === "answer" && parsed.queries[0].groupIds).toEqual(["G1", "G2"]);
    expect(() => parseImagePlan({ ...plan, queries: [plan.queries[0], plan.queries[0]] }, r)).toThrow();
    expect(() => parseImagePlan({ ...plan, groups: [{ ...groups[0], imageIds: ["picture", "second"] }] }, r)).toThrow();
  });
  it("rejects provider-format wrappers and fresh observations based only on historical descriptors", () => {
    const current = imageRequest();
    const plan = { action: "answer", observations: [observation], groups: [{ id: "G1", imageIds: ["picture"], representativeImageId: "picture", task: "interpret", search: "not_requested" }], queries: [] };
    expect(parseImagePlan(plan, current).action).toBe("answer");
    expect(() => parseImagePlan({ type: "json_object", ...plan }, current)).toThrow("invalid_model_output");
    const follow = { ...current, turnId: "next", inputs: [], messages: [...current.messages, { id: assistantId, role: "assistant" as const, text: "此前观察", imageIds: [] }, { id: "next", role: "user" as const, text: "重看左下角文字", imageIds: [] }] };
    expect(parseRequest(follow).inputs).toEqual([]);
    expect(() => parseImagePlan(plan, follow)).toThrow("invalid_model_output");
    expect(parseImagePlan({ action: "needs_image", imageIds: ["picture"] }, follow)).toEqual({ action: "needs_image", imageIds: ["picture"] });
  });
});
