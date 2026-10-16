export const IMAGE_LIMITS = {
  count: 4, originalBytes: 5_000_000, originalPixels: 16_000_000, originalSide: 8192,
  preparedBytes: 500_000, preparedSide: 1600, requestBytes: 4_000_000,
  retainedBytes: 32_000_000, preparationMs: 15_000,
} as const;
export const IMAGE_CONTEXT_NOTICE = "图片上下文已达到本次对话上限，请刷新页面后重新选择图片。刷新会清空当前全部对话、图片和草稿。";
export const IMAGE_MEMORY_NOTICE = "当前页面图片已达到内存上限，请刷新后重新选择。刷新会清空当前全部对话、图片和草稿。";
export const INVALID_IMAGE_NOTICE = "图片无法处理，请检查图片后重新选择并发送。";
export type ImageMetadata = { id: string; mimeType: "image/jpeg" | "image/png"; width: number; height: number };
export type WireImage = ImageMetadata & { data: string };
export type LocalImage = ImageMetadata & { blob: Blob; url: string };

export function imageHeader(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const invalid = () => { throw new Error("图片损坏或格式不支持，仅支持 JPG/JPEG、PNG。"); };
  if (bytes.length >= 33 && [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)) {
    let width = 0, height = 0, ended = false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const size = view.getUint32(offset);
      if (size > bytes.length - offset - 12) return invalid();
      const name = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
      if (offset === 8 && (name !== "IHDR" || size !== 13)) return invalid();
      if (name === "IHDR") {
        if (offset !== 8 || size !== 13) return invalid();
        width = view.getUint32(offset + 8); height = view.getUint32(offset + 12);
      }
      if (name === "acTL") throw new Error("暂不支持动态 PNG，请选择静态图片。");
      offset += size + 12;
      if (name === "IEND") { ended = size === 0 && offset === bytes.length; break; }
    }
    if (!width || !height || !ended) return invalid();
    return { mimeType: "image/png" as const, width, height };
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) return invalid();
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218 || marker === 217) break;
      if (offset + 2 > bytes.length) return invalid();
      const size = view.getUint16(offset);
      if (size < 2 || offset + size > bytes.length) return invalid();
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
        if (size < 8) return invalid();
        const height = view.getUint16(offset + 3), width = view.getUint16(offset + 5);
        if (!width || !height) return invalid();
        return { mimeType: "image/jpeg" as const, width, height };
      }
      offset += size;
    }
  }
  return invalid();
}

export function checkOriginal(file: Pick<File, "size" | "name" | "type">, bytes: Uint8Array) {
  if (!file.size || file.size > IMAGE_LIMITS.originalBytes) throw new Error("单张图片须大于 0 且不超过 5 MB。");
  const header = imageHeader(bytes);
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  if (!(header.mimeType === "image/jpeg" ? ["jpg", "jpeg"].includes(extension ?? "") : extension === "png") ||
    (file.type && file.type !== header.mimeType)) throw new Error("图片格式不匹配，仅支持 JPG/JPEG、PNG。");
  if (header.width > IMAGE_LIMITS.originalSide || header.height > IMAGE_LIMITS.originalSide || header.width * header.height > IMAGE_LIMITS.originalPixels) {
    throw new Error("图片尺寸过大，最多支持 1600 万像素，单边不超过 8192 像素。");
  }
  return header;
}

export function imageFailureMessage(error: unknown) {
  if (error instanceof Error && error.name === "Error") return error.message;
  return "图片处理失败，请检查图片或更换浏览器后重试。";
}
