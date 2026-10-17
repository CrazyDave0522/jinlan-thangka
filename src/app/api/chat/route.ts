import { AnswerFailure, ERROR_STATUS, type ChatErrorCode } from "@/lib/answers/contracts";
import { createScope, admit } from "@/lib/answers/runtime";
import { providerConfig } from "@/lib/answers/provider";
import { generateV2 } from "@/lib/vision/orchestrator";
import { parseRequest } from "@/lib/vision/validation";
import { validateInputs } from "@/lib/vision/images";
import { IMAGE_LIMITS } from "@/lib/chat/image-policy";

export const maxDuration = 60;

function outcome(status: number, code: string) {
  return Response.json({ error: { code } }, { status, headers: { "Cache-Control": "no-store" } });
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
    const input = parseRequest(body, request.headers.get("x-chat-protocol"));
    await validateInputs(input, scope);
    scope.check();
    if (input.inputs.length && process.env.DEEPSEEK_VISION_ENABLED !== "true") return outcome(422, "image_understanding_unavailable");
    const config = providerConfig();
    release = admit();
    const response = await generateV2(input, config, scope);
    scope.check();
    const result = Response.json(response, { headers: { "Cache-Control": "no-store" } });
    scope.check();
    return result;
  } catch (error) {
    const code: ChatErrorCode = error instanceof AnswerFailure ? error.code : request.signal.aborted ? "generation_timeout" : "provider_failed";
    return outcome(ERROR_STATUS[code], code);
  } finally { release?.(); scope.close(); }
}
