import { ERROR_STATUS, exact, jsonBytes, type ChatErrorCode } from "@/lib/answers/contracts";
import type { Assistant, Descriptor, ImageRequest, Observation } from "@/lib/vision/types";
import { parseAssistantV2 } from "@/lib/vision/output";
import { parseRequest } from "@/lib/vision/validation";
import { readBlob } from "./image-client";
import { IMAGE_LIMITS, type LocalImage } from "./image-policy";
import type { TextMessage } from "./conversation";

export type Snapshot = Omit<ImageRequest, "inputs"> & { inputs: LocalImage[] };
export type ImageTurn = { user: TextMessage<LocalImage>; request: Snapshot; status: "pending" | "unavailable" | "failed" | "completed"; answer?: Assistant; failure?: ChatErrorCode };
export function wireSnapshot(snapshot: Snapshot, data: string[] = []): ImageRequest {
  return { ...snapshot, inputs: snapshot.inputs.map((image, n) => ({ imageId: image.id, data: data[n] ?? "" })) };
}
export function snapshotSize(snapshot: Snapshot) {
  return new TextEncoder().encode(JSON.stringify(wireSnapshot(snapshot))).byteLength + snapshot.inputs.reduce((n, i) => n + 4 * Math.ceil(i.blob.size / 3), 0);
}
export function preflight(snapshot: Snapshot) {
  parseRequest(wireSnapshot(snapshot));
  if (snapshotSize(snapshot) > IMAGE_LIMITS.requestBytes) throw new RangeError("request_too_large");
}
export function createSnapshot(turns: ImageTurn[], user: TextMessage<LocalImage>, display: Map<string, number>, groups: string[][] = []): Snapshot {
  const completed = turns.filter((t) => t.status === "completed" && t.answer);
  const messages = completed.flatMap((t) => [{ id: t.user.id, role: "user" as const, text: t.user.text, imageIds: t.request.messages.at(-1)!.imageIds }, { id: t.answer!.id, role: "assistant" as const, text: t.answer!.text, imageIds: [] }]);
  const descriptors = new Map<string, Descriptor>();
  for (const t of completed) for (const i of t.request.images) descriptors.set(i.id, i);
  const inputs = [...(user.images ?? [])].sort((a, b) => display.get(a.id)! - display.get(b.id)!);
  for (const i of inputs) if (!descriptors.has(i.id)) descriptors.set(i.id, { id: i.id, ownerMessageId: user.id, displayIndex: display.get(i.id)!, mimeType: i.mimeType, width: i.width, height: i.height, sha256: "0".repeat(64) });
  messages.push({ id: user.id, role: "user", text: user.text, imageIds: inputs.map((i) => i.id) });
  const known = new Set(messages.flatMap((m) => m.imageIds));
  const images = [...descriptors.values()].filter((i) => known.has(i.id)).sort((a, b) => a.displayIndex - b.displayIndex);
  const observations = new Map<string, Observation>();
  for (const t of completed) for (const o of t.answer!.observations) if (known.has(o.imageId)) observations.set(o.imageId, o);
  return { version: 2, turnId: user.id, messages, images, inputs, observations: [...observations.values()], sameWorkSets: inputs.length ? groups.map((g) => g.filter((i) => inputs.some((p) => p.id === i))).filter((g) => g.length >= 2) : [], intent: { kind: "question" } };
}
export function rereadSnapshot(source: ImageTurn, resolve: (id: string) => LocalImage | undefined): { user: TextMessage<LocalImage>; request: Snapshot } {
  if (source.status !== "completed" || source.answer?.kind !== "clarification" || !source.answer.reread) throw new Error("Missing reread action");
  const action = source.answer.reread;
  if (action.sourceTurnId !== source.user.id || action.sourceAssistantId !== source.answer.id) throw new Error("Invalid reread action");
  const inputs = action.imageIds.map((id) => { const image = resolve(id); if (!image) throw new Error("Missing retained image"); return image; });
  const turnId = crypto.randomUUID();
  const user = { id: turnId, role: "user" as const, text: source.user.text, images: inputs };
  const request: Snapshot = { ...source.request, turnId, inputs, messages: [...source.request.messages, { id: source.answer.id, role: "assistant", text: source.answer.text, imageIds: [] }, { id: turnId, role: "user", text: source.user.text, imageIds: action.imageIds }],
    sameWorkSets: source.request.sameWorkSets.map((g) => g.filter((i) => action.imageIds.includes(i))).filter((g) => g.length >= 2), intent: { kind: "reread", ...action } };
  preflight(request); return { user, request };
}
export async function encodeSnapshot(snapshot: Snapshot, signal: AbortSignal): Promise<{ request: ImageRequest; body: string }> {
  preflight(snapshot);
  const inputs: ImageRequest["inputs"] = [];
  const images = snapshot.images.map((i) => ({ ...i }));
  for (const image of snapshot.inputs) {
    const bytes = await readBlob(image.blob, signal);
    signal.throwIfAborted();
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes.slice().buffer));
    signal.throwIfAborted();
    images.find((i) => i.id === image.id)!.sha256 = [...hash].map((n) => n.toString(16).padStart(2, "0")).join("");
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    inputs.push({ imageId: image.id, data: btoa(binary) });
  }
  const request = parseRequest({ ...snapshot, images, inputs });
  const body = JSON.stringify(request);
  if (new TextEncoder().encode(body).byteLength > IMAGE_LIMITS.requestBytes) throw new RangeError("request_too_large");
  signal.throwIfAborted(); return { request, body };
}
export function parseResponseV2(status: number, body: unknown, request: ImageRequest, reserved: string[]) {
  if (jsonBytes(body) > 128_000) throw new Error("Oversized response");
  if (exact(body, ["error"]) && exact(body.error, ["code"]) && typeof body.error.code === "string" && Object.hasOwn(ERROR_STATUS, body.error.code)) {
    const code = body.error.code as ChatErrorCode;
    if (status !== ERROR_STATUS[code]) throw new Error("Invalid failure status");
    return { status: code === "generation_unavailable" ? "unavailable" as const : "failed" as const, failure: code };
  }
  if (status !== 200 || !exact(body, ["version", "turnId", "message"]) || body.version !== 2 || body.turnId !== request.turnId) throw new Error("Invalid versioned response");
  const answer = parseAssistantV2(body.message, request);
  if (reserved.includes(answer.id)) throw new Error("Duplicate assistant identity");
  return { status: "completed" as const, answer };
}
