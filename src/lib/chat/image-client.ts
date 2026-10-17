import { imageFailureMessage, type LocalImage } from "./image-policy";

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
