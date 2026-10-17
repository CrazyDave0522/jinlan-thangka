import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ImageGrouping } from "./image-grouping";
import { ChatInterface } from "./chat-interface";
import type { LocalImage } from "@/lib/chat/image-policy";

const image = (id: string): LocalImage => ({ id, mimeType: "image/png", width: 1, height: 1, blob: new Blob(["x"]), url: `blob:${id}` });
it("uses the same new-picture numbering in the preview and grouping after selected history", () => {
  const images = [image("historical"), image("first"), image("second")], labels = new Map([["historical", 7]]);
  render(<ChatInterface composer={{ draft: "", pending: false, preparing: false, error: "", images, historicalIds: ["historical"], imageLabels: labels, onChange: vi.fn(), onSubmit: vi.fn(), onKeyDown: vi.fn(), onCompositionStart: vi.fn(), onCompositionEnd: vi.fn(), onFiles: vi.fn(), onRemove: vi.fn(), extra: <ImageGrouping images={images} labels={labels} groups={[]} onChange={vi.fn()} /> }} />);
  fireEvent.click(screen.getByText("图片分组（可选）"));
  for (const n of [1, 2]) {
    expect(screen.getByRole("img", { name: `待发送图片 ${n}` })).toHaveAttribute("src", images[n].url);
    expect(screen.getByRole("button", { name: `选择分组：新图片 ${n}` })).toBeInTheDocument();
  }
  expect(screen.queryByRole("button", { name: "选择分组：新图片 3" })).not.toBeInTheDocument();
});
it("forgets an uncommitted grouping selection when its picture is removed", () => {
  const images = [image("first"), image("second")], props = { labels: new Map<string, number>(), groups: [], onChange: vi.fn() };
  const view = render(<ImageGrouping {...props} images={images} />);
  fireEvent.click(screen.getByText("图片分组（可选）"));
  fireEvent.click(screen.getByRole("button", { name: "选择分组：新图片 2" }));
  view.rerender(<ImageGrouping {...props} images={[images[0]]} />);
  view.rerender(<ImageGrouping {...props} images={images} />);
  fireEvent.click(screen.getByText("图片分组（可选）"));
  expect(screen.getByRole("button", { name: "选择分组：新图片 2" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "标为同一件作品" })).toBeDisabled();
});
