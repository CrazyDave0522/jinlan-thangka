// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { POST } from "./route";

afterEach(() => vi.unstubAllGlobals());
it("returns unavailable without contacting any external service", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const response = await POST(new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
    turnId: "second", messages: [{ id: "first", role: "user", text: "问题一" }, { id: "second", role: "user", text: "问题二" }],
  }) }));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: { code: "generation_unavailable" } });
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["{invalid", "null", JSON.stringify({ turnId: "q", messages: [{ id: "q", role: "system", text: "bad" }] }),
  JSON.stringify({ turnId: "q", messages: [{ id: "q", role: "user", text: " " }] }),
  JSON.stringify({ turnId: "wrong", messages: [{ id: "q", role: "user", text: "问题" }] }),
])("rejects invalid input without caching: %s", async (body) => {
  const response = await POST(new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: { code: "invalid_request" } });
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
