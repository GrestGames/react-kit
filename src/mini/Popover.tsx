import {useEffect, useRef, type CSSProperties, type ReactNode, type RefObject} from "react";
import {createPortal} from "react-dom";
import "./Popover.css";

export type PopoverAnchor = RefObject<HTMLElement | null> | DOMRect | null;

export type PopoverPlacement = "vertical" | "above" | "below" | "horizontal";

export interface PopoverProps {
    /** Element (ref) or rect the popover positions against. */
    anchor: PopoverAnchor;
    children: ReactNode;
    /** Effective width in px, used for viewport clamping. The popover does not
     *  enforce it visually — set `style.width`/`minWidth`/`maxWidth` for that. */
    width: number;
    /** Outside-click / Escape / (optional) window-blur dismissal. Omit to make
     *  the popover non-dismissable (caller controls mount). */
    onClose?: () => void;
    /** "vertical" (default): below, or above when it has more room. "horizontal":
     *  right or left, falling back to vertical. */
    placement?: PopoverPlacement;
    /** Cap on rendered height; always clamped further by the viewport. */
    maxHeight?: number;
    viewportMargin?: number;
    /** Also close when the window loses focus to a cross-origin iframe (e.g. an
     *  embedded terminal/editor that swallows clicks). Off by default. */
    closeOnWindowBlur?: boolean;
    style?: CSSProperties;
    className?: string;
}

const DEFAULT_VIEWPORT_MARGIN = 8;
const VERTICAL_GAP = 4;
const HORIZONTAL_GAP = 8;
const HORIZONTAL_LIFT_PX = 30;
// Below ActionMenu's portal (10000-10001) so menus nested inside a Popover
// still render above it. Override via `style.zIndex` when needed.
const Z_INDEX = 9001;

export function Popover({
    anchor, children, width, onClose,
    placement = "vertical", maxHeight, viewportMargin = DEFAULT_VIEWPORT_MARGIN,
    closeOnWindowBlur = false, style, className,
}: PopoverProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!onClose) return undefined;
        const onMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (ref.current?.contains(target)) return;
            const anchorEl = anchor && "current" in anchor ? anchor.current : null;
            if (anchorEl?.contains(target)) return;
            // Nested popovers portal out — a click in any of them counts as inside.
            if (target.closest("[data-rk-popover]")) return;
            onClose();
        };
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);

        let onBlur: (() => void) | undefined;
        if (closeOnWindowBlur) {
            onBlur = () => setTimeout(() => {
                const ae = document.activeElement;
                if (ae?.tagName !== "IFRAME") return;
                if (ref.current?.contains(ae)) return;
                onClose();
            }, 0);
            window.addEventListener("blur", onBlur);
        }
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
            if (onBlur) window.removeEventListener("blur", onBlur);
        };
    }, [onClose, anchor, closeOnWindowBlur]);

    const rect = resolveRect(anchor);
    if (!rect) return null;

    const pos = computePosition(rect, width, placement, viewportMargin, maxHeight);

    return createPortal(
        <div
            ref={ref}
            data-rk-popover
            className={["rkPopover", className].filter(Boolean).join(" ")}
            style={{zIndex: Z_INDEX, ...pos, ...style}}
        >{children}</div>,
        document.body,
    );
}

function resolveRect(anchor: PopoverAnchor): DOMRect | null {
    if (!anchor) return null;
    if ("current" in anchor) return anchor.current?.getBoundingClientRect() ?? null;
    return anchor;
}

function computePosition(
    rect: DOMRect, width: number, placement: PopoverPlacement,
    margin: number, capHeight: number | undefined,
): CSSProperties {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;

    const fitsRight = spaceRight >= width + HORIZONTAL_GAP;
    const fitsLeft = spaceLeft >= width + HORIZONTAL_GAP;

    type Side = "below" | "above" | "right" | "left";
    const resolved: Side = (() => {
        if (placement === "horizontal") {
            if (fitsRight) return "right";
            if (fitsLeft) return "left";
            return spaceBelow >= spaceAbove ? "below" : "above";
        }
        if (placement === "below") return "below";
        if (placement === "above") return "above";
        return spaceBelow >= spaceAbove ? "below" : "above";
    })();

    const clampLeft = (x: number) => Math.max(margin, Math.min(x, vw - width - margin));
    const clampMaxH = (h: number) => {
        const available = Math.max(0, h);
        return capHeight !== undefined ? Math.min(capHeight, available) : available;
    };

    switch (resolved) {
        case "below":
            return {top: rect.bottom + VERTICAL_GAP, left: clampLeft(rect.left), maxHeight: clampMaxH(spaceBelow - VERTICAL_GAP - margin)};
        case "above":
            return {bottom: vh - rect.top + VERTICAL_GAP, left: clampLeft(rect.left), maxHeight: clampMaxH(spaceAbove - VERTICAL_GAP - margin)};
        case "right": {
            const top = Math.max(margin, rect.top - HORIZONTAL_LIFT_PX);
            return {top, left: clampLeft(rect.right + HORIZONTAL_GAP), maxHeight: clampMaxH(vh - top - margin)};
        }
        case "left": {
            const top = Math.max(margin, rect.top - HORIZONTAL_LIFT_PX);
            return {top, left: clampLeft(rect.left - width - HORIZONTAL_GAP), maxHeight: clampMaxH(vh - top - margin)};
        }
    }
}
