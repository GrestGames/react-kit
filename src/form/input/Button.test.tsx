import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Button } from "./Button";

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

describe("Button confirmDouble", () => {
  it("first click arms (swaps to a confirm label, no fire)", async () => {
    const handler = vi.fn();
    render(<Button confirmDouble onClick={handler}>Delete</Button>);
    const btn = screen.getByRole("button", { name: "Delete" });
    await userEvent.click(btn);
    expect(handler).not.toHaveBeenCalled();
    expect(btn.className).toContain("rkBtn-armed");
    expect(btn.textContent).not.toBe("Delete");
  });

  it("second click fires onClick once and disarms", async () => {
    const handler = vi.fn();
    render(<Button confirmDouble onClick={handler}>Delete</Button>);
    const btn = screen.getByRole("button", { name: "Delete" });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(btn.className).not.toContain("rkBtn-armed");
  });

  it("exposes confirmDoubleText as the tooltip while armed", async () => {
    const handler = vi.fn();
    render(<Button confirmDouble confirmDoubleText="Really delete?" onClick={handler}>Delete</Button>);
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.getAttribute("title")).toBeNull();
    await userEvent.click(btn);
    expect(btn.getAttribute("title")).toBe("Really delete?");
  });

  it("disarms after the confirm window", () => {
    vi.useFakeTimers();
    try {
      const handler = vi.fn();
      render(<Button confirmDouble onClick={handler}>Delete</Button>);
      const btn = screen.getByRole("button", { name: "Delete" });
      act(() => { fireEvent.click(btn); });
      expect(btn.className).toContain("rkBtn-armed");
      act(() => { vi.advanceTimersByTime(2000); });
      expect(btn.className).not.toContain("rkBtn-armed");
      expect(handler).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
