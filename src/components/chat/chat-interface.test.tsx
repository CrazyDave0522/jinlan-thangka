import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatInterface } from "./chat-interface";
import type { ChatMessage } from "./chat-message";
import { canonical, type AssistantMessage } from "@/lib/answers/contracts";

const messages: ChatMessage[] = [
  {
    id: "question",
    role: "user",
    text: "这幅测试图片有什么特点？",
    image: { src: "/test-image.png", alt: "测试图片", width: 120, height: 160 },
  },
  {
    id: "answer",
    role: "assistant",
    text: "无法确认具体作品。",
    evidence: "测试记录未提供作者。",
    generalKnowledge: "以下为通用艺术知识。",
    sourceLabel: "合成测试来源",
  },
];

describe("conversation presentation", () => {
  it("shows an empty welcome with brand, composer and footer rather than seeded messages", () => {
    render(<ChatInterface />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "AI 生成内容仅供参考",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "一起探索唐卡艺术",
    );
    expect(screen.getByRole("region", { name: "对话内容" })).toHaveTextContent(
      "你可以询问唐卡的题材",
    );
    expect(
      screen.queryByRole("list", { name: "对话消息" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("数据库依据")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "查看来源" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByText(/示例回答|示例来源/)).not.toBeInTheDocument();
  });

  it("displays supplied messages in order with distinct evidence and general knowledge", () => {
    render(<ChatInterface messages={messages} />);
    const items = within(
      screen.getByRole("list", { name: "对话消息" }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("这幅测试图片有什么特点？");
    expect(
      within(items[0]).getByRole("img", { name: "测试图片" }),
    ).toBeInTheDocument();
    expect(items[1]).toHaveTextContent("雪域金澜");
    expect(
      screen.getByRole("region", { name: "数据库依据" }),
    ).toHaveTextContent("测试记录未提供作者。");
    expect(
      screen.getByRole("region", { name: "通用知识补充" }),
    ).toHaveTextContent("以下为通用艺术知识。");
    expect(screen.queryByText("一起探索唐卡艺术")).not.toBeInTheDocument();
  });

  it("omits absent images, evidence, general knowledge, and source controls", () => {
    render(
      <ChatInterface
        messages={[
          { id: "plain", role: "user", text: "纯文本" },
          { id: "reply", role: "assistant", text: "简单回答" },
        ]}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "数据库依据" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "通用知识补充" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "查看来源" }),
    ).not.toBeInTheDocument();
  });

  it("retains the question and provides a readable fallback after image failure", () => {
    render(<ChatInterface messages={messages} />);
    fireEvent.error(screen.getByRole("img", { name: "测试图片" }));
    expect(screen.getByRole("status")).toHaveTextContent("图片暂时无法显示");
    expect(screen.getByText("这幅测试图片有什么特点？")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "测试图片" }),
    ).not.toBeInTheDocument();
  });

  it("can render a replacement attachment after a prior image fails", () => {
    const { rerender } = render(<ChatInterface messages={messages} />);
    fireEvent.error(screen.getByRole("img", { name: "测试图片" }));
    rerender(
      <ChatInterface
        messages={[
          {
            id: "question",
            role: "user",
            text: "替换图片",
            image: {
              src: "/replacement.png",
              alt: "替换的测试图片",
              width: 100,
              height: 100,
            },
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("img", { name: "替换的测试图片" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("supports isolated presentation without a conversation controller", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatInterface />);
    const field = screen.getByRole("textbox", { name: "消息内容" });
    await user.type(field, "介绍唐卡{Enter}继续编辑");
    expect(field).toHaveValue("介绍唐卡\n继续编辑");
    expect(screen.getByRole("button", { name: "发送消息" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "上传图片" })).toBeDisabled();
    expect(field).toHaveAccessibleDescription(
      expect.stringContaining("最多 4 张 JPG/JPEG、PNG"),
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("copies supplied content without inventing structured sources", async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<ChatInterface messages={messages} />);
    expect(screen.queryByRole("button", { name: "查看来源" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "复制回答" }));
    expect(clipboard).toHaveBeenCalledWith("无法确认具体作品。\n\n数据库依据\n测试记录未提供作者。\n\n通用知识补充\n以下为通用艺术知识。");
    expect(screen.getByRole("status", { name: "复制状态" })).toHaveTextContent("已复制");
  });
});

describe("structured answer section headings", () => {
  it("shows one general-knowledge heading for three consecutive paragraphs, without repeated canonical text", () => {
    const structured: AssistantMessage = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      role: "assistant",
      kind: "answer",
      text: "",
      blocks: [
        { kind: "general", text: "题材指画面表现的内容。", evidenceKeys: [] },
        { kind: "general", text: "风格指画面的表现方式。", evidenceKeys: [] },
        {
          kind: "general",
          text: "同一题材可以采用不同风格。",
          evidenceKeys: [],
        },
      ],
      references: [],
      notices: ["no_retrieval"],
    };
    structured.text = canonical(structured);
    render(<ChatInterface messages={[{ ...structured, structured }]} />);
    expect(
      screen.getAllByRole("heading", { name: "通用知识补充" }),
    ).toHaveLength(1);
    const section = screen.getByRole("region", { name: "通用知识补充" });
    expect(
      Array.from(section.querySelectorAll("p"), (p) => p.textContent),
    ).toEqual(structured.blocks.map((b) => b.text));
    for (const block of structured.blocks)
      expect(screen.getAllByText(block.text, { exact: true })).toHaveLength(1);
    expect(screen.queryByText(structured.text)).not.toBeInTheDocument();
    expect(
      screen.getAllByText("本次为通用知识交流，未检索数据库。", {
        exact: true,
      }),
    ).toHaveLength(1);
  });

  it("groups adjacent evidence paragraphs while retaining mixed-content order, citations and separate answer boundaries", () => {
    const structured: AssistantMessage = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      role: "assistant",
      kind: "answer",
      text: "",
      blocks: [
        { kind: "general", text: "先说明一般背景。", evidenceKeys: [] },
        {
          kind: "archive",
          text: "档案中的姓名是测试画师。",
          evidenceKeys: ["E1"],
        },
        {
          kind: "archive",
          text: "该记录采用测试画师这一展示名称。",
          evidenceKeys: ["E1"],
        },
        { kind: "general", text: "最后补充一般知识。", evidenceKeys: [] },
      ],
      references: [
        {
          key: "E1",
          owner: {
            table: "artists",
            id: "00000000-0000-0000-0000-000000000001",
          },
          label: "测试画师",
          field: "display_name",
          value: "测试画师",
          reviewStatus: "verified",
          attributionStatus: null,
          sources: [],
        },
      ],
      notices: ["record_only"],
    };
    structured.text = canonical(structured);
    const next = {
      ...structured,
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      blocks: [
        {
          kind: "general" as const,
          text: "下一条独立回答。",
          evidenceKeys: [],
        },
      ],
      references: [],
      notices: [],
    };
    next.text = canonical(next);
    render(
      <ChatInterface
        messages={[
          { ...structured, structured },
          { ...next, structured: next },
        ]}
      />,
    );
    const answers = screen.getAllByRole("listitem", { name: "雪域金澜的回答" });
    expect(
      within(answers[0])
        .getAllByRole("heading", { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(["通用知识补充", "数据库依据", "通用知识补充"]);
    const evidence = within(answers[0]).getByRole("region", {
      name: "数据库依据",
    });
    expect(
      Array.from(evidence.querySelectorAll("p"), (p) => p.textContent),
    ).toEqual([
      "档案中的姓名是测试画师。[E1]",
      "该记录采用测试画师这一展示名称。[E1]",
    ]);
    fireEvent.click(within(answers[0]).getByRole("button", { name: "查看来源" }));
    expect(
      within(answers[0]).getByRole("region", { name: "本条回答使用的依据" }),
    ).toHaveTextContent("[E1] 测试画师 · 姓名");
    expect(
      within(answers[1]).getAllByRole("heading", { name: "通用知识补充" }),
    ).toHaveLength(1);
    expect(
      within(answers[1]).getByText("下一条独立回答。", { exact: true }),
    ).toBeInTheDocument();
  });
});
