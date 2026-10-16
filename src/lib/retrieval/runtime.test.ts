// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
import { createOperation } from "./runtime";
import { RETRIEVAL_LIMITS as L } from "./contracts";
afterEach(()=>vi.useRealTimers());
describe("retrieval HTTP budgets and cancellation",()=>{
  it("caps database calls and never makes the thirteenth request",async()=>{
    const fetch=vi.fn(async()=>new Response("[]")); vi.stubGlobal("fetch",fetch);
    const op=createOperation();
    try {
      for(let n=0;n<L.calls;n++) await op.fetch("https://archive.test");
      await expect(op.fetch("https://archive.test")).rejects.toMatchObject({code:"budget_exceeded"});
      expect(fetch).toHaveBeenCalledTimes(12);
    } finally {op.finish();}
  });
  it("caps cumulative response bytes independently of individual response sizes",async()=>{
    vi.stubGlobal("fetch",vi.fn(async()=>new Response(new Uint8Array(1_600_001))));
    const op=createOperation();
    try {
      for(let n=0;n<4;n++) await op.fetch("https://archive.test");
      await expect(op.fetch("https://archive.test")).rejects.toMatchObject({code:"budget_exceeded"});
    } finally {op.finish();}
  });
  it("accepts the exact response-byte boundary and does not trust Content-Length",async()=>{
    vi.stubGlobal("fetch",vi.fn(async()=>new Response(new Uint8Array(L.responseBytes),{headers:{"Content-Length":"1"}})));
    const op=createOperation();
    try { expect((await (await op.fetch("https://archive.test")).arrayBuffer()).byteLength).toBe(L.responseBytes); }
    finally {op.finish();}
  });
  it("times out a stalled response stream after receiving its headers",async()=>{
    vi.useFakeTimers();
    const cancel=vi.fn();
    vi.stubGlobal("fetch",vi.fn(async()=>new Response(new ReadableStream({cancel}))));
    const op=createOperation();
    const pending=op.fetch("https://archive.test");
    const assertion=expect(pending).rejects.toMatchObject({code:"timeout"});
    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;
    op.finish();
    expect(cancel).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("checks processing time even when no asynchronous operation is pending",()=>{
    vi.useFakeTimers({toFake:["setTimeout","clearTimeout","performance"]});
    const op=createOperation();
    vi.spyOn(performance,"now").mockReturnValue(5_001);
    try {expect(()=>op.check()).toThrow("timeout");} finally {op.finish();}
  });
});
