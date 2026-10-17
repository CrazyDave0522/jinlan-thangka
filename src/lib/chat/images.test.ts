// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { checkOriginal, imageHeader, IMAGE_LIMITS } from "./image-policy";

async function fixture(format: "jpeg" | "png" = "png", width = 100, height = 80) {
  return sharp({ create: { width, height, channels: 4, background: "#a05080" } })[format]().toBuffer();
}
describe("image input boundaries", () => {
  it.each(["png", "jpeg"] as const)("reads actual %s header and accepts matching case-insensitive extensions", async (format) => {
    const bytes = await fixture(format);
    expect(imageHeader(bytes)).toEqual({ mimeType: `image/${format}`, width: 100, height: 80 });
    expect(checkOriginal({ size: IMAGE_LIMITS.originalBytes, name: format === "jpeg" ? "PICTURE.JPG" : "PICTURE.PNG", type: "" }, bytes).width).toBe(100);
    expect(() => checkOriginal({ size: IMAGE_LIMITS.originalBytes + 1, name: `picture.${format}`, type: `image/${format}` }, bytes)).toThrow(/5 MB/);
    expect(() => checkOriginal({ size: 0, name: `picture.${format}`, type: `image/${format}` }, bytes)).toThrow();
  });
  it("rejects conflicting MIME/extensions, WebP, truncated files, pixel bombs and animation", async () => {
    const png = await fixture();
    expect(() => checkOriginal({ name: "bad.jpg", type: "image/jpeg", size: png.length }, png)).toThrow(/不匹配/);
    expect(() => checkOriginal({ name: "bad.png", type: "image/webp", size: png.length }, png)).toThrow();
    expect(() => imageHeader(png.subarray(0, png.length - 5))).toThrow();
    expect(() => imageHeader(new Uint8Array([82, 73, 70, 70]))).toThrow();
    const bomb = Buffer.from(png); bomb.writeUInt32BE(4000, 16); bomb.writeUInt32BE(4000, 20);
    const file = { name: "test.png", type: "image/png", size: bomb.length };
    expect(checkOriginal(file, bomb).width).toBe(4000);
    bomb.writeUInt32BE(4001, 16);
    expect(() => checkOriginal(file, bomb)).toThrow(/1600 万/);
    bomb.writeUInt32BE(8193, 16); bomb.writeUInt32BE(1, 20);
    expect(() => checkOriginal(file, bomb)).toThrow();
    const chunk = Buffer.alloc(20); chunk.writeUInt32BE(8); chunk.write("acTL", 4);
    expect(() => imageHeader(Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]))).toThrow(/动态/);
  });
});

it("rejects duplicate or truncated PNG dimension chunks before decoding", async () => {
  const png = await fixture();
  const duplicate = Buffer.from(png.subarray(8, 33));
  duplicate.writeUInt32BE(1, 8); duplicate.writeUInt32BE(1, 12);
  expect(() => imageHeader(Buffer.concat([png.subarray(0, 33), duplicate, png.subarray(33)]))).toThrow(/图片损坏/);
  const truncated = Buffer.alloc(12); truncated.write("IHDR", 4);
  expect(() => imageHeader(Buffer.concat([png.subarray(0, 33), truncated, png.subarray(33)]))).toThrow(/图片损坏/);
});
