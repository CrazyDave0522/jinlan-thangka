import "server-only";
import { RETRIEVAL_LIMITS as L, RetrievalFailure } from "./contracts";

export function createOperation(caller?: AbortSignal) {
  const controller = new AbortController();
  let failure: RetrievalFailure | undefined;
  let calls = 0;
  let bytes = 0;
  const started = performance.now();
  let rejectStopped!: (error: RetrievalFailure) => void;
  const stopped = new Promise<never>((_, reject) => { rejectStopped = reject; });
  // Mark handled even when cancellation precedes the first query/race.
  void stopped.catch(() => {});
  function stop(error: RetrievalFailure) {
    if (!failure) { failure = error; rejectStopped(error); controller.abort(); }
  }
  const abort = () => stop(new RetrievalFailure("aborted"));
  const timer = setTimeout(() => stop(new RetrievalFailure("timeout")), L.deadlineMs);
  caller?.addEventListener("abort", abort, { once: true });
  if (caller?.aborted) abort();
  function check() {
    if (!failure && performance.now() - started >= L.deadlineMs) stop(new RetrievalFailure("timeout"));
    if (failure) throw failure;
  }
  async function wait<T>(work: PromiseLike<T>): Promise<T> {
    check();
    const value = await Promise.race([Promise.resolve(work), stopped]);
    check();
    return value;
  }
  const boundedFetch: typeof fetch = async (input, init) => {
    check();
    if (++calls > L.calls) { stop(new RetrievalFailure("budget_exceeded")); check(); }
    try {
      const response = await wait(fetch(input, { ...init, signal: controller.signal, cache: "no-store" }));
      const reader = response.body?.getReader();
      let size = 0;
      const chunks: Uint8Array[] = [];
      if (reader) {
        try {
          for (;;) {
            const { done, value } = await wait(reader.read());
            if (done) break;
            size += value.byteLength;
            bytes += value.byteLength;
            if (size > L.responseBytes || bytes > L.cumulativeBytes) {
              stop(new RetrievalFailure("budget_exceeded")); check();
            }
            chunks.push(value);
          }
        } finally {
          void reader.cancel().catch(() => {});
        }
      }
      check();
      const body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
      const headers = new Headers(response.headers);
      headers.delete("content-encoding"); headers.delete("content-length");
      return new Response(response.status === 204 ? null : body, { status: response.status, statusText: response.statusText, headers });
    } catch (error) {
      if (error instanceof RetrievalFailure) stop(error);
      check();
      throw error;
    }
  };
  return { signal: controller.signal, fetch: boundedFetch, check, wait,
    finish() { clearTimeout(timer); caller?.removeEventListener("abort", abort); } };
}
