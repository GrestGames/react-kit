import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TipBox } from "./TipBox";

describe("TipBox onClose", () => {
  it("dismisses only via the ✕, so the message text stays selectable", async () => {
    const onClose = vi.fn();
    render(<TipBox intent="danger" onClose={onClose}>SERVER_ERROR: details to copy</TipBox>);

    await userEvent.click(screen.getByText("SERVER_ERROR: details to copy"));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders no ✕ without onClose", () => {
    render(<TipBox>plain tip</TipBox>);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
