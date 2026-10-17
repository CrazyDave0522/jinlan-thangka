import type { WireImage } from "./image-policy";

export type TextMessage<I = WireImage> = { id: string; role: "user" | "assistant"; text: string; images?: I[] };
export type ChatRequest<I = WireImage> = { turnId: string; messages: TextMessage<I>[] };
