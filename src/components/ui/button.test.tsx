import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

it("allows a user to activate the shared button", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Send message</Button>);

  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(onClick).toHaveBeenCalledOnce();
});

it("prevents activation when the shared button is disabled", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Send message
    </Button>,
  );

  const button = screen.getByRole("button", { name: "Send message" });
  await user.click(button);

  expect(button).toBeDisabled();
  expect(onClick).not.toHaveBeenCalled();
});
