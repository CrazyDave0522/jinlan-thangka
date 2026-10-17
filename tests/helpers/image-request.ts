import { createHash } from "node:crypto";
import type { ImageRequest } from "@/lib/vision/types";

// Explicitly migrate synthetic upload fixtures to the new request contract.
export function imageRequest(messages: { id: string; role: string; text: string; images?: unknown }[], turnId = messages.at(-1)!.id): ImageRequest {
  const images: ImageRequest["images"] = [];
  const converted = messages.map((m) => {
    const attachments = Array.isArray(m.images) ? m.images as { id: string; mimeType: "image/jpeg" | "image/png"; width: number; height: number; data: string }[] : [];
    for (const image of attachments) images.push({ id: image.id, ownerMessageId: m.id, displayIndex: images.length + 1, mimeType: image.mimeType, width: image.width, height: image.height,
      sha256: createHash("sha256").update(Buffer.from(image.data, "base64")).digest("hex") });
    return { id: m.id, role: m.role as "user" | "assistant", text: m.text, imageIds: attachments.map((i) => i.id) };
  });
  const current = messages.at(-1)?.images;
  return { version: 2, turnId, messages: converted, images, inputs: Array.isArray(current) ? current.map((i) => ({ imageId: i.id, data: i.data })) : [], observations: [], sameWorkSets: [], intent: { kind: "question" } };
}
