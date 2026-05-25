import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {useEffect, useId} from "react";
import {OverlayStackProvider, useOverlayStack, overlayZ} from "./OverlayStack";

function StackItem({order, name}: {order: number; name: string}) {
    const stack = useOverlayStack()!;
    const id = useId();
    const {register, unregister} = stack;
    useEffect(() => {
        register(id, "panel", order);
        return () => unregister(id);
    }, [register, unregister, id, order]);
    return <div data-testid={name} data-offset={stack.offsetOf(id)} data-top={stack.isTop(id) ? "1" : "0"} />;
}

describe("overlayZ", () => {
    it("anchors z-index to the --rk-z-modal token", () => {
        expect(overlayZ(0)).toBe("var(--rk-z-modal)");
        expect(overlayZ(10)).toBe("calc(var(--rk-z-modal) + 10)");
        expect(overlayZ(-1)).toBe("calc(var(--rk-z-modal) - 1)");
    });
});

describe("OverlayStackProvider", () => {
    it("assigns step-scaled offsets by order and marks the highest-order entry as top", () => {
        render(<OverlayStackProvider>
            <StackItem name="a" order={0} />
            <StackItem name="b" order={1} />
            <StackItem name="c" order={2} />
        </OverlayStackProvider>);
        expect(screen.getByTestId("a").dataset.offset).toBe("0");
        expect(screen.getByTestId("b").dataset.offset).toBe("10");
        expect(screen.getByTestId("c").dataset.offset).toBe("20");
        expect(screen.getByTestId("c").dataset.top).toBe("1");
        expect(screen.getByTestId("a").dataset.top).toBe("0");
    });

    it("re-sorts when an order changes — a reopened (raised) panel becomes top", () => {
        const {rerender} = render(<OverlayStackProvider>
            <StackItem name="a" order={0} />
            <StackItem name="b" order={1} />
        </OverlayStackProvider>);
        expect(screen.getByTestId("b").dataset.top).toBe("1");

        rerender(<OverlayStackProvider>
            <StackItem name="a" order={2} />
            <StackItem name="b" order={1} />
        </OverlayStackProvider>);
        expect(screen.getByTestId("a").dataset.top).toBe("1");
        expect(screen.getByTestId("a").dataset.offset).toBe("10");
        expect(screen.getByTestId("b").dataset.offset).toBe("0");
    });
});
