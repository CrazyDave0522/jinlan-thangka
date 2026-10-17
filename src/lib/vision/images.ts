import "server-only";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { IMAGE_LIMITS, imageHeader } from "@/lib/chat/image-policy";
import { AnswerFailure } from "@/lib/answers/contracts";
import type { ImageRequest } from "./types";
import type { Scope } from "@/lib/answers/runtime";

export const digest = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
export async function validateInputs(request: ImageRequest, scope: Scope) {
  for (const input of request.inputs) {
    const descriptor = request.images.find((i) => i.id === input.imageId)!;
    if (!input.data || input.data.length > 4 * Math.ceil(IMAGE_LIMITS.preparedBytes / 3) || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.data)) throw new AnswerFailure("invalid_image");
    const bytes = Buffer.from(input.data, "base64");
    if (!bytes.length || bytes.length > IMAGE_LIMITS.preparedBytes || bytes.toString("base64") !== input.data || digest(bytes) !== descriptor.sha256) throw new AnswerFailure("invalid_image");
    try {
      const header = imageHeader(bytes);
      if (header.mimeType !== descriptor.mimeType || header.width !== descriptor.width || header.height !== descriptor.height || Math.max(header.width, header.height) > 1600) throw new Error();
      const decoder = sharp(bytes, { limitInputPixels: 1600 ** 2, failOn: "warning" });
      const metadata = await scope.wait(decoder.metadata());
      if (metadata.pages && metadata.pages !== 1) throw new Error();
      await scope.wait(decoder.raw().toBuffer());
    } catch { scope.check(); throw new AnswerFailure("invalid_image"); }
  }
}
