import { IMAGE_CONTEXT_NOTICE, IMAGE_LIMITS, imageFailureMessage, type LocalImage } from "./image-policy";
import type { ChatRequest } from "./conversation";

export function readBlob(blob: Blob, signal?: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => { reader.abort(); reject(new DOMException("Aborted", "AbortError")); };
    const cleanup = () => signal?.removeEventListener("abort", abort);
    reader.onload = () => { cleanup(); resolve(new Uint8Array(reader.result as ArrayBuffer)); };
    reader.onerror = () => { cleanup(); reject(new Error("图片读取失败，请重新选择。")); };
    reader.onabort = cleanup;
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener("abort", abort, { once: true });
    reader.readAsArrayBuffer(blob);
  });
}

export function prepareImage(file: File, signal: AbortSignal): Promise<LocalImage> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    let worker: Worker;
    try { worker = new Worker(new URL("./image-worker.ts", import.meta.url), { type: "module" }); }
    catch (error) { reject(new Error(imageFailureMessage(error))); return; }
    const cleanup = () => { worker.terminate(); signal.removeEventListener("abort", abort); };
    const abort = () => { cleanup(); reject(signal.reason); };
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = () => { cleanup(); reject(new Error("浏览器图片处理失败，请重新选择或更换浏览器。")); };
    worker.onmessage = (event: MessageEvent<{ image?: Omit<LocalImage, "id" | "url">; error?: string }>) => {
      cleanup();
      if (!event.data.image) { reject(new Error(event.data.error ?? "图片处理失败。")); return; }
      const image = event.data.image;
      resolve({ ...image, id: crypto.randomUUID(), url: URL.createObjectURL(image.blob) });
    };
    try { worker.postMessage(file); } catch (error) { cleanup(); reject(new Error(imageFailureMessage(error))); }
  });
}

export function requestSize(request: ChatRequest<LocalImage>) {
  const messages = request.messages.map((message) => ({ ...message, ...(message.images ? { images: message.images.map(({ id, mimeType, width, height }) => ({ id, mimeType, width, height, data: "" })) } : {}) }));
  return new TextEncoder().encode(JSON.stringify({ turnId: request.turnId, messages })).byteLength +
    request.messages.reduce((total, message) => total + (message.images?.reduce((sum, image) => sum + 4 * Math.ceil(image.blob.size / 3), 0) ?? 0), 0);
}
export function requestLimitNotice(request: ChatRequest<LocalImage>) {
  if (request.messages.slice(0, -1).some((message) => message.images?.length)) return IMAGE_CONTEXT_NOTICE;
  return request.messages.some((message) => message.images?.length) ? "本次图片或文字过大，请减少图片或文字后发送。" : "文字或对话上下文过大，请减少文字，或刷新后重新开始。刷新会清空当前全部对话、图片和草稿。";
}
export async function encodeRequest(request: ChatRequest<LocalImage>, signal: AbortSignal) {
  const messages = [];
  for (const message of request.messages) {
    if (!message.images) { messages.push(message); continue; }
    const images = [];
    for (const { id, mimeType, width, height, blob } of message.images) {
      const bytes = await readBlob(blob, signal);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      images.push({ id, mimeType, width, height, data: btoa(binary) });
    }
    messages.push({ ...message, images });
  }
  signal.throwIfAborted();
  const body = JSON.stringify({ turnId: request.turnId, messages });
  if (new TextEncoder().encode(body).byteLength > IMAGE_LIMITS.requestBytes) throw new RangeError("request_too_large");
  return body;
}
