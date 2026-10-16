import sharp from "sharp";
import { isChatRequest } from "@/lib/chat/conversation";
import { IMAGE_LIMITS, imageHeader, type WireImage } from "@/lib/chat/image-policy";

function outcome(status: number, code: string) {
  return Response.json({ error: { code } }, { status, headers: { "Cache-Control": "no-store" } });
}
async function validImage(image: WireImage) {
  if (!image.data || image.data.length > 4 * Math.ceil(IMAGE_LIMITS.preparedBytes / 3) || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data)) return false;
  const bytes = Buffer.from(image.data, "base64");
  if (!bytes.length || bytes.length > IMAGE_LIMITS.preparedBytes || bytes.toString("base64") !== image.data) return false;
  try {
    const header = imageHeader(bytes);
    if (header.mimeType !== image.mimeType || header.width !== image.width || header.height !== image.height || Math.max(header.width, header.height) > IMAGE_LIMITS.preparedSide) return false;
    const decoder = sharp(bytes, { limitInputPixels: IMAGE_LIMITS.preparedSide ** 2, failOn: "warning" });
    const meta = await decoder.metadata();
    if (meta.pages && meta.pages !== 1) return false;
    await decoder.raw().toBuffer();
    return true;
  } catch { return false; }
}
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > IMAGE_LIMITS.requestBytes) return outcome(413, "request_too_large");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return outcome(415, "unsupported_media_type");
  const reader = request.body?.getReader();
  if (!reader) return outcome(400, "invalid_request");
  let body: unknown;
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > IMAGE_LIMITS.requestBytes) {
        try { await reader.cancel(); } catch { /* The size outcome remains valid if stream cancellation fails. */ }
        return outcome(413, "request_too_large");
      }
      chunks.push(value);
    }
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
  } catch { return outcome(400, "invalid_request"); }
  finally { reader.releaseLock(); }
  if (!isChatRequest(body)) return outcome(400, "invalid_request");
  for (const message of body.messages) {
    for (const image of message.images ?? []) if (!await validImage(image)) return outcome(422, "invalid_image");
  }
  return outcome(503, "generation_unavailable");
}
