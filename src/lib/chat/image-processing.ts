import { IMAGE_LIMITS, checkOriginal, type LocalImage } from "./image-policy";

export async function processImage(file: File): Promise<Omit<LocalImage, "id" | "url">> {
  if (!file.size || file.size > IMAGE_LIMITS.originalBytes) throw new Error("单张图片须大于 0 且不超过 5 MB。");
  const header = checkOriginal(file, new Uint8Array(await file.arrayBuffer()));
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let canvas: OffscreenCanvas | undefined;
  try {
    canvas = new OffscreenCanvas(1, 1);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("浏览器无法处理图片，请更换浏览器后重试。");
    let lastSide = 0;
    for (const bound of [1600, 1280]) {
      const side = Math.min(Math.max(bitmap.width, bitmap.height), bound);
      if (side === lastSide) continue;
      lastSide = side;
      const ratio = side / Math.max(bitmap.width, bitmap.height);
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of header.mimeType === "image/jpeg" ? [0.85, 0.75, 0.65] : [undefined]) {
        const blob = await canvas.convertToBlob({ type: header.mimeType, quality });
        if (blob.size > 0 && blob.size <= IMAGE_LIMITS.preparedBytes && blob.type === header.mimeType) {
          return { mimeType: header.mimeType, width: canvas.width, height: canvas.height, blob };
        }
      }
    }
    throw new Error("图片处理后仍超过 0.5 MB，请选择更小的图片。");
  } finally {
    bitmap.close();
    if (canvas) canvas.width = canvas.height = 1;
  }
}
