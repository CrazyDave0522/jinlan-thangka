export type TextMessage = { id: string; role: "user" | "assistant"; text: string };
export type ChatRequest = { turnId: string; messages: TextMessage[] };
export type Turn = {
  user: TextMessage;
  request: ChatRequest;
  status: "pending" | "unavailable" | "failed" | "completed";
  answer?: TextMessage;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function isTextMessage(value: unknown): value is TextMessage {
  return record(value) && nonblank(value.id) && nonblank(value.text) &&
    (value.role === "user" || value.role === "assistant");
}
export function isChatRequest(value: unknown): value is ChatRequest {
  if (!record(value) || !nonblank(value.turnId) || !Array.isArray(value.messages) || !value.messages.length) return false;
  const messages: unknown[] = value.messages;
  if (!messages.every(isTextMessage)) return false;
  const last = messages[messages.length - 1];
  return new Set(messages.map((message) => message.id)).size === messages.length &&
    last.role === "user" && last.id === value.turnId;
}
export function createRequest(turns: Turn[], user: TextMessage): ChatRequest {
  return {
    turnId: user.id,
    messages: [...turns.flatMap((turn) => {
      if (turn.status === "unavailable") return [turn.user];
      if (turn.status === "completed" && turn.answer) return [turn.user, turn.answer];
      return [];
    }), user].map((message) => ({ ...message })),
  };
}
export function parseChatResponse(status: number, body: unknown, request: ChatRequest, reservedIds: string[]) {
  if (status === 503 && record(body) && record(body.error) && body.error.code === "generation_unavailable") {
    return { status: "unavailable" } as const;
  }
  if (status === 200 && record(body) && body.turnId === request.turnId &&
    isTextMessage(body.message) && body.message.role === "assistant" && !reservedIds.includes(body.message.id)) {
    return { status: "completed", answer: { ...body.message } } as const;
  }
  throw new Error("Invalid chat response");
}
