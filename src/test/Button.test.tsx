import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Button } from "../form/input/Button";

describe("Button onClick fires exactly once per click", () => {
  it("calls onClick once when clicked", async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls onClick once under React.StrictMode", async () => {
    const handler = vi.fn();
    render(
      <React.StrictMode>
        <Button onClick={handler}>Strict</Button>
      </React.StrictMode>
    );
    const btn = screen.getByRole("button", { name: "Strict" });
    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire again while async onClick is in-flight", async () => {
    let resolve: () => void;
    const pending = new Promise<void>((r) => { resolve = r; });
    const handler = vi.fn(() => pending);

    render(<Button onClick={handler}>Async</Button>);
    const btn = screen.getByRole("button", { name: "Async" });

    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);

    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);

    await act(async () => { resolve!(); await pending; });
  });
});
