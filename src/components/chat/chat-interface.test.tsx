import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatInterface } from "./chat-interface";
import type { ChatMessage } from "./chat-message";

const messages: ChatMessage[] = [
  { id: "question", role: "user", text: "这幅测试图片有什么特点？", image: { src: "/test-image.png", alt: "测试图片", width: 120, height: 160 } },
  { id: "answer", role: "assistant", text: "无法确认具体作品。", evidence: "测试记录未提供作者。", generalKnowledge: "以下为通用艺术知识。", sourceLabel: "合成测试来源" },
];

describe("conversation presentation", () => {
  it("shows an empty welcome with brand, composer and footer rather than seeded messages", () => {
    render(<ChatInterface />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("AI 生成内容仅供参考");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("一起探索唐卡艺术");
    expect(screen.getByRole("region", { name: "对话内容" })).toHaveTextContent("你可以询问唐卡的题材");
    expect(screen.queryByRole("list", { name: "对话消息" })).not.toBeInTheDocument();
    expect(screen.queryByText("数据库依据")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "查看来源" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByText(/示例回答|示例来源/)).not.toBeInTheDocument();
  });

  it("displays supplied messages in order with distinct evidence and general knowledge", () => {
    render(<ChatInterface messages={messages} />);
    const items = within(screen.getByRole("list", { name: "对话消息" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("这幅测试图片有什么特点？");
    expect(within(items[0]).getByRole("img", { name: "测试图片" })).toBeInTheDocument();
    expect(items[1]).toHaveTextContent("雪域金澜");
    expect(screen.getByRole("region", { name: "数据库依据" })).toHaveTextContent("测试记录未提供作者。");
    expect(screen.getByRole("region", { name: "通用知识补充" })).toHaveTextContent("以下为通用艺术知识。");
    expect(screen.queryByText("一起探索唐卡艺术")).not.toBeInTheDocument();
  });

  it("omits absent images, evidence, general knowledge, and source controls", () => {
    render(<ChatInterface messages={[{ id: "plain", role: "user", text: "纯文本" }, { id: "reply", role: "assistant", text: "简单回答" }]} />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "数据库依据" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "通用知识补充" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "查看来源" })).not.toBeInTheDocument();
  });

  it("retains the question and provides a readable fallback after image failure", () => {
    render(<ChatInterface messages={messages} />);
    fireEvent.error(screen.getByRole("img", { name: "测试图片" }));
    expect(screen.getByRole("status")).toHaveTextContent("图片暂时无法显示");
    expect(screen.getByText("这幅测试图片有什么特点？")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "测试图片" })).not.toBeInTheDocument();
  });

  it("can render a replacement attachment after a prior image fails", () => {
    const { rerender } = render(<ChatInterface messages={messages} />);
    fireEvent.error(screen.getByRole("img", { name: "测试图片" }));
    rerender(<ChatInterface messages={[{ id: "question", role: "user", text: "替换图片", image: { src: "/replacement.png", alt: "替换的测试图片", width: 100, height: 100 } }]} />);
    expect(screen.getByRole("img", { name: "替换的测试图片" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps an editable draft including Enter without sending requests or adding messages", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatInterface />);
    const field = screen.getByRole("textbox", { name: "消息内容" });
    await user.type(field, "介绍唐卡{Enter}继续编辑");
    expect(field).toHaveValue("介绍唐卡\n继续编辑");
    expect(screen.getByRole("button", { name: "发送消息" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "上传图片" })).toBeDisabled();
    expect(field).toHaveAccessibleDescription(expect.stringContaining("发送和上传功能暂未开放"));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps source and copy actions disabled and explained", async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, "writeText");
    render(<ChatInterface messages={messages} />);
    const source = screen.getByRole("button", { name: "查看来源" });
    const copy = screen.getByRole("button", { name: "复制回答" });
    expect(source).toBeDisabled();
    expect(copy).toBeDisabled();
    expect(source).toHaveAccessibleDescription("来源查看与复制功能暂未开放。");
    // Native disabled behavior is asserted; forcing pointer events would bypass the UI contract.
    expect(clipboard).not.toHaveBeenCalled();
    await user.tab();
    expect(source).not.toHaveFocus();
    expect(copy).not.toHaveFocus();
  });
});
