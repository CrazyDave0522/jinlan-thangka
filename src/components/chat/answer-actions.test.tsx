import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { ChatInterface } from "./chat-interface";
import { COPY_PENDING_MS, COPY_SUCCESS_MS, COPY_WAIT_MS } from "./answer-copy";
import { exportAnswer } from "@/lib/answers/presentation";
import { canonicalImage, parseAssistantV2 } from "@/lib/vision/output";
import {
  imageSourceAnswer,
  sourceAnswer,
  sourceId,
} from "../../../tests/fixtures/answer-sources";

afterEach(() => vi.useRealTimers());
function clipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  vi.stubGlobal(
    "navigator",
    Object.create(navigator, {
      clipboard: { value: { writeText }, configurable: true },
    }),
  );
  return writeText;
}
function deferred() {
  let resolve!: () => void;
  let reject!: () => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const answerItems = () =>
  screen.getAllByRole("listitem", { name: "雪域金澜的回答" });

it("opens the exact answer/occurrence, returns focus, and keeps same-key answers independent without requests", async () => {
  const user = userEvent.setup();
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(
    <ChatInterface
      messages={[sourceAnswer(), sourceAnswer("新生平", sourceId(9002))]}
    />,
  );
  const [first, second] = answerItems().map((item) => within(item));
  expect(first.getByRole("button", { name: "查看来源" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  const markers = first.getAllByRole("button", { name: "查看依据 E1：生平" });
  await user.click(markers[1]);
  expect(first.getByLabelText("依据 E1")).toHaveFocus();
  expect(
    first.getByRole("region", { name: "本条回答使用的依据" }),
  ).toHaveTextContent("第 7 页");
  expect(second.getByRole("button", { name: "查看来源" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await user.click(first.getByRole("button", { name: "返回引用" }));
  expect(markers[1]).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(first.getByLabelText("依据 E1")).toHaveFocus();
  await user.click(first.getByRole("button", { name: "查看来源" }));
  expect(first.getByRole("button", { name: "查看来源" })).toHaveFocus();
  const ids = [...document.querySelectorAll("[id]")].map(
    (element) => element.id,
  );
  expect(new Set(ids).size).toBe(ids.length);
  expect(fetch).not.toHaveBeenCalled();
});

it("does not fabricate a return target on direct expansion or a source area on plain answers", async () => {
  const user = userEvent.setup();
  render(
    <ChatInterface
      messages={[
        sourceAnswer(),
        { id: "plain", role: "assistant", text: "只有通用说明" },
        { id: "empty", role: "assistant", text: "" },
      ]}
    />,
  );
  await user.click(
    within(answerItems()[0]).getByRole("button", { name: "查看来源" }),
  );
  expect(
    screen.queryByRole("button", { name: "返回引用" }),
  ).not.toBeInTheDocument();
  expect(
    within(answerItems()[1]).queryByRole("button", { name: "查看来源" }),
  ).not.toBeInTheDocument();
  expect(
    within(answerItems()[2]).getByRole("button", { name: "复制回答" }),
  ).toBeDisabled();
});

it("recognizes keyboard scrolling from source content while preserving fallback text selection and control activation", async () => {
  const user = userEvent.setup();
  const scroll = vi.fn();
  clipboard(vi.fn().mockRejectedValue(new Error("Denied")));
  render(<ChatInterface messages={[sourceAnswer()]} onScrollIntent={scroll} />);
  const marker = screen.getAllByRole("button", { name: "查看依据 E1：生平" })[0];
  await user.click(marker);
  fireEvent.keyDown(screen.getByLabelText("依据 E1"), { key: "End" });
  expect(scroll).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(marker, { key: "PageDown" });
  expect(scroll).toHaveBeenCalledTimes(2);
  fireEvent.keyDown(screen.getByRole("region", { name: "对话内容" }), { key: "Home" });
  expect(scroll).toHaveBeenCalledTimes(3);
  await user.click(screen.getByRole("button", { name: "复制回答" }));
  await user.click(screen.getByRole("button", { name: "选择全部" }));
  const field = screen.getByRole("textbox", { name: "本条回答的复制文本" });
  fireEvent.keyDown(field, { key: "End", shiftKey: true });
  fireEvent.keyDown(field, { key: "PageDown" });
  fireEvent.keyDown(screen.getByRole("button", { name: "复制回答" }), { key: " " });
  expect(scroll).toHaveBeenCalledTimes(3);
});

it("renders exact source associations, inert markup and blank/record-only qualifications", async () => {
  const user = userEvent.setup();
  const answer = sourceAnswer();
  answer.structured.references[0].sources[0].title =
    '<img src="https://literal.test/picture">';
  answer.structured.references[0].sources[0].locator = " ";
  answer.structured.references[0].sources[1].title = " ";
  render(<ChatInterface messages={[answer]} />);
  await user.click(screen.getByRole("button", { name: "查看来源" }));
  const area = screen.getByRole("region", { name: "本条回答使用的依据" });
  expect(area).toHaveTextContent("未记录标题");
  expect(area).toHaveTextContent("未记录引用位置");
  expect(area).toHaveTextContent("未限定支持字段");
  expect(area).toHaveTextContent("待核验");
  expect(area.querySelector("img,a")).toBeNull();
  expect(area).toHaveTextContent(sourceId(11));
  expect(area).toHaveTextContent(sourceId(12));
});

it("preserves image-answer disclosure and partial selection across equivalent context recreation without overriding deliberate focus", async () => {
  const user = userEvent.setup();
  clipboard(vi.fn().mockRejectedValue(new Error("Denied")));
  const answer = imageSourceAnswer();
  parseAssistantV2(answer.structured, answer.imageContext);
  const next = sourceAnswer("新回答", sourceId(9002));
  const recreate = () => ({ ...answer, imageContext: structuredClone(answer.imageContext) });
  const { rerender } = render(<ChatInterface messages={[answer]} />);
  await user.click(screen.getByRole("button", { name: "查看来源" }));
  await user.click(screen.getByRole("button", { name: "复制回答" }));
  await user.click(screen.getByRole("button", { name: "选择全部" }));
  const field = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "本条回答的复制文本" });
  field.setSelectionRange(3, 11, "backward");
  const output = field.value;
  rerender(<ChatInterface messages={[recreate(), next]} />);
  expect(field).toHaveFocus();
  expect(field).toHaveValue(output);
  expect([field.selectionStart, field.selectionEnd, field.selectionDirection]).toEqual([3, 11, "backward"]);
  expect(within(answerItems()[0]).getByRole("button", { name: "查看来源" })).toHaveAttribute("aria-expanded", "true");
  const other = within(answerItems()[1]).getByRole("button", { name: "查看来源" });
  await user.click(other);
  rerender(<ChatInterface messages={[recreate(), next]} />);
  expect(other).toHaveFocus();
  expect(field).not.toHaveFocus();
});

it("copies the same full answer with sources closed/open, and awaits actual success", async () => {
  vi.useFakeTimers();
  const pending = deferred();
  const write = clipboard(
    vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined),
  );
  const answer = sourceAnswer();
  render(<ChatInterface messages={[answer]} />);
  const copy = screen.getByRole("button", { name: "复制回答" });
  fireEvent.click(copy);
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent(
    "正在复制",
  );
  expect(screen.queryAllByRole("status", { name: "复制状态" }).some((node) => node.textContent === "已复制")).toBe(false);
  await act(async () => pending.resolve());
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent(
    "已复制",
  );
  fireEvent.click(screen.getByRole("button", { name: "查看来源" }));
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS));
  fireEvent.click(copy);
  await act(async () => {});
  expect(write.mock.calls.map((call) => call[0])).toEqual([
    exportAnswer(answer),
    exportAnswer(answer),
  ]);
});

it("restores the copy icon after two seconds and ignores repeated success activation without losing focus", async () => {
  vi.useFakeTimers();
  const pending = deferred();
  const write = clipboard(vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined));
  const answer = sourceAnswer();
  render(<ChatInterface messages={[answer]} />);
  const copy = screen.getByRole("button", { name: "复制回答" });
  copy.focus();
  fireEvent.click(copy);
  await act(async () => pending.resolve());
  expect(copy).toHaveFocus();
  expect(copy).toHaveAttribute("aria-disabled", "true");
  expect(copy).not.toBeDisabled();
  expect(copy.querySelector("svg.lucide-check")).toHaveClass("opacity-100");
  expect(copy.querySelector("svg.lucide-copy")).toHaveClass("opacity-0");
  expect(screen.getAllByText("已复制")).toHaveLength(2);
  expect(screen.getAllByRole("status", { name: "复制状态" })).toHaveLength(1);
  fireEvent.click(copy);
  fireEvent.keyDown(copy, { key: "Enter" });
  fireEvent.keyUp(copy, { key: "Enter" });
  fireEvent.keyDown(copy, { key: " " });
  fireEvent.keyUp(copy, { key: " " });
  expect(write).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  await act(async () => vi.advanceTimersByTime(1_999));
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  await act(async () => vi.advanceTimersByTime(1));
  expect(screen.queryByRole("status", { name: "复制状态" })).not.toBeInTheDocument();
  expect(screen.getByText("已复制")).toHaveAttribute("aria-hidden", "true");
  expect(copy).not.toHaveAttribute("aria-disabled", "true");
  expect(copy.querySelector("svg.lucide-copy")).toHaveClass("opacity-100");
  expect(copy.querySelector("svg.lucide-check")).toHaveClass("opacity-0");
  expect(copy).toHaveFocus();
  expect(write).toHaveBeenCalledTimes(1);
  fireEvent.click(copy);
  await act(async () => {});
  expect(write).toHaveBeenCalledTimes(2);
  expect(write.mock.calls.every(([text]) => text === exportAnswer(answer))).toBe(true);
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
});

it("skips a visible pending flash on quick success and starts a fresh visibility delay for the next write", async () => {
  vi.useFakeTimers();
  const first = deferred(), second = deferred();
  const write = clipboard(vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise));
  const { unmount } = render(<ChatInterface messages={[sourceAnswer()]} />);
  const copy = screen.getByRole("button", { name: "复制回答" });
  fireEvent.click(copy);
  const pending = screen.getByRole("status", { name: "复制状态" });
  expect(pending).toHaveTextContent("正在复制");
  expect(pending).toHaveClass("sr-only");
  await act(async () => vi.advanceTimersByTime(299));
  expect(pending).toHaveClass("sr-only");
  await act(async () => first.resolve());
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  expect(vi.getTimerCount()).toBe(1);
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS));
  fireEvent.click(copy);
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveClass("sr-only");
  await act(async () => vi.advanceTimersByTime(COPY_PENDING_MS - 1));
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveClass("sr-only");
  await act(async () => vi.advanceTimersByTime(1));
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("正在复制");
  expect(screen.getByRole("status", { name: "复制状态" })).not.toHaveClass("sr-only");
  expect(write).toHaveBeenCalledTimes(2);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  await act(async () => second.resolve());
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps success intervals answer-local without extending them on incidental rerenders", async () => {
  vi.useFakeTimers();
  const write = clipboard();
  const messages = [sourceAnswer(), sourceAnswer("第二条生平", sourceId(9002))];
  const { rerender } = render(<ChatInterface messages={messages} />);
  const [first, second] = answerItems().map((item) => within(item));
  fireEvent.click(first.getByRole("button", { name: "复制回答" }));
  await act(async () => {});
  await act(async () => vi.advanceTimersByTime(500));
  fireEvent.click(second.getByRole("button", { name: "复制回答" }));
  await act(async () => {});
  expect(write).toHaveBeenCalledTimes(2);
  rerender(<ChatInterface messages={[...messages]} />);
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS - 500));
  expect(first.queryByRole("status", { name: "复制状态" })).not.toBeInTheDocument();
  expect(second.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  await act(async () => vi.advanceTimersByTime(500));
  expect(second.queryByRole("status", { name: "复制状态" })).not.toBeInTheDocument();
  expect(write).toHaveBeenCalledTimes(2);
});

it("preserves manual text and partial selection through retry success and reset, and can dismiss during success", async () => {
  vi.useFakeTimers();
  const pending = deferred();
  const write = clipboard(vi.fn().mockRejectedValueOnce(new Error("Denied")).mockReturnValueOnce(pending.promise).mockResolvedValue(undefined));
  render(<ChatInterface messages={[sourceAnswer()]} />);
  const copy = screen.getByRole("button", { name: "复制回答" });
  fireEvent.click(copy);
  await act(async () => {});
  const field = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "本条回答的复制文本" });
  field.focus();
  field.setSelectionRange(3, 12, "backward");
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS));
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("暂时无法自动复制");
  fireEvent.click(copy);
  await act(async () => pending.resolve());
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS));
  expect(screen.getByRole("textbox", { name: "本条回答的复制文本" })).toBe(field);
  expect(field).toHaveFocus();
  expect([field.selectionStart, field.selectionEnd, field.selectionDirection]).toEqual([3, 12, "backward"]);
  expect(screen.queryByRole("status", { name: "复制状态" })).not.toBeInTheDocument();
  fireEvent.click(copy);
  await act(async () => {});
  expect(copy).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(screen.getByRole("button", { name: "收起复制文本" }));
  expect(copy).toHaveFocus();
  expect(screen.queryByRole("textbox", { name: "本条回答的复制文本" })).not.toBeInTheDocument();
  await act(async () => vi.advanceTimersByTime(COPY_SUCCESS_MS));
  expect(copy).toHaveFocus();
  expect(write).toHaveBeenCalledTimes(3);
});

it("cleans up the success reset when its answer unmounts", async () => {
  vi.useFakeTimers();
  clipboard();
  const { unmount } = render(<ChatInterface messages={[sourceAnswer()]} />);
  fireEvent.click(screen.getByRole("button", { name: "复制回答" }));
  await act(async () => {});
  expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it.each(["missing", "throw", "reject"])(
  "recovers from %s clipboard without success, supports selection/dismissal and explicit retry",
  async (mode) => {
    const user = userEvent.setup();
    const write = clipboard(
      mode === "throw"
        ? vi.fn().mockImplementation(() => {
            throw new Error("Denied");
          })
        : vi.fn().mockRejectedValue(new Error("Denied")),
    );
    if (mode === "missing")
      vi.stubGlobal(
        "navigator",
        Object.create(navigator, { clipboard: { value: undefined } }),
      );
    const answer = sourceAnswer();
    render(<ChatInterface messages={[answer]} />);
    await user.click(screen.getByRole("button", { name: "复制回答" }));
    const field = screen.getByRole("textbox", { name: "本条回答的复制文本" });
    expect(field).toHaveAttribute("readonly");
    expect(field).toHaveValue(exportAnswer(answer));
    expect(field).not.toHaveFocus();
    expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent(
      "暂时无法自动复制",
    );
    await user.click(screen.getByRole("button", { name: "选择全部" }));
    expect(field).toHaveFocus();
    expect((field as HTMLTextAreaElement).selectionEnd).toBe(
      exportAnswer(answer).length,
    );
    await user.click(screen.getByRole("button", { name: "收起复制文本" }));
    expect(screen.getByRole("button", { name: "复制回答" })).toHaveFocus();
    expect(
      screen.queryByRole("textbox", { name: "本条回答的复制文本" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("暂时无法自动复制，可再次点击复制重试。");
    if (mode !== "missing") {
      write.mockResolvedValue(undefined);
      await user.click(screen.getByRole("button", { name: "复制回答" }));
      expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
    }
  },
);

it.each(["resolve", "reject"] as const)("arbitrates writes and retains the lease through waiting/dismissal until late %s", async (settle) => {
  vi.useFakeTimers();
  const pending = deferred();
  const write = clipboard(
    vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined),
  );
  render(
    <ChatInterface
      messages={[sourceAnswer(), sourceAnswer("第二条生平", sourceId(9002))]}
    />,
  );
  const [first, second] = answerItems().map((item) => within(item));
  fireEvent.click(first.getByRole("button", { name: "复制回答" }));
  fireEvent.click(second.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledTimes(1);
  expect(second.getByText(/另一条回答正在复制/)).toBeInTheDocument();
  fireEvent.click(second.getByRole("button", { name: "收起复制文本" }));
  expect(second.getByRole("status")).toHaveTextContent("另一条回答正在复制；可再次点击复制展开文本。");
  await act(async () => vi.advanceTimersByTime(COPY_WAIT_MS));
  expect(first.getByText(/浏览器尚未完成复制/)).toBeInTheDocument();
  fireEvent.click(first.getByRole("button", { name: "收起复制文本" }));
  expect(first.getByRole("status")).toHaveTextContent("浏览器尚未完成复制；可再次点击复制展开文本，或待当前操作结束后重试。");
  fireEvent.click(first.getByRole("button", { name: "复制回答" }));
  expect(first.getByRole("textbox", { name: "本条回答的复制文本" })).toBeInTheDocument();
  fireEvent.click(first.getByRole("button", { name: "收起复制文本" }));
  fireEvent.click(second.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledTimes(1);
  await act(async () => pending[settle]());
  expect(screen.queryAllByRole("status", { name: "复制状态" }).some((node) => node.textContent === "已复制")).toBe(false);
  expect(
    first.queryByRole("textbox", { name: "本条回答的复制文本" }),
  ).not.toBeInTheDocument();
  expect(second.getByText("等待已结束，可再次点击复制。")).toBeInTheDocument();
  fireEvent.click(second.getByRole("button", { name: "复制回答" }));
  await act(async () => {});
  expect(write).toHaveBeenCalledTimes(2);
  expect(second.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  expect(
    second.getByRole("textbox", { name: "本条回答的复制文本" }),
  ).toBeInTheDocument();
});

it("keeps a removed message's actual write guarded until settlement and suppresses its feedback", async () => {
  const user = userEvent.setup();
  const pending = deferred();
  const write = clipboard(
    vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined),
  );
  const first = sourceAnswer(),
    second = sourceAnswer("第二条", sourceId(9002));
  const { rerender } = render(<ChatInterface messages={[first, second]} />);
  await user.click(
    within(answerItems()[0]).getByRole("button", { name: "复制回答" }),
  );
  rerender(<ChatInterface messages={[second]} />);
  await user.click(screen.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledTimes(1);
  await act(async () => pending.reject());
  expect(screen.queryAllByRole("status", { name: "复制状态" }).some((node) => node.textContent === "已复制")).toBe(false);
  await user.click(screen.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledTimes(2);
});

it("keeps a settled waiting attempt ready when another answer begins a new write", async () => {
  vi.useFakeTimers();
  const previous = deferred(), next = deferred();
  const write = clipboard(vi.fn().mockReturnValueOnce(previous.promise).mockReturnValueOnce(next.promise));
  render(<ChatInterface messages={[sourceAnswer(), sourceAnswer("第二条", sourceId(9002))]} />);
  const [first, second] = answerItems().map((item) => within(item));
  fireEvent.click(first.getByRole("button", { name: "复制回答" }));
  await act(async () => vi.advanceTimersByTime(COPY_WAIT_MS));
  await act(async () => previous.resolve());
  expect(first.getByRole("status")).toHaveTextContent("等待已结束，可再次点击复制。");
  fireEvent.click(second.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledTimes(2);
  expect(first.getByRole("status")).toHaveTextContent("等待已结束，可再次点击复制。");
  expect(first.queryByText(/浏览器尚未完成复制/)).not.toBeInTheDocument();
  await act(async () => next.resolve());
});

it("makes proof-only E and R entries navigable and retains image qualifications", async () => {
  const user = userEvent.setup();
  const answer = imageSourceAnswer();
  answer.structured.groups[0].identity = { status: "not_requested" };
  answer.structured.text = canonicalImage(answer.structured, answer.imageContext);
  parseAssistantV2(answer.structured, answer.imageContext);
  render(<ChatInterface messages={[answer]} />);
  expect(screen.getByText("本次未请求确认具体作品。")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "查看来源" }));
  const area = screen.getByRole("region", { name: "本条回答使用的依据" });
  expect(area).toHaveTextContent("边框局部仍无法确定");
  expect(area).toHaveTextContent("右下角莲花");
  await user.click(
    within(area).getByRole("button", { name: "查看依据 E1：作品说明" }),
  );
  expect(screen.getByLabelText("依据 E1")).toHaveFocus();
  fireEvent.click(screen.getByText("图片 1 · 观察说明"));
  expect(screen.getByText(/藏品编号.*无法辨认/)).toHaveTextContent("未能辨认");
  expect(screen.getByText(/解读（暂定）/)).toBeVisible();
});

it("keeps 64 accepted entries inspectable and copies the complete upper-bound fixture", async () => {
  const user = userEvent.setup();
  const answer = imageSourceAnswer(true);
  const write = clipboard();
  render(<ChatInterface messages={[answer]} />);
  await user.click(screen.getByRole("button", { name: "查看来源" }));
  expect(screen.getByLabelText("依据 E64")).toHaveTextContent("合成画师 64");
  expect(screen.getByLabelText("依据 R4")).toHaveTextContent("图片记录");
  await user.click(screen.getByRole("button", { name: "复制回答" }));
  expect(write).toHaveBeenCalledWith(exportAnswer(answer));
  expect(write.mock.calls[0][0]).toContain("第 64 页");
});

it("keeps comparisons sharing one R input distinct and returns to the exact proof occurrence", async () => {
  const user = userEvent.setup(); const answer = imageSourceAnswer();
  answer.structured.references = answer.structured.references.slice(0, 1);
  answer.structured.referenceImages = answer.structured.referenceImages.slice(0, 1);
  answer.structured.groups[1].candidates = structuredClone(answer.structured.groups[0].candidates);
  Object.assign(answer.structured.comparisons[1], { artworkId: sourceId(1), referenceKey: "R1" });
  answer.structured.comparisons[1].proofs[0].evidenceKey = "E1";
  answer.structured.text = canonicalImage(answer.structured, answer.imageContext);
  parseAssistantV2(answer.structured, answer.imageContext);
  render(<ChatInterface messages={[answer]} />);
  await user.click(screen.getByRole("button", { name: "查看来源" }));
  const area = screen.getByRole("region", { name: "本条回答使用的依据" });
  const proofs = within(area).getAllByRole("button", { name: "查看依据 E1：作品说明" });
  expect(proofs).toHaveLength(2);
  expect(area).toHaveTextContent("图片组（图片 1） · 图片 1");
  expect(area).toHaveTextContent("图片组（图片 2） · 图片 2");
  await user.click(proofs[1]);
  await user.click(screen.getByRole("button", { name: "返回引用" }));
  expect(proofs[1]).toHaveFocus();
  expect(exportAnswer(answer)).toContain("图片 2 · 合成作品 1");
});

it("navigates an identified work's R marker without retrieving or displaying curated pixels", async () => {
  const user = userEvent.setup(); const answer = imageSourceAnswer();
  const comparison = answer.structured.comparisons[0];
  comparison.assessment = "same_work"; comparison.contradictions = [];
  comparison.proofs.push({ ...comparison.proofs[0], quote: "边框纹样", kind: "composition" });
  answer.structured.groups[0].identity = { status: "identified", method: "reference", artworkId: sourceId(1), supportingImageIds: ["picture-1"], evidenceKeys: ["E1"], referenceKeys: ["R1"] };
  answer.structured.text = canonicalImage(answer.structured, answer.imageContext);
  parseAssistantV2(answer.structured, answer.imageContext);
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  render(<ChatInterface messages={[answer]} />);
  await user.click(screen.getByRole("button", { name: "查看参考图依据 R1：档案参考图" }));
  expect(screen.getByLabelText("依据 R1")).toHaveFocus();
  expect(screen.getByLabelText("依据 R1").querySelector("img")).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
