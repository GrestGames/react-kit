import {describe, it, expect} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {ToolTip} from "./ToolTip";

function hover(el: HTMLElement, scrollWidth: number, clientWidth: number) {
    Object.defineProperty(el, "scrollWidth", {configurable: true, value: scrollWidth});
    Object.defineProperty(el, "clientWidth", {configurable: true, value: clientWidth});
    fireEvent.mouseEnter(el);
}

describe("ToolTip overflowOnly", () => {
    it("opens when the trigger's content is cut off", async () => {
        render(<ToolTip message="full value" overflowOnly openDelayMs={0}><div data-testid="cell">full va…</div></ToolTip>);
        await act(async () => hover(screen.getByTestId("cell"), 200, 100));
        expect(screen.getByRole("tooltip")).toHaveTextContent("full value");
    });

    it("stays closed when the content fits", async () => {
        render(<ToolTip message="short" overflowOnly openDelayMs={0}><div data-testid="cell">short</div></ToolTip>);
        await act(async () => hover(screen.getByTestId("cell"), 100, 100));
        expect(screen.queryByRole("tooltip")).toBeNull();
    });
});
