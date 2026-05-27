import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionMenu } from "./ActionMenu";

describe("ActionMenu", () => {
  it("opens on trigger click, runs an item, then closes", async () => {
    const onClick = vi.fn();
    render(<ActionMenu items={[{ label: "Rename", onClick }]} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("renders a custom trigger with a trigger color", () => {
    render(<ActionMenu items={[{ label: "X" }]} trigger="≡" triggerColor="#f00" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveTextContent("≡");
    expect(trigger.style.color).toBe("rgb(255, 0, 0)");
  });

  it("positions with @floating-ui at the requested placement", async () => {
    render(<ActionMenu items={[{ label: "X" }]} placement="top" />);
    await userEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    // fixed strategy + a transform = positioned by floating-ui, not hand-rolled top/left.
    expect(menu.style.position).toBe("fixed");
    expect(menu.style.transform).not.toBe("");
    expect(menu.dataset.placement).toBe("top");
  });

  it("defaults to a bottom-end placement", async () => {
    render(<ActionMenu items={[{ label: "X" }]} />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu").dataset.placement).toBe("bottom-end");
  });

  it("caps the menu height and lets it scroll so items stay reachable", async () => {
    render(<ActionMenu items={[{ label: "X" }]} />);
    await userEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    expect(menu.style.overflowY).toBe("auto");
    expect(menu.style.maxHeight).not.toBe("");
  });

  it("marks its portal so a host's outside-click handler can treat it as inside", async () => {
    render(<ActionMenu items={[{ label: "X" }]} />);
    await userEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    expect(menu.closest("[data-rk-dropdown-portal]")).not.toBeNull();
  });

  it("arms a danger item before running it", async () => {
    const onClick = vi.fn();
    render(<ActionMenu items={[{ label: "Delete", onClick, danger: true }]} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onClick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("menuitem", { name: "Click again to confirm" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("arms a confirm item before running it, keeping its non-danger color", async () => {
    const onClick = vi.fn();
    render(<ActionMenu items={[{ label: "Sync", onClick, warning: true, confirm: true }]} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("menuitem", { name: "Sync" }));
    expect(onClick).not.toHaveBeenCalled();

    const armed = screen.getByRole("menuitem", { name: "Click again to confirm" });
    expect(armed.className).toContain("tv2ActionMenuWarning");
    expect(armed.className).not.toContain("tv2ActionMenuDanger");

    await userEvent.click(armed);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
