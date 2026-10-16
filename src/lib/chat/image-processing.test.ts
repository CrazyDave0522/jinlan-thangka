// @vitest-environment node
import sharp from "sharp";
import { afterEach, expect, it, vi } from "vitest";
import { processImage } from "./image-processing";

async function setup(format: "jpeg" | "png", results: number[], width = 2400, height = 1200) {
  const bytes = await sharp({ create: { width, height, channels: 4, background: "#806040" } })[format]().toBuffer();
  const bitmap = { width, height, close: vi.fn() };
  const convert = vi.fn(async (options: { type: string }) => new Blob([new Uint8Array(results.shift() ?? 600_000)], { type: options.type }));
  const draw = vi.fn();
  vi.stubGlobal("createImageBitmap", vi.fn(async () => bitmap));
  vi.stubGlobal("OffscreenCanvas", class { width = 1; height = 1; getContext() { return { drawImage: draw }; } convertToBlob = convert; });
  return { file: new File([bytes], `fixture.${format}`, { type: `image/${format}` }), bitmap, convert, draw };
}
afterEach(() => vi.unstubAllGlobals());
it("bounds sequential JPEG quality and dimension attempts and disposes the bitmap", async () => {
  const { file, bitmap, convert, draw } = await setup("jpeg", [600_000, 600_000, 600_000, 600_000, 500_000]);
  const result = await processImage(file);
  expect([result.width, result.height]).toEqual([1280, 640]);
  expect(result.blob.size).toBe(500_000);
  expect(convert.mock.calls.map(([options]) => options)).toEqual([0.85, 0.75, 0.65, 0.85, 0.75].map((quality) => ({ type: "image/jpeg", quality })));
  expect(draw).toHaveBeenCalledTimes(2);
  expect(bitmap.close).toHaveBeenCalledOnce();
});
it("does not upscale small PNGs or change their format", async () => {
  const { file, bitmap, convert } = await setup("png", [40], 120, 60);
  const result = await processImage(file);
  expect([result.width, result.height, result.mimeType]).toEqual([120, 60, "image/png"]);
  expect(convert).toHaveBeenCalledExactlyOnceWith({ type: "image/png", quality: undefined });
  expect(bitmap.close).toHaveBeenCalledOnce();
});
it("rejects beyond the floor instead of indefinite reduction", async () => {
  const { file, bitmap, convert } = await setup("jpeg", [500_001, 500_001, 500_001, 500_001, 500_001, 500_001]);
  await expect(processImage(file)).rejects.toThrow("0.5 MB");
  expect(convert).toHaveBeenCalledTimes(6);
  expect(bitmap.close).toHaveBeenCalledOnce();
});
it("releases a bitmap if canvas encoding fails", async () => {
  const { file, bitmap, convert } = await setup("png", []);
  convert.mockRejectedValueOnce(new Error("encoding failed"));
  await expect(processImage(file)).rejects.toThrow("encoding failed");
  expect(bitmap.close).toHaveBeenCalledOnce();
});
