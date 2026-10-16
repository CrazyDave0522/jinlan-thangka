import { assistant } from "../../../tests/fixtures/answer";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChatConversation, REQUEST_TIMEOUT } from "./chat-conversation";

function deferred() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}
const unavailable = () => Response.json({ error: { code: "generation_unavailable" } }, { status: 503 });
const field = () => screen.getByRole("textbox");
const send = () => screen.getByRole("button", { name: "发送消息" });
function edit(text: string) { fireEvent.change(field(), { target: { value: text } }); }
function submit(text: string) { edit(text); fireEvent.click(send()); }
beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(unavailable()));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("rejects whitespace, trims only submitted edges, locks immediately and preserves newer drafts", async () => {
  const pending = deferred();
  const fetch = vi.mocked(global.fetch).mockReturnValue(pending.promise);
  render(<ChatConversation />);
  edit(" \n ");
  expect(send()).toBeDisabled();
  fireEvent.keyDown(field(), { key: "Enter" });
  expect(fetch).not.toHaveBeenCalled();
  edit("  唐卡\n艺术  ");
  act(() => {
    fireEvent.keyDown(field(), { key: "Enter" });
    fireEvent.click(send());
    fireEvent.keyDown(field(), { key: "Enter" });
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByRole("status")).toHaveTextContent("正在处理…");
  expect(field()).toHaveValue("");
  edit("新的草稿");
  expect(send()).toBeDisabled();
  await act(async () => pending.resolve(unavailable()));
  expect(field()).toHaveValue("新的草稿");
  expect(send()).toBeEnabled();
  expect(screen.getByRole("status")).toHaveTextContent("AI 服务暂未开启");
  expect(screen.queryByRole("button", { name: "重试" })).not.toBeInTheDocument();
  expect(JSON.parse(fetch.mock.calls[0][1]!.body as string).messages[0].text).toBe("唐卡\n艺术");
  fireEvent.click(send());
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  const second = JSON.parse(fetch.mock.calls[1][1]!.body as string);
  expect(second.messages.map((message: { text: string }) => message.text)).toEqual(["新的草稿"]);
});

it("guards composition, confirmation Enter, legacy composition keys, Shift+Enter and touch Enter", async () => {
  render(<ChatConversation />);
  edit("唐卡");
  fireEvent.keyDown(field(), { key: "Enter", shiftKey: true });
  fireEvent.compositionStart(field());
  fireEvent.keyDown(field(), { key: "Enter" });
  fireEvent.compositionEnd(field());
  fireEvent.keyDown(field(), { key: "Enter" });
  expect(fetch).not.toHaveBeenCalled();
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 1)); });
  fireEvent.keyDown(field(), { key: "Enter", keyCode: 229 });
  fireEvent.keyDown(field(), { key: "Enter", isComposing: true });
  vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
  fireEvent.keyDown(field(), { key: "Enter" });
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(send());
  await screen.findByText("AI 服务暂未开启，暂时无法回复。");
});

it("retries the same immutable snapshot without duplicating bubbles or replacing a draft", async () => {
  const fetch = vi.mocked(global.fetch).mockRejectedValueOnce(new Error("offline"));
  render(<ChatConversation />);
  submit("失败问题");
  const retry = await screen.findByRole("button", { name: "重试" });
  edit("保留草稿");
  fireEvent.click(retry);
  await screen.findByText("AI 服务暂未开启，暂时无法回复。");
  expect(fetch.mock.calls[1][1]!.body).toBe(fetch.mock.calls[0][1]!.body);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(field()).toHaveValue("保留草稿");
});

it("retires older failure actions and excludes failed questions from new context", async () => {
  const fetch = vi.mocked(global.fetch).mockRejectedValueOnce(new Error("offline"));
  render(<ChatConversation />);
  submit("旧的失败问题");
  await screen.findByRole("button", { name: "重试" });
  submit("后来的问题");
  await screen.findByText("AI 服务暂未开启，暂时无法回复。");
  expect(screen.getByRole("alert")).toHaveTextContent(/^发送失败。$/);
  expect(screen.queryByRole("button", { name: "重试" })).not.toBeInTheDocument();
  expect(JSON.parse(fetch.mock.calls[1][1]!.body as string).messages).toHaveLength(1);
});

it("appends a validated mocked answer and includes its pair in later context", async () => {
  const fetch = vi.mocked(global.fetch).mockImplementationOnce(async (_url, init) => {
    const request = JSON.parse(init!.body as string);
    return Response.json({ turnId: request.turnId, message: assistant("测试回答") });
  });
  render(<ChatConversation />);
  submit("问题一");
  await screen.findByText("测试回答");
  submit("问题二");
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetch.mock.calls[1][1]!.body as string).messages.map((message: { role: string }) => message.role)).toEqual(["user", "assistant", "user"]);
});

it.each([
  () => Response.json({}, { status: 503 }),
  () => Response.json({ error: { code: "unknown_error" } }, { status: 400 }),
  () => new Response("invalid json"),
  () => Response.json({ turnId: "wrong", message: { id: "a", role: "assistant", text: "回答" } }),
])("treats unexpected or malformed responses as retryable failures", async (response) => {
  vi.mocked(global.fetch).mockResolvedValue(response());
  render(<ChatConversation />);
  submit("问题");
  await screen.findByRole("button", { name: "重试" });
  expect(screen.getByRole("alert")).toHaveTextContent("发送失败，请重试。");
});

it("times out, aborts and ignores late responses even after another request starts", async () => {
  vi.useFakeTimers();
  const first = deferred();
  const second = deferred();
  const fetch = vi.mocked(global.fetch).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  render(<ChatConversation />);
  submit("超时问题");
  edit("下一条");
  act(() => vi.advanceTimersByTime(REQUEST_TIMEOUT));
  expect(fetch.mock.calls[0][1]!.signal!.aborted).toBe(true);
  expect(screen.getByRole("button", { name: "重试" })).toBeEnabled();
  fireEvent.click(send());
  const oldRequest = JSON.parse(fetch.mock.calls[0][1]!.body as string);
  await act(async () => first.resolve(Response.json({ turnId: oldRequest.turnId, message: { id: "late", role: "assistant", text: "迟到回复" } })));
  expect(screen.queryByText("迟到回复")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("正在处理…");
  await act(async () => second.resolve(unavailable()));
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

it("aborts on unmount without replaying or retaining the conversation on remount", async () => {
  const pending = deferred();
  const fetch = vi.mocked(global.fetch).mockReturnValue(pending.promise);
  const { unmount } = render(<ChatConversation />);
  submit("问题");
  unmount();
  expect(fetch.mock.calls[0][1]!.signal!.aborted).toBe(true);
  await act(async () => pending.resolve(unavailable()));
  render(<ChatConversation />);
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("preserves oversized drafts before creating a turn or request", () => {
  render(<ChatConversation />);
  submit("🪷".repeat(2001));
  expect(screen.getByRole("alert")).toHaveTextContent("缩短问题");
  expect(field()).toHaveValue("🪷".repeat(2001));
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("listitem", { name: "用户消息" })).not.toBeInTheDocument();
});

it("edits a corrective question only with an empty idle composer and sends a fresh identity", async () => {
  const transport = vi.mocked(global.fetch).mockResolvedValue(Response.json({ error: { code: "evidence_too_large" } }, { status: 422 }));
  render(<ChatConversation />);
  submit("原始问题");
  await screen.findByRole("button", { name: "编辑问题" });
  const original = JSON.parse(String(transport.mock.calls[0][1]?.body));
  edit("新草稿");
  expect(screen.queryByRole("button", { name: "编辑问题" })).not.toBeInTheDocument();
  edit("");
  fireEvent.click(screen.getByRole("button", { name: "编辑问题" }));
  expect(field()).toHaveValue("原始问题");
  expect(field()).toHaveFocus();
  expect(transport).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("listitem", { name: "用户消息" })).not.toBeInTheDocument();
  submit("缩小后的问题");
  await waitFor(() => expect(transport).toHaveBeenCalledTimes(2));
  const revised = JSON.parse(String(transport.mock.calls[1][1]?.body));
  expect(revised.turnId).not.toBe(original.turnId);
  expect(revised.messages).toHaveLength(1);
});
