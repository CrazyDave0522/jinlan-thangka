// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { complete, providerConfig } from "./provider";
import { admit, createScope } from "./runtime";
import { LIMITS } from "./contracts";
const config = { key: "synthetic-unit-key", model: "deepseek-flash" as const };
const messages = [{ role: "system" as const, content: "JSON only" }, { role: "user" as const, content: "question" }];
const envelope = (content: unknown = { action: "answer", queries: [] }) => ({ choices: [{ finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(content) } }], usage: { prompt_tokens: 123, completion_tokens: 23, total_tokens: 146, injected: "secret" } });
let scope: ReturnType<typeof createScope>;
beforeEach(() => { scope = createScope(); vi.stubEnv("DEEPSEEK_ENABLED", "false"); });
afterEach(() => { scope.close(); vi.useRealTimers(); });
it("defaults off and validates model/key without sending requests", () => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  expect(() => providerConfig()).toThrow("generation_unavailable");
  vi.stubEnv("DEEPSEEK_ENABLED", "true"); vi.stubEnv("DEEPSEEK_API_KEY", "your-key");
  expect(() => providerConfig()).toThrow();
  vi.stubEnv("DEEPSEEK_API_KEY", config.key); vi.stubEnv("DEEPSEEK_MODEL", "automatic-upgrade");
  expect(() => providerConfig()).toThrow();
  vi.stubEnv("DEEPSEEK_MODEL", config.model); expect(providerConfig()).toEqual(config);
  expect(fetch).not.toHaveBeenCalled();
});
it("uses fixed endpoint, explicit nonthinking JSON whole output, caps and safe numeric usage", async () => {
  const fetch = vi.fn(async () => Response.json(envelope())); vi.stubGlobal("fetch", fetch);
  expect(await complete(config, "planner", messages, scope)).toEqual({ content: { action: "answer", queries: [] }, usage: { prompt_tokens: 123, completion_tokens: 23, total_tokens: 146 } });
  const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.deepseek.com/chat/completions");
  expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
  expect(JSON.parse(String(init.body))).toMatchObject({ stream: false, thinking: { type: "disabled" }, temperature: 0, max_tokens: 1024, response_format: { type: "json_object" } });
});
it.each([[401, "provider_unavailable"], [402, "provider_unavailable"], [403, "provider_unavailable"], [429, "provider_busy"], [500, "provider_failed"], [503, "provider_failed"]])("maps HTTP %s without exposing provider bodies or retrying", async (status, code) => {
  const fetch = vi.fn(async () => new Response("sensitive provider detail", { status: status as number })); vi.stubGlobal("fetch", fetch);
  await expect(complete(config, "answer", messages, scope)).rejects.toThrow(code as string);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it.each([{}, { choices: [] }, { ...envelope(), choices: [{ finish_reason: "length", message: { role: "assistant", content: "{}" } }] }, { ...envelope(), choices: [{ finish_reason: "stop", message: { role: "assistant", content: "" } }] }, { ...envelope(), choices: [{ finish_reason: "stop", message: { role: "assistant", content: "{truncated" } }] }])("rejects empty/truncated/malformed provider outputs %#", async (data) => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(data)));
  await expect(complete(config, "answer", messages, scope)).rejects.toThrow("invalid_model_output");
});
it("bounds raw responses and outgoing bytes before any provider call", async () => {
  const fetch = vi.fn(async () => new Response("x".repeat(LIMITS.providerBytes + 1))); vi.stubGlobal("fetch", fetch);
  await expect(complete(config, "answer", messages, scope)).rejects.toThrow("invalid_model_output");
  fetch.mockClear();
  await expect(complete(config, "planner", [{ role: "user", content: "字".repeat(22000) }], scope)).rejects.toThrow("context_too_large");
  await expect(complete(config, "answer", [{ role: "user", content: "字".repeat(44000) }], scope)).rejects.toThrow("evidence_too_large");
  expect(fetch).not.toHaveBeenCalled();
});
it("cleans up stage deadlines even if upstream ignores abort and settles late", async () => {
  vi.useFakeTimers();
  const fetch = vi.fn(() => new Promise<Response>((resolve) => setTimeout(() => resolve(Response.json(envelope())), 20000))); vi.stubGlobal("fetch", fetch);
  const result = complete(config, "planner", messages, scope);
  const assertion = expect(result).rejects.toThrow("generation_timeout");
  await vi.advanceTimersByTimeAsync(18000); await assertion;
  expect((fetch.mock.calls[0] as unknown as [unknown, RequestInit])[1].signal?.aborted).toBe(true);
  await vi.advanceTimersByTimeAsync(2000);
});
it("applies caller cancellation without retry and releases admission slots idempotently", async () => {
  const controller = new AbortController(); const local = createScope(controller.signal);
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  const result = complete(config, "planner", messages, local);
  controller.abort(new Error("caller-cancelled"));
  await expect(result).rejects.toThrow("caller-cancelled"); local.close();
  const a = admit(), b = admit(); expect(() => admit()).toThrow("busy"); a(); a(); const c = admit(); b(); c();
});
it("distinguishes invalid UTF-8 output from a transient response-stream network error", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array([0xff, 0xfe]))));
  await expect(complete(config, "answer", messages, scope)).rejects.toThrow("invalid_model_output");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error("network lost")); } }))));
  await expect(complete(config, "answer", messages, scope)).rejects.toThrow("provider_failed");
});
it("accepts the exact raw response byte cap and rejects one byte above", async () => {
  const body = JSON.stringify(envelope());
  const atLimit = body + " ".repeat(LIMITS.providerBytes - Buffer.byteLength(body));
  vi.stubGlobal("fetch", vi.fn(async () => new Response(atLimit)));
  await expect(complete(config, "planner", messages, scope)).resolves.toHaveProperty("content");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(atLimit + " ")));
  await expect(complete(config, "planner", messages, scope)).rejects.toThrow("invalid_model_output");
});
it("records numeric usage without credentials, prompts, response bodies or extra usage fields", async () => {
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(envelope())));
  await complete(config, "planner", messages, scope);
  expect(log).toHaveBeenCalledWith("ai_completion", expect.objectContaining({ stage: "planner", model: "deepseek-flash", usage: { prompt_tokens: 123, completion_tokens: 23, total_tokens: 146 } }));
  expect(JSON.stringify(log.mock.calls)).not.toContain(config.key);
  expect(JSON.stringify(log.mock.calls)).not.toContain("question");
  expect(JSON.stringify(log.mock.calls)).not.toContain("secret");
});
it("separates image stages, output allowances and full versus text-envelope caps", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json(envelope())); vi.stubGlobal("fetch", fetch);
  const part = { type: "image_url" as const, image_url: { url: "data:image/png;base64,YQ==", detail: "original" as const } };
  for (const [stage, expected] of [["analysis", 2048], ["image_answer", 1536], ["verification", 3072]] as const) {
    await complete(config, stage, [{ role: "user", content: stage === "image_answer" ? "text only" : [{ type: "text", text: "bounded context" }, part] }], scope);
    expect(JSON.parse(String(fetch.mock.calls.at(-1)?.[1]?.body)).max_tokens).toBe(expected);
    expect(JSON.parse(String(fetch.mock.calls.at(-1)?.[1]?.body)).temperature).toBe(0);
  }
  fetch.mockClear();
  await expect(complete(config, "image_answer", [{ role: "user", content: [part] }], scope)).rejects.toThrow("evidence_too_large");
  await expect(complete(config, "analysis", [{ role: "user", content: Array(5).fill(part) }], scope)).rejects.toThrow("context_too_large");
  await expect(complete(config, "verification", [{ role: "user", content: Array(9).fill(part) }], scope)).rejects.toThrow("evidence_too_large");
  await expect(complete(config, "analysis", [{ role: "user", content: [{ type: "text", text: "x".repeat(64_001) }] }], scope)).rejects.toThrow("context_too_large");
  await expect(complete(config, "analysis", [{ role: "user", content: [{ ...part, image_url: { ...part.image_url, url: "data:image/png;base64," + "A".repeat(3_000_000) } }] }], scope)).rejects.toThrow("context_too_large");
  await expect(complete(config, "verification", [{ role: "user", content: [{ ...part, image_url: { ...part.image_url, url: "data:image/png;base64," + "A".repeat(6_000_000) } }] }], scope)).rejects.toThrow("evidence_too_large");
  expect(fetch).not.toHaveBeenCalled();
});
