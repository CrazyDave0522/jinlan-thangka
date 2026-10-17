// @vitest-environment node
import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const decode = vi.hoisted(() => ({ metadata: vi.fn(), raw: vi.fn(() => ({ toBuffer: async () => new Uint8Array() })) }));
vi.mock("sharp", () => ({ default: () => decode }));
import { POST } from "./route";
import { imageRequest } from "../../../../tests/helpers/image-request";
it("ignores late native image work and never starts a provider after the shared deadline", async () => {
  const actual = await vi.importActual<typeof import("sharp")>("sharp");
  const bytes = await actual.default({ create: { width: 10, height: 10, channels: 3, background: "white" } }).png().toBuffer();
  let finish!: (value: unknown) => void;
  decode.metadata.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  vi.stubEnv("DEEPSEEK_ENABLED", "true");
  vi.useFakeTimers();
  try {
    const request = new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(imageRequest([{ id: "q", role: "user", text: "看图", images: [{ id: "i", mimeType: "image/png", width: 10, height: 10, data: bytes.toString("base64") }] }])) });
    const result = POST(request);
    await vi.advanceTimersByTimeAsync(55000);
    const response = await result;
    expect(response.status).toBe(504);
    finish({ pages: 1 });
    await Promise.resolve(); await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();
  } finally { vi.useRealTimers(); }
});
