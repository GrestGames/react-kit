import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContextMenu, RkContextMenu, RkContextMenuHost } from "./ContextMenu";

afterEach(() => RkContextMenu.close());

describe("ContextMenu (wrapper)", () => {
  it("opens on right-click, runs an item, then closes", async () => {
    const onClick = vi.fn();
    render(<ContextMenu items={[{ label: "Edit", onClick }]}><button>Card</button></ContextMenu>);

    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.contextMenu(screen.getByText("Card"));

    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("marks its portal so a host's outside-click handler can treat it as inside", async () => {
    render(<ContextMenu items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
    fireEvent.contextMenu(screen.getByText("Card"));
    expect(await screen.findByRole("menu")).toHaveAttribute("data-rk-dropdown-portal");
  });

  it("does not open when disabled", async () => {
    render(<ContextMenu disabled items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
    fireEvent.contextMenu(screen.getByText("Card"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens on a plain click only when openOnClick is set", async () => {
    const { rerender } = render(<ContextMenu items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
    fireEvent.click(screen.getByText("Card"));
    expect(screen.queryByRole("menu")).toBeNull();

    rerender(<ContextMenu openOnClick items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
    fireEvent.click(screen.getByText("Card"));
    expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeTruthy();
  });

  it("openOnClick: activating an item closes the menu (item clicks don't reopen it)", async () => {
    const onClick = vi.fn();
    render(<ContextMenu openOnClick items={[{ label: "Edit", onClick }]}><button>Card</button></ContextMenu>);
    fireEvent.click(screen.getByText("Card"));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens on a long-press and swallows the synthesized click", async () => {
    vi.useFakeTimers();
    try {
      render(<ContextMenu items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
      const card = screen.getByText("Card");

      fireEvent.touchStart(card, { touches: [{ clientX: 10, clientY: 10 }] });
      expect(screen.queryByRole("menu")).toBeNull();
      act(() => { vi.advanceTimersByTime(500); });
      expect(screen.queryByRole("menu")).not.toBeNull();

      // touchend after a fired long-press must be defaultPrevented (swallows the click)
      const ended = fireEvent.touchEnd(card);
      expect(ended).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open on a quick tap (released before the long-press threshold)", () => {
    vi.useFakeTimers();
    try {
      render(<ContextMenu items={[{ label: "Edit" }]}><button>Card</button></ContextMenu>);
      const card = screen.getByText("Card");
      fireEvent.touchStart(card, { touches: [{ clientX: 10, clientY: 10 }] });
      act(() => { vi.advanceTimersByTime(100); });
      const ended = fireEvent.touchEnd(card);
      act(() => { vi.advanceTimersByTime(500); });
      expect(screen.queryByRole("menu")).toBeNull();
      // a quick tap leaves the click intact (not defaultPrevented)
      expect(ended).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("RkContextMenu (imperative)", () => {
  it("opens via the host from an onContextMenu handler and closes after an item runs", async () => {
    const onClick = vi.fn();
    render(<>
      <button onContextMenu={e => RkContextMenu.open(e, [{ label: "Edit", onClick }])}>Tile</button>
      <RkContextMenuHost />
    </>);

    fireEvent.contextMenu(screen.getByText("Tile"));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("arms a danger item before running it (shared MenuItems behavior)", async () => {
    const onClick = vi.fn();
    render(<>
      <button onContextMenu={e => RkContextMenu.open(e, [{ label: "Delete", onClick, danger: true }])}>Tile</button>
      <RkContextMenuHost />
    </>);

    fireEvent.contextMenu(screen.getByText("Tile"));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(onClick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("menuitem", { name: "Click again to confirm" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
