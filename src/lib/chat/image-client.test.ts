import { afterEach, expect, it, vi } from "vitest";
import { readBlob, prepareImage } from "./image-client";
import { imageFailureMessage, type LocalImage } from "./image-policy";
import { createSnapshot, encodeSnapshot, snapshotSize } from "./image-context";
const image = (size = 4): LocalImage => ({ id: "i", mimeType: "image/png", width: 10, height: 10, blob: new Blob([new Uint8Array(size)]), url: "blob:local" });
afterEach(() => vi.unstubAllGlobals());
it.each([1, 2, 3, 4, 500_000])("preflights exact UTF-8 bytes including base64 overhead for %i bytes", async (size) => {
  const request = createSnapshot([], { id: "q", role: "user", text: "中文与\n引号\"", images: [image(size)] }, new Map([["i", 1]]));
  const { body } = await encodeSnapshot(request, new AbortController().signal);
  expect(snapshotSize(request)).toBe(new TextEncoder().encode(body).byteLength);
  const wire = JSON.parse(body);
  expect(wire.images[0]).not.toHaveProperty("url");
  expect(wire.images[0]).not.toHaveProperty("blob");
  expect(atob(wire.inputs[0].data).length).toBe(size);
});
it("does not read or encode an already aborted request", async () => {
  const controller = new AbortController(); controller.abort();
  const read = vi.spyOn(FileReader.prototype, "readAsArrayBuffer");
  await expect(readBlob(image().blob, controller.signal)).rejects.toThrow();
  await expect(encodeSnapshot(createSnapshot([], { id: "q", role: "user", text: "q", images: [image()] }, new Map([["i", 1]])), controller.signal)).rejects.toThrow();
  expect(read).not.toHaveBeenCalled();
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
