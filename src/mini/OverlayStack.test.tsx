import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {useId} from "react";
import {overlayZ, useOverlaySlot, type OverlayBand} from "./OverlayStack";

function StackItem({order, name, band = "panel"}: {order: number; name: string; band?: OverlayBand}) {
    const id = useId();
    const {offset, isTop} = useOverlaySlot(id, band, order);
    return <div data-testid={name} data-offset={offset} data-top={isTop ? "1" : "0"} />;
}

describe("overlayZ", () => {
    it("anchors z-index to the --rk-z-modal token", () => {
        expect(overlayZ(0)).toBe("var(--rk-z-modal)");
        expect(overlayZ(10)).toBe("calc(var(--rk-z-modal) + 10)");
        expect(overlayZ(-1)).toBe("calc(var(--rk-z-modal) - 1)");
    });
});

describe("overlay stack", () => {
    it("assigns step-scaled offsets by order and marks the highest-order entry as top", () => {
        render(<>
            <StackItem name="a" order={0} />
            <StackItem name="b" order={1} />
            <StackItem name="c" order={2} />
        </>);
        expect(screen.getByTestId("a").dataset.offset).toBe("0");
        expect(screen.getByTestId("b").dataset.offset).toBe("10");
        expect(screen.getByTestId("c").dataset.offset).toBe("20");
        expect(screen.getByTestId("c").dataset.top).toBe("1");
        expect(screen.getByTestId("a").dataset.top).toBe("0");
    });

    it("re-sorts when an order changes — a reopened (raised) panel becomes top", () => {
        const {rerender} = render(<>
            <StackItem name="a" order={0} />
            <StackItem name="b" order={1} />
        </>);
        expect(screen.getByTestId("b").dataset.top).toBe("1");

        rerender(<>
            <StackItem name="a" order={2} />
            <StackItem name="b" order={1} />
        </>);
        expect(screen.getByTestId("a").dataset.top).toBe("1");
        expect(screen.getByTestId("a").dataset.offset).toBe("10");
        expect(screen.getByTestId("b").dataset.offset).toBe("0");
    });

    it("ranks the 'top' band above 'panel' regardless of order", () => {
        render(<>
            <StackItem name="p" order={9} band="panel" />
            <StackItem name="t" order={0} band="top" />
        </>);
        expect(screen.getByTestId("t").dataset.top).toBe("1");
        expect(screen.getByTestId("p").dataset.top).toBe("0");
    });
});
