// @vitest-environment node
import sharp from "sharp";
import { expect, it, vi } from "vitest";
import { POST } from "./route";
import { IMAGE_LIMITS } from "@/lib/chat/image-policy";
async function attachment() {
  const bytes = await sharp({ create: { width: 100, height: 80, channels: 4, background: "#c06080" } }).png().toBuffer();
  return { id: "i", mimeType: "image/png", width: 100, height: 80, data: bytes.toString("base64") };
}
function request(images: unknown, headers = { "Content-Type": "application/json" }) {
  return new Request("http://localhost/api/chat", { method: "POST", headers, body: JSON.stringify({ turnId: "q", messages: [{ id: "q", role: "user", text: "", images }] }) });
}
async function outcome(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ error: { code } });
}
it("decodes a real image-only set without contacting storage/providers or persisting files", async () => {
  const fetch = vi.spyOn(global, "fetch").mockRejectedValue(new Error("unexpected external call"));
  await outcome(await POST(request([await attachment()])), 503, "generation_unavailable");
  expect(fetch).not.toHaveBeenCalled();
  fetch.mockRestore();
});
it("accepts four images and a mixed text/image history", async () => {
  const images = await Promise.all(Array.from({ length: 4 }, async (_, i) => ({ ...await attachment(), id: `${i}` })));
  await outcome(await POST(request(images)), 503, "generation_unavailable");
  const body = { turnId: "next", messages: [{ id: "q", role: "user", text: "", images }, { id: "next", role: "user", text: "比较一下" }] };
  await outcome(await POST(new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) })), 503, "generation_unavailable");
});
it("rejects noncanonical base64, content disagreement, corrupt data and prepared limits", async () => {
  const image = await attachment();
  for (const invalid of [
    { ...image, data: "!!!!" }, { ...image, data: image.data + "\n" }, { ...image, data: "" },
    { ...image, data: Buffer.from("not an image").toString("base64") }, { ...image, width: 101 },
    { ...image, mimeType: "image/jpeg" }, { ...image, data: Buffer.alloc(IMAGE_LIMITS.preparedBytes + 1).toString("base64") },
  ]) await outcome(await POST(request([invalid])), 422, "invalid_image");
  const large = await sharp({ create: { width: 1601, height: 1, channels: 3, background: "white" } }).png().toBuffer();
  await outcome(await POST(request([{ ...image, width: 1601, height: 1, data: large.toString("base64") }])), 422, "invalid_image");
});
it("returns 400 for invalid metadata/roles/counts and 415 for non-JSON", async () => {
  const image = await attachment();
  for (const images of [[], [image, image], [{ ...image, width: 0 }], Array.from({ length: 5 }, (_, i) => ({ ...image, id: `${i}` }))]) {
    await outcome(await POST(request(images)), 400, "invalid_request");
  }
  await outcome(await POST(request([image], { "Content-Type": "text/plain" })), 415, "unsupported_media_type");
});
it("bounds actual streamed bytes even with missing or forged Content-Length", async () => {
  for (const headers of [{ "Content-Type": "application/json" }, { "Content-Type": "application/json", "Content-Length": "1" }]) {
    const cancel = vi.fn();
    const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(IMAGE_LIMITS.requestBytes)); controller.enqueue(new Uint8Array(1)); }, cancel });
    const init = { method: "POST", headers, body, duplex: "half" } as RequestInit;
    await outcome(await POST(new Request("http://localhost/api/chat", init)), 413, "request_too_large");
    expect(cancel).toHaveBeenCalledOnce();
  }
});
it("accepts the exact body boundary and rejects one byte above", async () => {
  const body = JSON.stringify({ turnId: "q", messages: [{ id: "q", role: "user", text: "text" }] });
  const atLimit = body + " ".repeat(IMAGE_LIMITS.requestBytes - Buffer.byteLength(body));
  const init = (text: string) => new Request("http://localhost/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: text });
  await outcome(await POST(init(atLimit)), 503, "generation_unavailable");
  await outcome(await POST(init(atLimit + " ")), 413, "request_too_large");
});
