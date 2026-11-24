import {MouseEvent, ReactNode, useEffect, useRef} from "react";
import "./SidePane.css";

export interface SidePaneProps {
    width: number
    onWidthChange: (width: number) => void
    /** Which edge of the parent row the pane sits on; the handle is on the opposite edge. Default "left". */
    side?: "left" | "right"
    minWidth?: number
    maxWidth?: number
    /** Clamps the width so the neighbouring content never collapses. */
    minContentWidth?: number
    className?: string
    children: ReactNode
}

// Width is driven absolutely from the cursor's offset into the parent (no delta drift); a
// full-viewport shield stops iframes/editors from swallowing the drag.
export function SidePane({width, onWidthChange, side = "left", minWidth = 160, maxWidth, minContentWidth, className, children}: SidePaneProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const endDrag = useRef<(() => void) | undefined>(undefined);
    useEffect(() => () => endDrag.current?.(), []);

    const startResize = (e: MouseEvent) => {
        e.preventDefault();
        const parent = rootRef.current?.parentElement;
        if (!parent) return;
        const shield = document.createElement("div");
        shield.className = "rkSidePaneShield";
        document.body.appendChild(shield);
        const onMove = (me: globalThis.MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            let next = side === "left" ? me.clientX - rect.left : rect.right - me.clientX;
            if (maxWidth != null) next = Math.min(maxWidth, next);
            if (minContentWidth != null) next = Math.min(rect.width - minContentWidth, next);
            onWidthChange(Math.max(minWidth, next));
        };
        const onUp = () => {
            shield.remove();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            endDrag.current = undefined;
        };
        endDrag.current = onUp;
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    return <div ref={rootRef} className={`rkSidePane rkSidePane-${side}` + (className ? " " + className : "")} style={{width}}>
        {children}
        <div className="rkSidePaneHandle" role="separator" aria-orientation="vertical" title="Drag to resize" onMouseDown={startResize}/>
    </div>;
}
