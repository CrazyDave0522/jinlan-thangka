import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { ChatConversation } from "./chat-conversation";
import { useImageDraft } from "./use-image-draft";
import { prepareImage } from "@/lib/chat/image-client";
import { successV2 } from "../../../tests/fixtures/vision";
import { canonicalImage } from "@/lib/vision/output";
import type { ImageRequest, Success } from "@/lib/vision/types";
import type { LocalImage } from "@/lib/chat/image-policy";

vi.mock("@/lib/chat/image-client", async (original) => ({ ...await original<typeof import("@/lib/chat/image-client")>(), prepareImage: vi.fn() }));
let imageId = 0;
beforeEach(() => {
  imageId = 0;
  vi.mocked(prepareImage).mockImplementation(async () => { const id = `picture-${++imageId}`; return { id, mimeType: "image/png", width: 1, height: 1, blob: new Blob([new Uint8Array([imageId])]), url: `blob:${id}` }; });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
const field = () => screen.getByRole("textbox");
const send = () => screen.getByRole("button", { name: "发送消息" });
const select = () => fireEvent.change(screen.getByLabelText("选择图片", { exact: true }), { target: { files: [new File(["synthetic"], "fixture.png", { type: "image/png" })] } });
function submit(text: string) { fireEvent.change(field(), { target: { value: text } }); fireEvent.click(send()); }
it("keeps a shared historical blob alive when its composer chip is removed", async () => {
  const { result } = renderHook(useImageDraft);
  await act(async () => result.current.select([new File(["x"], "fixture.png")]));
  const image = result.current.images[0];
  act(() => { result.current.take(); result.current.addRetained(image.id); result.current.addRetained(image.id); });
  expect(result.current.images).toHaveLength(1);
  act(() => result.current.remove(image.id));
  expect(result.current.get(image.id)).toBe(image); expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  act(() => result.current.releaseUnreferenced(new Set()));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(image.url);
});
it.each([2, 3])("atomically rechecks %i prepared new pictures against history selected while preparation is pending", async (newCount) => {
  const files = (n: number) => Array.from({ length: n }, () => new File(["x"], "fixture.png"));
  const { result } = renderHook(useImageDraft);
  await act(async () => result.current.select(files(2)));
  const history = [...result.current.images];
  act(() => { result.current.take(); });
  const prepared: LocalImage[] = [];
  const create = (): LocalImage => {
    const id = `prepared-${prepared.length}`;
    const image = { id, mimeType: "image/png" as const, width: 1, height: 1, blob: new Blob(["x"]), url: `blob:${id}` };
    prepared.push(image); return image;
  };
  let finish!: (image: LocalImage) => void;
  vi.mocked(prepareImage).mockImplementation(async () => create()).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  let selection!: Promise<void>;
  act(() => { selection = result.current.select(files(newCount)); });
  act(() => { history.forEach((i) => result.current.addRetained(i.id)); });
  await act(async () => { finish(create()); await selection; });
  if (newCount === 3) {
    expect(result.current.images).toEqual(history);
    expect(result.current.error).toContain("最多可同时查看 4 张");
    for (const image of prepared) {
      expect(result.current.get(image.id)).toBeUndefined();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(image.url);
    }
  } else {
    expect(result.current.images).toHaveLength(4);
    expect(result.current.error).toBe("");
    for (const image of prepared) expect(result.current.get(image.id)).toBe(image);
  }
  for (const image of history) expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(image.url);
});
it("sends summary follow-ups without historical bytes and supports original-context reread beside a newer draft", async () => {
  const requests: ImageRequest[] = [];
  let finish!: (r: Response) => void;
  let rereadResponse: Success | undefined;
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
    const request: ImageRequest = JSON.parse(String(init.body)); requests.push(request);
    const id = `aaaaaaaa-aaaa-4aaa-8aaa-${String(requests.length).padStart(12, "0")}`;
    if (requests.length === 2) {
      const message = { ...successV2(request, "", id).message, kind: "clarification" as const, question: "需要重看角落文字。", reread: { sourceTurnId: request.turnId, sourceAssistantId: id, imageIds: ["picture-1"] }, blocks: [], notices: [] };
      message.text = canonicalImage(message, request); return Response.json({ version: 2, turnId: request.turnId, message });
    }
    if (requests.length === 4) { rereadResponse = successV2(request, "本次重看的合成观察。", id); return new Promise<Response>((resolve) => { finish = resolve; }); }
    return Response.json(successV2(request, requests.length === 1 ? "最初的合成观察。" : "后来的独立问题。", id));
  }));
  render(<ChatConversation />); select(); await screen.findByRole("button", { name: "移除图片 1" });
  submit("先解读图片"); await screen.findByText("最初的合成观察。");
  submit("请读角落的小字"); await screen.findByRole("button", { name: "重看图片并回答" });
  expect(screen.getByLabelText("重新查看的图片")).toHaveTextContent("重新查看：[图片1]");
  expect(screen.getByLabelText("重新查看的图片").querySelector("a")).toHaveAttribute("href", "#image-picture-1");
  expect(requests[1].inputs).toEqual([]); expect(JSON.stringify(requests[1])).not.toContain(requests[0].inputs[0].data);
  expect(requests[1].observations[0].id).toBeDefined();
  submit("这是后来的独立问题"); await screen.findByText("后来的独立问题。");
  select(); await screen.findByRole("button", { name: "移除图片 1" }); fireEvent.change(field(), { target: { value: "独立的新草稿" } });
  act(() => { const reread = screen.getByRole("button", { name: "重看图片并回答" }); fireEvent.click(reread); fireEvent.click(reread); });
  await waitFor(() => expect(requests).toHaveLength(4));
  expect(requests[3].messages.at(-1)?.text).toBe("请读角落的小字"); expect(requests[3].intent.kind).toBe("reread");
  expect(JSON.stringify(requests[3])).not.toContain("这是后来的独立问题"); expect(JSON.stringify(requests[3])).not.toContain("独立的新草稿");
  expect(requests[3].inputs.map((i) => i.imageId)).toEqual(["picture-1"]);
  await act(async () => finish(Response.json(rereadResponse)));
  await screen.findByText("本次重看的合成观察。");
  expect(field()).toHaveValue("独立的新草稿"); expect(screen.getByRole("button", { name: "移除图片 1" })).toBeEnabled();
  expect(screen.getByText("最初的合成观察。")).toBeInTheDocument(); expect(fetch).toHaveBeenCalledTimes(4);
});
it("preserves page-stable labels after a failed picture and exposes removable historical selection", async () => {
  const requests: ImageRequest[] = [];
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
    const request = JSON.parse(String(init.body)); requests.push(request);
    return requests.length === 1 ? Response.json({ error: { code: "provider_failed" } }, { status: 502 }) : Response.json(successV2(request, "第二张图片的观察。"));
  }));
  render(<ChatConversation />); select(); await screen.findByRole("button", { name: "移除图片 1" }); submit("第一张失败"); await screen.findByRole("button", { name: "重试" });
  select(); await screen.findByRole("button", { name: "移除图片 1" }); submit("第二张成功"); await screen.findByText("第二张图片的观察。");
  expect(requests[1].images.map((i) => [i.id, i.displayIndex])).toEqual([["picture-2", 2]]);
  expect(requests[1].messages).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "用于本次提问：图片 2" }));
  expect(screen.getByLabelText("本次选用的历史图片")).toHaveTextContent("图片 2");
  fireEvent.click(screen.getByLabelText("本次选用的历史图片").querySelector("button")!);
  expect(screen.queryByLabelText("本次选用的历史图片")).not.toBeInTheDocument();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  const links = screen.getAllByRole("link", { name: "[图片2]" });
  expect(links).toHaveLength(2); links.forEach((link) => expect(link).toHaveAttribute("href", "#image-picture-2"));
});
it.each(["chip", "original"])("removes committed group membership through the %s control and does not restore it on reselection", async (control) => {
  const requests: ImageRequest[] = [];
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
    const request = JSON.parse(String(init.body)); requests.push(request);
    return Response.json(successV2(request, "合成观察。", `aaaaaaaa-aaaa-4aaa-8aaa-${String(requests.length).padStart(12, "0")}`));
  }));
  render(<ChatConversation />);
  fireEvent.change(screen.getByLabelText("选择图片", { exact: true }), { target: { files: [new File(["x"], "a.png"), new File(["x"], "b.png")] } });
  await screen.findByRole("button", { name: "移除图片 2" }); submit("先看两张图");
  await screen.findByRole("button", { name: "用于本次提问：图片 1" });
  for (const n of [1, 2]) fireEvent.click(screen.getByRole("button", { name: `用于本次提问：图片 ${n}` }));
  fireEvent.click(screen.getByText("图片分组（可选）"));
  for (const n of [1, 2]) fireEvent.click(screen.getByRole("button", { name: `选择分组：图片 ${n}` }));
  fireEvent.click(screen.getByRole("button", { name: "标为同一件作品" }));
  expect(screen.getByText("同一作品：图片 1、图片 2")).toBeInTheDocument();
  const source = control === "chip" ? screen.getByLabelText("本次选用的历史图片") : screen.getByRole("list", { name: "对话消息" });
  fireEvent.click(within(source).getByRole("button", { name: "取消选择：图片 2" }));
  fireEvent.click(screen.getByRole("button", { name: "用于本次提问：图片 2" }));
  expect(screen.queryByText("同一作品：图片 1、图片 2")).not.toBeInTheDocument();
  submit("分别解读"); await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1].sameWorkSets).toEqual([]);
});
