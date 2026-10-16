import "server-only";
import { AnswerFailure, LIMITS } from "./contracts";

export function createScope(caller?: AbortSignal, milliseconds: number = LIMITS.deadline) {
  const controller = new AbortController();
  const expires = Date.now() + milliseconds;
  const timeout = () => controller.abort(new AnswerFailure("generation_timeout"));
  const timer = setTimeout(timeout, milliseconds);
  const abort = () => controller.abort(caller?.reason ?? new DOMException("Aborted", "AbortError"));
  if (caller?.aborted) abort(); else caller?.addEventListener("abort", abort, { once: true });
  const check = () => { if (Date.now() >= expires && !controller.signal.aborted) timeout(); controller.signal.throwIfAborted(); };
  return {
    signal: controller.signal, check,
    async wait<T>(work: PromiseLike<T>): Promise<T> {
      check();
      let onAbort: () => void = () => {};
      try {
        const result = await Promise.race([Promise.resolve(work), new Promise<never>((_, reject) => {
          onAbort = () => reject(controller.signal.reason);
          controller.signal.addEventListener("abort", onAbort, { once: true });
          if (controller.signal.aborted) onAbort();
        })]);
        check(); return result;
      } finally { controller.signal.removeEventListener("abort", onAbort); }
    },
    close() { clearTimeout(timer); caller?.removeEventListener("abort", abort); controller.abort(new DOMException("Closed", "AbortError")); },
  };
}
export type Scope = ReturnType<typeof createScope>;
let active = 0;
export function admit() {
  if (active >= 2) throw new AnswerFailure("busy");
  active++;
  let released = false;
  return () => { if (!released) { released = true; active--; } };
}
export async function readBounded(response: Response, cap: number, scope: Scope) {
  const reader = response.body?.getReader();
  if (!reader) throw new AnswerFailure("invalid_model_output");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await scope.wait(reader.read());
      if (done) break;
      size += value.byteLength;
      if (size > cap) throw new AnswerFailure("invalid_model_output");
      chunks.push(value);
    }
    try { return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)); }
    catch { throw new AnswerFailure("invalid_model_output"); }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
