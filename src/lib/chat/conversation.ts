import { ERROR_STATUS, exact, parseAssistant, type AssistantMessage, type ChatErrorCode } from "@/lib/answers/contracts";
import { IMAGE_LIMITS, type LocalImage, type WireImage } from "./image-policy";
export type TextMessage<I = WireImage> = { id: string; role: "user" | "assistant"; text: string; images?: I[] };
export type ChatRequest<I = WireImage> = { turnId: string; messages: TextMessage<I>[] };
export type Turn = {
  user: TextMessage<LocalImage>;
  request: ChatRequest<LocalImage>;
  status: "pending" | "unavailable" | "failed" | "completed";
  answer?: TextMessage<LocalImage> & Partial<AssistantMessage>;
  failure?: ChatErrorCode;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function isWireImage(value: unknown): value is WireImage {
  return exact(value, ["id", "mimeType", "width", "height", "data"]) && nonblank(value.id) && (value.mimeType === "image/jpeg" || value.mimeType === "image/png") &&
    Number.isInteger(value.width) && Number.isInteger(value.height) && (value.width as number) > 0 && (value.height as number) > 0 && typeof value.data === "string";
}
export function isTextMessage(value: unknown): value is TextMessage {
  if (!record(value) || !exact(value, ["id", "role", "text", ...(value.images === undefined ? [] : ["images"])]) || !nonblank(value.id) || typeof value.text !== "string" || !value.text.isWellFormed()) return false;
  if (value.role === "assistant") return nonblank(value.text) && value.images === undefined;
  if (value.role !== "user") return false;
  if (value.images !== undefined && (!Array.isArray(value.images) || !value.images.length || value.images.length > IMAGE_LIMITS.count || !value.images.every(isWireImage))) return false;
  return nonblank(value.text) || (Array.isArray(value.images) && value.images.length > 0);
}
export function isChatRequest(value: unknown): value is ChatRequest {
  if (!exact(value, ["turnId", "messages"]) || !nonblank(value.turnId) || !Array.isArray(value.messages) || !value.messages.length) return false;
  const messages: unknown[] = value.messages;
  if (!messages.every(isTextMessage)) return false;
  const last = messages[messages.length - 1];
  const imageIds = messages.flatMap((message) => message.images?.map((image) => image.id) ?? []);
  if (new Set(imageIds).size !== imageIds.length) return false;
  return new Set(messages.map((message) => message.id)).size === messages.length &&
    last.role === "user" && last.id === value.turnId;
}
export function createRequest(turns: Turn[], user: TextMessage<LocalImage>): ChatRequest<LocalImage> {
  return {
    turnId: user.id,
    messages: [...turns.flatMap((turn) => {
      if (turn.status === "completed" && turn.answer) return [turn.user, turn.answer];
      return [];
    }), user].map(({ id, role, text, images }) => ({ id, role, text, ...(images ? { images } : {}) })),
  };
}
export function parseChatResponse(status: number, body: unknown, request: Pick<ChatRequest, "turnId">, reservedIds: string[]) {
  if (exact(body, ["error"]) && exact(body.error, ["code"]) && typeof body.error.code === "string" && Object.hasOwn(ERROR_STATUS, body.error.code)) {
    const failure = body.error.code as ChatErrorCode;
    if (status !== ERROR_STATUS[failure]) throw new Error("Invalid failure status");
    return { status: failure === "generation_unavailable" ? "unavailable" : "failed", failure } as const;
  }
  if (status === 200 && exact(body, ["turnId", "message"]) && body.turnId === request.turnId) {
    const answer = parseAssistant(body.message);
    if (reservedIds.includes(answer.id)) throw new Error("Duplicate message identity");
    return { status: "completed", answer } as const;
  }
  throw new Error("Invalid chat response");
}
