// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST } from "./route";
const body = { turnId: "non-uuid-request", messages: [{ id: "non-uuid-request", role: "user", text: "介绍唐卡" }] };
const request = (value: unknown = body) => new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "X-Chat-Protocol": "2" }, body: JSON.stringify(value) });
beforeEach(() => { vi.stubEnv("DEEPSEEK_ENABLED", "true"); vi.stubEnv("DEEPSEEK_MODEL", "deepseek-flash"); vi.stubEnv("DEEPSEEK_API_KEY", "synthetic-route-key"); });
afterEach(() => vi.useRealTimers());
it("runs real route orchestration with mocked provider transport and canonical success", async () => {
  const fetch = vi.fn(async (_url, init) => {
    const p = JSON.parse(init.body);
    return Response.json({ choices: [{ finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(p.max_tokens === 1024 ? { action: "answer", queries: [] } : { blocks: [{ kind: "general", text: "唐卡是绘画艺术。", evidenceKeys: [] }] }) } }] });
  }); vi.stubGlobal("fetch", fetch);
  const response = await POST(request());
  expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toMatchObject({ turnId: body.turnId, message: { kind: "answer", notices: ["no_retrieval"] } });
  expect(fetch).toHaveBeenCalledTimes(2);
});
it("rejects context and untrusted extra properties before provider access", async () => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  const response = await POST(request({ ...body, messages: [{ ...body.messages[0], text: "x".repeat(2001) }] }));
  expect(response.status).toBe(422); expect(await response.json()).toEqual({ error: { code: "context_too_large" } });
  expect((await POST(request({ ...body, model: "override" }))).status).toBe(400);
  expect((await POST(request({ ...body, messages: [{ ...body.messages[0], citations: [] }] }))).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("times out a stalled request body from POST entry and cancels its reader", async () => {
  vi.useFakeTimers();
  const cancel = vi.fn();
  const stream = new ReadableStream({ cancel });
  const r = new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" } as RequestInit);
  const result = POST(r);
  await vi.advanceTimersByTimeAsync(55000);
  const response = await result;
  expect(response.status).toBe(504); expect(cancel).toHaveBeenCalledOnce();
  expect(await response.json()).toEqual({ error: { code: "generation_timeout" } });
});
