import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "@/app/page";

it("renders the current home page with its primary heading and documentation link", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /to get started/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute(
    "href",
    expect.stringContaining("https://nextjs.org/docs"),
  );
});
