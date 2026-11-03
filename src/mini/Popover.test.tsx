import {describe, it, expect, vi} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {useRef, useState} from "react";
import {Popover} from "./Popover";

function Nested({onParentClose, onChildClose}: {onParentClose: () => void; onChildClose: () => void}) {
    const anchor = useRef<HTMLButtonElement>(null);
    const [childAnchor, setChildAnchor] = useState<HTMLElement | null>(null);
    return <>
        <button ref={anchor}>anchor</button>
        <div data-testid="page">page</div>
        <Popover anchor={anchor} onClose={onParentClose}>
            <div data-testid="parent">
                <button data-testid="opener" ref={setChildAnchor}>open</button>
            </div>
        </Popover>
        {childAnchor && <Popover anchor={{current: childAnchor}} onClose={onChildClose}>
            <div data-testid="child">child</div>
        </Popover>}
    </>;
}

async function setup() {
    const onParentClose = vi.fn();
    const onChildClose = vi.fn();
    render(<Nested onParentClose={onParentClose} onChildClose={onChildClose} />);
    // useDismiss attaches its document listener in an effect after the first paint.
    await act(() => new Promise(r => setTimeout(r, 0)));
    return {onParentClose, onChildClose};
}

describe("nested Popover dismissal", () => {
    it("a press in the parent popover closes the child, not the parent", async () => {
        const {onParentClose, onChildClose} = await setup();
        fireEvent.pointerDown(screen.getByTestId("parent"));
        expect(onChildClose).toHaveBeenCalledTimes(1);
        expect(onParentClose).not.toHaveBeenCalled();
    });

    it("a press in the child closes nothing", async () => {
        const {onParentClose, onChildClose} = await setup();
        fireEvent.pointerDown(screen.getByTestId("child"));
        expect(onChildClose).not.toHaveBeenCalled();
        expect(onParentClose).not.toHaveBeenCalled();
    });

    it("a press on the page closes the child first", async () => {
        const {onChildClose} = await setup();
        fireEvent.pointerDown(screen.getByTestId("page"));
        expect(onChildClose).toHaveBeenCalledTimes(1);
    });
});
