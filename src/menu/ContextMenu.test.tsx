import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
