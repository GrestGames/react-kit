import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {SidePane, type SidePaneProps} from "./SidePane";

function dragTo(props: Omit<SidePaneProps, "width" | "onWidthChange" | "children">, clientX: number) {
    const onWidthChange = vi.fn();
    const {container} = render(<div><SidePane width={200} onWidthChange={onWidthChange} {...props}>pane</SidePane></div>);
    (container.firstElementChild as HTMLElement).getBoundingClientRect = () => ({left: 100, right: 1100, width: 1000} as DOMRect);
    fireEvent.mouseDown(container.querySelector("[role=separator]")!);
    fireEvent.mouseMove(window, {clientX});
    fireEvent.mouseUp(window);
    return onWidthChange;
}

describe("SidePane", () => {
    it("sizes a left pane from the parent's left edge to the cursor", () => {
        expect(dragTo({}, 400)).toHaveBeenLastCalledWith(300);
    });

    it("sizes a right pane from the cursor to the parent's right edge", () => {
        expect(dragTo({side: "right"}, 800)).toHaveBeenLastCalledWith(300);
    });

    it("clamps to minWidth, maxWidth and the room left for the content", () => {
        expect(dragTo({minWidth: 240}, 150)).toHaveBeenLastCalledWith(240);
        expect(dragTo({maxWidth: 500}, 900)).toHaveBeenLastCalledWith(500);
        expect(dragTo({minContentWidth: 320}, 1000)).toHaveBeenLastCalledWith(680);
        expect(dragTo({minWidth: 240, minContentWidth: 900}, 600)).toHaveBeenLastCalledWith(240);
    });

    it("shields the page during the drag and removes the shield on release", () => {
        render(<div><SidePane width={200} onWidthChange={() => {}}>pane</SidePane></div>);
        fireEvent.mouseDown(screen.getByRole("separator"));
        expect(document.querySelector(".rkSidePaneShield")).not.toBeNull();
        fireEvent.mouseUp(window);
        expect(document.querySelector(".rkSidePaneShield")).toBeNull();
    });

    it("ends a drag still running when the pane unmounts", () => {
        const onWidthChange = vi.fn();
        const {unmount} = render(<div><SidePane width={200} onWidthChange={onWidthChange}>pane</SidePane></div>);
        fireEvent.mouseDown(screen.getByRole("separator"));
        unmount();
        expect(document.querySelector(".rkSidePaneShield")).toBeNull();
        fireEvent.mouseMove(window, {clientX: 400});
        expect(onWidthChange).not.toHaveBeenCalled();
    });
});
