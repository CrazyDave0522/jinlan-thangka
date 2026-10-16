import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChatConversation } from "./chat-conversation";
import { useImageDraft } from "./use-image-draft";
import { encodeRequest, prepareImage } from "@/lib/chat/image-client";
import { IMAGE_LIMITS, type LocalImage } from "@/lib/chat/image-policy";

vi.mock("@/lib/chat/image-client", async (original) => {
  const actual = await original<typeof import("@/lib/chat/image-client")>();
  return { ...actual, prepareImage: vi.fn(), encodeRequest: vi.fn(actual.encodeRequest) };
});
let id = 0;
function image(size = 4): LocalImage {
  const key = `image-${id++}`;
  return { id: key, mimeType: "image/png", width: 10, height: 10, blob: new Blob([new Uint8Array(size)]), url: `blob:${key}` };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
const file = () => new File(["synthetic"], "image.png", { type: "image/png" });
const field = () => screen.getByRole("textbox");
const send = () => screen.getByRole("button", { name: "发送消息" });
function select() { fireEvent.change(screen.getByLabelText("选择图片", { exact: true }), { target: { files: [file()] } }); }
beforeEach(() => {
  vi.mocked(prepareImage).mockReset().mockImplementation(async () => image());
  vi.mocked(encodeRequest).mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { code: "image_understanding_unavailable" } }, { status: 422 })));
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  vi.stubGlobal("URL", Object.assign(URL, { revokeObjectURL: vi.fn() }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("rejects a partial batch without discarding a previous valid selection", async () => {
  const { result } = renderHook(useImageDraft);
  await act(async () => result.current.select([file()]));
  const kept = result.current.images[0];
  const discarded = image();
  vi.mocked(prepareImage).mockResolvedValueOnce(discarded).mockRejectedValueOnce(new Error("corrupt"));
  await act(async () => result.current.select([file(), file()]));
  expect(result.current.images).toEqual([kept]);
  expect(result.current.error).toContain("corrupt");
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(discarded.url);
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(kept.url);
  await act(async () => result.current.select([file(), file(), file(), file()]));
  expect(result.current.error).toContain("4 张");
  expect(result.current.images).toEqual([kept]);
});

it("invalidates removal during preparation and releases late results without rollback", async () => {
  const { result } = renderHook(useImageDraft);
  await act(async () => result.current.select([file()]));
  const old = result.current.images[0];
  const pending = deferred<LocalImage>();
  vi.mocked(prepareImage).mockReturnValueOnce(pending.promise);
  let work!: Promise<void>;
  act(() => { work = result.current.select([file()]); });
  act(() => result.current.remove(old.id));
  const late = image();
  await act(async () => { pending.resolve(late); await work; });
  expect(result.current.images).toEqual([]);
  expect(result.current.preparing).toBe(false);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(old.url);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(late.url);
});

it("keeps submitted previews alive until unmount and only releases removed drafts", async () => {
  const { result, unmount } = renderHook(useImageDraft);
  await act(async () => result.current.select([file()]));
  const submitted = result.current.images[0];
  act(() => { result.current.take(); });
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(submitted.url);
  await act(async () => result.current.select([file()]));
  const next = result.current.images[0];
  act(() => result.current.remove(next.id));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(next.url);
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(submitted.url);
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(submitted.url);
});

it("allows exactly the retained blob budget, then rejects new images without eviction", async () => {
  vi.mocked(prepareImage).mockImplementation(async () => image(IMAGE_LIMITS.preparedBytes));
  const { result, unmount } = renderHook(useImageDraft);
  for (let batch = 0; batch < 16; batch++) {
    await act(async () => result.current.select([file(), file(), file(), file()]));
    expect(result.current.error).toBe("");
    act(() => { result.current.take(); });
  }
  await act(async () => result.current.select([file()]));
  expect(result.current.error).toContain("内存上限");
  expect(result.current.images).toEqual([]);
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(65);
});

it("times out preparation and cleans up even when a mock decoder ignores abort", async () => {
  vi.useFakeTimers();
  const pending = deferred<LocalImage>();
  vi.mocked(prepareImage).mockReturnValueOnce(pending.promise);
  const { result } = renderHook(useImageDraft);
  let work!: Promise<void>;
  act(() => { work = result.current.select([file()]); });
  await act(async () => { vi.advanceTimersByTime(IMAGE_LIMITS.preparationMs); await work; });
  expect(result.current.error).toContain("超时");
  expect(result.current.preparing).toBe(false);
  const late = image();
  await act(async () => pending.resolve(late));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(late.url);
  expect(result.current.images).toEqual([]);
});

it("locks before async encoding, keeps next drafts and retries the captured image set", async () => {
  const encoded = deferred<string>();
  vi.mocked(encodeRequest).mockReturnValueOnce(encoded.promise);
  const first = deferred<Response>();
  const fetch = vi.mocked(global.fetch).mockReturnValueOnce(first.promise);
  render(<ChatConversation />);
  select();
  await waitFor(() => expect(screen.getByRole("button", { name: "移除图片 1" })).toBeEnabled());
  act(() => { fireEvent.click(send()); fireEvent.click(send()); fireEvent.keyDown(field(), { key: "Enter" }); });
  expect(encodeRequest).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getAllByRole("listitem", { name: "用户消息" })).toHaveLength(1);
  select();
  await screen.findByRole("button", { name: "移除图片 1" });
  fireEvent.change(field(), { target: { value: "新草稿" } });
  await act(async () => encoded.resolve("captured-wire"));
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(async () => first.resolve(Response.json({}, { status: 500 })));
  fireEvent.click(await screen.findByRole("button", { name: "重试" }));
  await screen.findByText("图片解读暂未接入，请先发送纯文字问题。");
  expect(vi.mocked(encodeRequest).mock.calls[1][0]).toEqual(vi.mocked(encodeRequest).mock.calls[0][0]);
  expect(field()).toHaveValue("新草稿");
  expect(screen.getByRole("button", { name: "移除图片 1" })).toBeEnabled();
  expect(screen.getAllByRole("listitem", { name: "用户消息" })).toHaveLength(1);
});

it("abandons async encoding on timeout without calling fetch or losing a newer draft", async () => {
  vi.useFakeTimers();
  const encoded = deferred<string>();
  vi.mocked(encodeRequest).mockReturnValueOnce(encoded.promise);
  render(<ChatConversation />);
  select();
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  fireEvent.click(send());
  fireEvent.change(field(), { target: { value: "保留的新草稿" } });
  act(() => vi.advanceTimersByTime(65_000));
  expect(screen.getByRole("button", { name: "重试" })).toBeEnabled();
  await act(async () => encoded.resolve("late-wire"));
  expect(fetch).not.toHaveBeenCalled();
  expect(field()).toHaveValue("保留的新草稿");
});

it.each([413, 422])("requires corrective action rather than identical-image retry for HTTP %i", async (status) => {
  vi.mocked(global.fetch).mockResolvedValue(status === 413 ? new Response("gateway", { status }) : Response.json({ error: { code: "invalid_image" } }, { status }));
  render(<ChatConversation />);
  select();
  await screen.findByRole("button", { name: "移除图片 1" });
  fireEvent.click(send());
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(status === 413 ? "减少图片" : "重新选择"));
  expect(screen.queryByRole("button", { name: "重试" })).not.toBeInTheDocument();
});

it("blocks same-event submission while a new batch is starting preparation", async () => {
  render(<ChatConversation />);
  select();
  await screen.findByRole("button", { name: "移除图片 1" });
  const work = deferred<LocalImage>();
  vi.mocked(prepareImage).mockReturnValueOnce(work.promise);
  act(() => { select(); fireEvent.click(send()); fireEvent.keyDown(field(), { key: "Enter" }); });
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("listitem", { name: "用户消息" })).not.toBeInTheDocument();
  await act(async () => work.resolve(image()));
  expect(screen.getAllByRole("button", { name: /移除图片/ })).toHaveLength(2);
});

it("clears an old request-size warning when the visitor removes an image", async () => {
  render(<ChatConversation />);
  select();
  await screen.findByRole("button", { name: "移除图片 1" });
  fireEvent.change(field(), { target: { value: "x".repeat(4_000_000) } });
  fireEvent.click(send());
  expect(screen.getByRole("alert")).toHaveTextContent("缩短问题");
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "移除图片 1" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(field()).toHaveValue("x".repeat(4_000_000));
});

it("explicit editing releases failed attachment previews without restoring them", async () => {
  const prepared = image();
  vi.mocked(prepareImage).mockResolvedValueOnce(prepared);
  render(<ChatConversation />);
  select();
  await screen.findByRole("button", { name: "移除图片 1" });
  fireEvent.change(field(), { target: { value: "比较图片" } });
  fireEvent.click(send());
  await screen.findByRole("button", { name: "编辑问题" });
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(prepared.url);
  fireEvent.click(screen.getByRole("button", { name: "编辑问题" }));
  expect(field()).toHaveValue("比较图片");
  expect(screen.queryByRole("list", { name: "待发送图片" })).not.toBeInTheDocument();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(prepared.url);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alert")).toHaveTextContent("重新选择图片");
});
