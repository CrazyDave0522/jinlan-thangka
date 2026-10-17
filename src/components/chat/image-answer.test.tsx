import { expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ImageAnswer } from "./image-answer";
import { visitorRequest } from "../../../tests/fixtures/vision-archive";
import { successV2 } from "../../../tests/fixtures/vision";
import { REREAD_QUESTION } from "@/lib/vision/output";

it("shows only the captured reread targets with their stable picture labels and jump links", () => {
  const request = visitorRequest(3);
  request.images.forEach((image, n) => { image.displayIndex = n + 2; });
  const base = successV2(request).message;
  const message = { ...base, kind: "clarification" as const, question: REREAD_QUESTION, blocks: [], groups: [], observations: [], notices: [], reread: { sourceTurnId: request.turnId, sourceAssistantId: base.id, imageIds: ["picture-1", "picture-3"] } };
  render(<ImageAnswer message={message} request={request} />);
  const targets = screen.getByLabelText("重新查看的图片");
  expect(within(targets).getAllByRole("link").map((link) => link.textContent)).toEqual(["[图片2]", "[图片4]"]);
  expect(within(targets).getByRole("link", { name: "[图片2]" })).toHaveAttribute("href", "#image-picture-1");
  expect(within(targets).getByRole("link", { name: "[图片4]" })).toHaveAttribute("href", "#image-picture-3");
});
it("keeps ordinary clarification questions free of a reread target list", () => {
  const request = visitorRequest(), base = successV2(request).message;
  render(<ImageAnswer request={request} message={{ ...base, kind: "clarification", question: "你想了解哪一部分？", reread: null, blocks: [], groups: [], observations: [], notices: [] }} />);
  expect(screen.getByText("你想了解哪一部分？")).toBeInTheDocument();
  expect(screen.queryByLabelText("重新查看的图片")).not.toBeInTheDocument();
});
it("presents incomplete identifier evidence without claiming a contradiction", () => {
  const request = visitorRequest(), message = successV2(request).message;
  message.groups[0].searchStatus = "matched";
  message.groups[0].candidates = [{ artworkId: "10000000-0000-4000-8000-000000000001", label: "合成作品" }];
  message.groups[0].identity = { status: "candidates", reasons: ["identifier_unclear"] };
  render(<ImageAnswer request={request} message={message} />);
  const identity = screen.getByRole("region", { name: "图片与档案" });
  expect(within(identity).getByText(/尚未确认具体对应/)).toBeInTheDocument();
  expect(identity).toHaveTextContent("收藏机构或藏品编号的依据不完整");
  expect(identity).not.toHaveTextContent("图片编号与记录不一致");
  expect(identity).not.toHaveTextContent("对应依据存在冲突");
});
