import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders the icon and fires onClick once", async () => {
    const handler = vi.fn();
    render(<IconButton icon="★" onClick={handler} title="Star" />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("★");
    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("shows a spinner while an async onClick is in-flight and ignores re-clicks", async () => {
    let resolve: () => void;
    const pending = new Promise<void>((r) => { resolve = r; });
    const handler = vi.fn(() => pending);

    render(<IconButton icon="★" onClick={handler} title="Star" />);
    const btn = screen.getByRole("button");

    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).not.toHaveTextContent("★");

    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);

    await act(async () => { resolve!(); await pending; });
    expect(btn).not.toHaveAttribute("aria-busy");
    expect(btn).toHaveTextContent("★");
  });

  it("does not fire when disabled", async () => {
    const handler = vi.fn();
    render(<IconButton icon="★" onClick={handler} title="Star" disabled />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(handler).not.toHaveBeenCalled();
  });
});
