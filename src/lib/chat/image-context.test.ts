import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { createSnapshot, encodeSnapshot, parseResponseV2, preflight, rereadSnapshot, snapshotSize, wireSnapshot, type ImageTurn } from "./image-context";
import type { LocalImage } from "./image-policy";
import { successV2 } from "../../../tests/fixtures/vision";
import { canonicalImage } from "@/lib/vision/output";

function image(id = "picture"): LocalImage { return { id, mimeType: "image/png", width: 1, height: 1, blob: new Blob([new Uint8Array([1, 2, 3, 4])]), url: `blob:${id}` }; }
it("encodes only selected bytes, binds actual hashes and predicts exact UTF-8 body size", async () => {
  const local = image(), user = { id: "q", role: "user" as const, text: "图片🪷", images: [local] };
  const snapshot = createSnapshot([], user, new Map([[local.id, 2]]));
  const encoded = await encodeSnapshot(snapshot, new AbortController().signal);
  expect(new TextEncoder().encode(encoded.body).byteLength).toBe(snapshotSize(snapshot));
  expect(encoded.request.images[0]).toMatchObject({ ownerMessageId: "q", displayIndex: 2, sha256: createHash("sha256").update(new Uint8Array([1, 2, 3, 4])).digest("hex") });
  const answer = successV2(encoded.request).message;
  const turn: ImageTurn = { user, request: { ...snapshot, images: encoded.request.images }, status: "completed", answer };
  const follow = createSnapshot([turn], { id: "next", role: "user", text: "继续说明" }, new Map([[local.id, 2]]));
  expect(follow.inputs).toEqual([]); expect(follow.observations).toEqual(answer.observations);
  const next = await encodeSnapshot(follow, new AbortController().signal);
  expect(next.body).not.toContain(encoded.request.inputs[0].data); expect(next.request.messages[0].imageIds).toEqual(["picture"]);
  expect(next.request.images[0].displayIndex).toBe(2);
  const reselected = createSnapshot([turn], { id: "selected", role: "user", text: "重看", images: [local] }, new Map([[local.id, 2]]));
  const selected = await encodeSnapshot(reselected, new AbortController().signal);
  expect(reselected.inputs[0]).toBe(local);
  expect(selected.request.images[0]).toEqual(encoded.request.images[0]);
  expect(selected.request.inputs).toEqual(encoded.request.inputs);
});
it("retains failure label gaps while excluding failed pictures and their observations", () => {
  const failed = image("failed"), kept = image("kept"), labels = new Map([["failed", 1], ["kept", 2]]);
  const user = { id: "bad", role: "user" as const, text: "问题", images: [failed] };
  const turn: ImageTurn = { user, request: createSnapshot([], user, labels), status: "failed" };
  const next = createSnapshot([turn], { id: "next", role: "user", text: "新问题", images: [kept] }, labels);
  expect(next.messages).toHaveLength(1); expect(next.images.map((i) => [i.id, i.displayIndex])).toEqual([["kept", 2]]);
});
it("captures completed pairs once and excludes failed, pending and unavailable turns without retaining mutable message text", () => {
  const turns: ImageTurn[] = ["completed", "failed", "pending", "unavailable"].map((status, n) => {
    const user = { id: `q${n}`, role: "user" as const, text: "问题" }, request = createSnapshot([], user, new Map());
    return { user, request, status: status as ImageTurn["status"], ...(status === "completed" ? { answer: successV2(wireSnapshot(request)).message } : {}) };
  });
  const snapshot = createSnapshot(turns, { id: "next", role: "user", text: "继续" }, new Map());
  expect(snapshot.messages.map((m) => m.id)).toEqual(["q0", turns[0].answer!.id, "next"]);
  turns[0].user.text = "edited";
  expect(snapshot.messages[0].text).toBe("问题");
});
it("rereads the captured source pair without merging later history or composer contents", async () => {
  const local = image(), labels = new Map([[local.id, 1]]), user = { id: "q", role: "user" as const, text: "查看角落文字", images: [local] };
  const request = createSnapshot([], user, labels), wire = wireSnapshot(request);
  const answer = successV2(wire).message;
  const clarification = { ...answer, kind: "clarification" as const, question: "需要重看图片。", blocks: [], references: [], observations: [], groups: [], notices: [], referenceImages: [], comparisons: [], reread: { sourceTurnId: "q", sourceAssistantId: answer.id, imageIds: [local.id] } };
  clarification.text = canonicalImage(clarification, wire);
  const source: ImageTurn = { user, request, status: "completed", answer: clarification };
  const reread = rereadSnapshot(source, (id) => id === local.id ? local : undefined);
  expect(reread.user.id).not.toBe("q"); expect(reread.request.messages.map((m) => m.id)).toEqual(["q", answer.id, reread.user.id]);
  expect(reread.user.text).toBe(user.text); expect(reread.request.intent).toMatchObject({ kind: "reread", sourceTurnId: "q" });
  expect(() => rereadSnapshot(source, () => undefined)).toThrow("Missing retained image");
  expect(source.request.messages).toHaveLength(1);
});
it("rejects stale successes, wrong canonical text, forged origins and unused references before commit", () => {
  const snapshot = createSnapshot([], { id: "q", role: "user", text: "文字" }, new Map());
  const request = wireSnapshot(snapshot), valid = successV2(request);
  expect(parseResponseV2(200, valid, request, []).status).toBe("completed");
  for (const invalid of [{ turnId: "q", message: valid.message }, { ...valid, version: 1 }, { ...valid, message: { ...valid.message, text: "另一个文本" } }, { ...valid, message: { ...valid.message, extra: true } }]) expect(() => parseResponseV2(200, invalid, request, [])).toThrow();
  expect(() => parseResponseV2(200, valid, request, [valid.message.id])).toThrow();
  expect(() => parseResponseV2(503, { error: { code: "reference_failed" } }, request, [])).toThrow();
});
it("enforces combined observation context and preflight before image encoding", () => {
  const snapshot = createSnapshot([], { id: "q", role: "user", text: "字".repeat(2001), images: [image()] }, new Map([["picture", 1]]));
  expect(() => preflight(snapshot)).toThrow("context_too_large");
  const tooMany = createSnapshot([], { id: "q", role: "user", text: "比较", images: Array.from({ length: 5 }, (_, n) => image(`i${n}`)) }, new Map(Array.from({ length: 5 }, (_, n) => [`i${n}`, n + 1])));
  expect(() => preflight(tooMany)).toThrow("image_context_too_large");
});
it("accepts explicit unavailable responses and rejects mismatched status, role, identity and blank answers", () => {
  const request = wireSnapshot(createSnapshot([], { id: "q", role: "user", text: "问题" }, new Map()));
  const valid = successV2(request);
  expect(parseResponseV2(503, { error: { code: "generation_unavailable" } }, request, []).status).toBe("unavailable");
  for (const [status, body] of [
    [503, {}], [500, { error: { code: "generation_unavailable" } }],
    [200, { ...valid, turnId: "other" }],
    ...[{ ...valid.message, id: "q" }, { ...valid.message, role: "user" }, { ...valid.message, text: " " }].map((message) => [200, { ...valid, message }]),
  ] as [number, unknown][]) expect(() => parseResponseV2(status, body, request, ["q"])).toThrow();
});
