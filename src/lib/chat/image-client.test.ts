import { afterEach, expect, it, vi } from "vitest";
import { encodeRequest, readBlob, requestLimitNotice, requestSize, prepareImage } from "./image-client";
import { IMAGE_CONTEXT_NOTICE, imageFailureMessage, type LocalImage } from "./image-policy";
import { createRequest } from "./conversation";
const image = (size = 4): LocalImage => ({ id: "i", mimeType: "image/png", width: 10, height: 10, blob: new Blob([new Uint8Array(size)]), url: "blob:local" });
afterEach(() => vi.unstubAllGlobals());
it.each([1, 2, 3, 4, 500_000])("preflights exact UTF-8 bytes including base64 overhead for %i bytes", async (size) => {
  const request = createRequest([], { id: "q", role: "user", text: "中文与\n引号\"", images: [image(size)] });
  const body = await encodeRequest(request, new AbortController().signal);
  expect(requestSize(request)).toBe(new TextEncoder().encode(body).byteLength);
  const wire = JSON.parse(body);
  expect(wire.messages[0].images[0]).not.toHaveProperty("url");
  expect(wire.messages[0].images[0]).not.toHaveProperty("blob");
  expect(atob(wire.messages[0].images[0].data).length).toBe(size);
});
it("keeps image identities/bytes in snapshots but excludes earlier failed images", () => {
  const user = { id: "old", role: "user" as const, text: "", images: [image()] };
  const request = createRequest([], user);
  const current = { id: "next", role: "user" as const, text: "继续" };
  expect(createRequest([{ user, request, status: "completed", answer: { id: "a", role: "assistant", text: "回答" } }], current).messages[0].images![0].blob).toBe(user.images[0].blob);
  expect(createRequest([{ user, request, status: "failed" }], current).messages).toHaveLength(1);
  expect(requestLimitNotice(createRequest([{ user, request, status: "completed", answer: { id: "a", role: "assistant", text: "回答" } }], current))).toBe(IMAGE_CONTEXT_NOTICE);
  expect(requestLimitNotice(request)).toContain("减少图片");
  expect(requestLimitNotice(createRequest([], current))).toContain("文字");
});
it("does not read or encode an already aborted request", async () => {
  const controller = new AbortController(); controller.abort();
  await expect(readBlob(image().blob, controller.signal)).rejects.toThrow();
  await expect(encodeRequest(createRequest([], { id: "q", role: "user", text: "q" }), controller.signal)).rejects.toThrow();
});
it("terminates a processing worker when canceled", async () => {
  const terminate = vi.fn();
  vi.stubGlobal("Worker", class { terminate = terminate; postMessage = vi.fn(); });
  const controller = new AbortController();
  const work = prepareImage(new File(["image"], "image.png"), controller.signal);
  controller.abort();
  await expect(work).rejects.toThrow();
  expect(terminate).toHaveBeenCalledOnce();
});
it("handles worker startup failure and terminates it", async () => {
  const terminate = vi.fn();
  vi.stubGlobal("Worker", class { terminate = terminate; postMessage() { throw new Error("worker failure"); } });
  await expect(prepareImage(new File(["image"], "image.png"), new AbortController().signal)).rejects.toThrow("worker failure");
  expect(terminate).toHaveBeenCalledOnce();
});

it("keeps native decoder/capability failures in Chinese while preserving explicit validation reasons", () => {
  for (const failure of [new DOMException("The source image could not be decoded", "InvalidStateError"), new ReferenceError("OffscreenCanvas is not defined"), new TypeError("Encoding failed")]) {
    expect(imageFailureMessage(failure)).toBe("图片处理失败，请检查图片或更换浏览器后重试。");
  }
  expect(imageFailureMessage(new Error("单张图片须大于 0 且不超过 5 MB。"))).toContain("5 MB");
});
