import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "@/app/page";

it("opens the home page with welcome guidance and no preloaded conversation", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: "一起探索唐卡艺术" })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "消息内容" })).toHaveValue("");
  expect(screen.queryByRole("list", { name: "对话消息" })).not.toBeInTheDocument();
  expect(screen.queryByText(/示例回答|示例来源/)).not.toBeInTheDocument();
});
