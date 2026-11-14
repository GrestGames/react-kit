import {describe, it, expect, vi} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {useRef, useState, type ReactNode} from "react";
import {Popover} from "./Popover";
import {OverlayOrderContext, useOverlaySlot} from "./OverlayStack";

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

function PanelAt({order, children}: {order: number; children: ReactNode}) {
    useOverlaySlot("panel-under-test", "panel", order, true);
    return <OverlayOrderContext.Provider value={order}>{children}</OverlayOrderContext.Provider>;
}

describe("Popover inside a routed popup panel", () => {
    it("is the top overlay, so a press outside closes it", async () => {
        const onClose = vi.fn();
        function InPanel() {
            const anchor = useRef<HTMLButtonElement>(null);
            const [open, setOpen] = useState(false);
            return <PanelAt order={2}>
                <button ref={anchor} data-testid="open" onClick={() => setOpen(true)}>anchor</button>
                <div data-testid="panel-body">panel</div>
                {open && <Popover anchor={anchor} onClose={onClose}><div>picker</div></Popover>}
            </PanelAt>;
        }
        render(<InPanel />);
        fireEvent.click(screen.getByTestId("open"));
        await act(() => new Promise(r => setTimeout(r, 0)));
        fireEvent.pointerDown(screen.getByTestId("panel-body"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
