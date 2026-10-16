import { assistant } from "../../../tests/fixtures/answer";
import { describe, expect, it } from "vitest";
import { createRequest, isChatRequest, parseChatResponse, type Turn } from "./conversation";
const user = { id: "q", role: "user" as const, text: "问题" };
const request = { turnId: "q", messages: [user] };

describe("text conversation contract", () => {
  it.each([null, {}, { ...request, messages: [] }, { ...request, turnId: "wrong" },
    { ...request, messages: [user, user] }, { ...request, messages: [{ ...user, role: "system" }] },
    { ...request, messages: [{ ...user, text: " \n " }] }, { ...request, messages: [{ ...user, id: " " }] },
    { ...request, messages: [{ ...user, role: "assistant" }] }, { ...request, messages: [null] },
  ])("rejects malformed requests: %j", (value) => expect(isChatRequest(value)).toBe(false));
  it("allows consecutive user messages", () => {
    expect(isChatRequest({ turnId: "next", messages: [user, { ...user, id: "next" }] })).toBe(true);
  });
  it("snapshots completed pairs only, omitting failures and pending turns", () => {
    const turns: Turn[] = ["completed", "failed", "pending", "unavailable"].map((status, index) => ({
      user: { ...user, id: `q${index}` }, request, status: status as Turn["status"],
      ...(status === "completed" ? { answer: { id: "a", role: "assistant" as const, text: "回答" } } : {}),
    }));
    const snapshot = createRequest(turns, user);
    expect(snapshot.messages.map((message) => message.id)).toEqual(["q0", "a", "q"]);
    turns[0].user.text = "edited";
    expect(snapshot.messages[0].text).toBe("问题");
  });
  it("accepts only explicit unavailable or a matched, valid, noncolliding assistant answer", () => {
    expect(parseChatResponse(503, { error: { code: "generation_unavailable" } }, request, ["q"]).status).toBe("unavailable");
    expect(parseChatResponse(200, { turnId: "q", message: assistant("回答") }, request, ["q"]).status).toBe("completed");
  });
  it.each([
    [503, {}], [500, { error: { code: "generation_unavailable" } }],
    [200, { turnId: "other", message: { id: "a", role: "assistant", text: "回答" } }],
    ...[{ id: "q", role: "assistant", text: "回答" }, { id: "a", role: "user", text: "回答" }, { id: "a", role: "assistant", text: " " }].map((message): [number, unknown] => [200, { turnId: "q", message }]),
  ])("rejects response %j %j", (status, body) => {
    expect(() => parseChatResponse(status as number, body, request, ["q"])).toThrow();
  });
});
