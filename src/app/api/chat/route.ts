import sharp from "sharp";
import { AnswerFailure, contextValid, ERROR_STATUS, type ChatErrorCode } from "@/lib/answers/contracts";
import { createScope, admit } from "@/lib/answers/runtime";
import { providerConfig } from "@/lib/answers/provider";
import { generateAnswer } from "@/lib/answers/orchestrator";

import { isChatRequest } from "@/lib/chat/conversation";
import { IMAGE_LIMITS, imageHeader, type WireImage } from "@/lib/chat/image-policy";

export const maxDuration = 60;

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
  const scope = createScope(request.signal);
  let release: (() => void) | undefined;
  try {
    scope.check();
    if (Number(request.headers.get("content-length")) > IMAGE_LIMITS.requestBytes) return outcome(413, "request_too_large");
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return outcome(415, "unsupported_media_type");
    const reader = request.body?.getReader();
    if (!reader) return outcome(400, "invalid_request");
    let body: unknown;
    try {
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await scope.wait(reader.read());
        if (done) break;
        size += value.byteLength;
        if (size > IMAGE_LIMITS.requestBytes) {
          try { void reader.cancel().catch(() => {}); } catch { /* The size outcome remains valid if stream cancellation fails. */ }
          return outcome(413, "request_too_large");
        }
        chunks.push(value);
      }
      body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    } catch (error) { scope.check(); if (error instanceof AnswerFailure) throw error; return outcome(400, "invalid_request"); }
    finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
    if (!isChatRequest(body)) return outcome(400, "invalid_request");
    for (const message of body.messages) {
      for (const image of message.images ?? []) if (!await scope.wait(validImage(image))) return outcome(422, "invalid_image");
    }
    scope.check();
    if (!contextValid(body.messages)) return outcome(422, "context_too_large");
    if (body.messages.at(-1)?.images?.length) return outcome(422, "image_understanding_unavailable");
    const config = providerConfig();
    release = admit();
    const response = await generateAnswer(body, config, scope);
    scope.check();
    const result = Response.json(response, { headers: { "Cache-Control": "no-store" } });
    scope.check();
    return result;
  } catch (error) {
    const code: ChatErrorCode = error instanceof AnswerFailure ? error.code : request.signal.aborted ? "generation_timeout" : "provider_failed";
    return outcome(ERROR_STATUS[code], code);
  } finally { release?.(); scope.close(); }
}
