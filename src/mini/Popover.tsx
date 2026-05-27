import {useEffect, useId, useLayoutEffect, type CSSProperties, type ReactNode, type RefObject} from "react";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    type Placement,
    shift,
    size,
    useDismiss,
    useFloating,
    useInteractions,
} from "@floating-ui/react";
import {useOverlaySlot} from "./OverlayStack";
import {overOffset, type OverlayPlacement} from "./overlayPlacement";
import "./Popover.css";

export type PopoverAnchor = RefObject<HTMLElement | null> | DOMRect | null;

export interface PopoverProps {
    /** Element (ref) or rect the popover positions against. */
    anchor: PopoverAnchor;
    children: ReactNode;
    /** Outside-click / Escape / (optional) window-blur dismissal. Omit to make
     *  the popover non-dismissable (caller controls mount). */
    onClose?: () => void;
    /** Where the popover opens relative to its anchor: a Floating UI placement
     *  ("bottom-start" default), or "over" to center it on the anchor. Always
     *  flips/shifts to stay on-screen. */
    placement?: OverlayPlacement;
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

export function Popover({
    anchor, children, onClose,
    placement = "bottom-start", maxHeight, viewportMargin = DEFAULT_VIEWPORT_MARGIN,
    closeOnWindowBlur = false, style, className,
}: PopoverProps) {
    const id = useId();
    const {isTop} = useOverlaySlot(id, "panel", 0);

    const refEl = anchor && "current" in anchor ? anchor.current : null;
    const rect = anchor && !("current" in anchor) ? anchor : null;

    const over = placement === "over";
    const fuiPlacement: Placement = placement === "over" ? "bottom" : placement;
    const horizontal = fuiPlacement.startsWith("left") || fuiPlacement.startsWith("right");

    const {refs, floatingStyles, context} = useFloating({
        open: true,
        onOpenChange: (open) => { if (!open) onClose?.(); },
        strategy: "fixed",
        placement: fuiPlacement,
        middleware: [
            over ? overOffset() : offset(({placement: p}) => {
                const horizontal = p.startsWith("left") || p.startsWith("right");
                return {mainAxis: horizontal ? HORIZONTAL_GAP : VERTICAL_GAP, crossAxis: horizontal ? -HORIZONTAL_LIFT_PX : 0};
            }),
            // Vertical placements flip to the opposite side only (matches the old "vertical" behavior —
            // a wide menu should not suddenly fly out sideways). Horizontal placements (left/right) cross
            // to the vertical axis when neither side fits, preserving the old "horizontal" fallback.
            ...(over ? [] : [flip({padding: viewportMargin, ...(horizontal ? {fallbackAxisSideDirection: "start"} : {})})]),
            shift({padding: viewportMargin}),
            size({padding: viewportMargin, apply({availableHeight, elements}) {
                const cap = maxHeight !== undefined ? Math.min(maxHeight, availableHeight) : availableHeight;
                elements.floating.style.maxHeight = `${Math.max(0, cap)}px`;
            }}),
        ],
        whileElementsMounted: autoUpdate,
    });

    useLayoutEffect(() => {
        if (refEl) refs.setReference(refEl);
        else if (rect) refs.setPositionReference({getBoundingClientRect: () => rect});
    }, [refEl, rect, refs]);

    // Only the topmost overlay reacts to dismissal. A confirm/alert (RkConfirm/RkAlert)
    // or any Modal opened over the popover sits higher in the OverlayStack, so clicking
    // it no longer counts as an outside-press that would close the popover.
    const dismiss = useDismiss(context, {
        enabled: isTop && !!onClose,
        outsidePress: (e) => {
            const t = e.target as HTMLElement | null;
            // Nested popovers and portaled menus (ActionMenu/ContextMenu) live outside this
            // element's DOM subtree — treat a press inside any of them as "inside".
            return !t?.closest("[data-rk-popover],[data-rk-dropdown-portal]");
        },
    });
    const {getFloatingProps} = useInteractions([dismiss]);

    useEffect(() => {
        if (!closeOnWindowBlur || !onClose || !isTop) return undefined;
        const onBlur = () => setTimeout(() => {
            const ae = document.activeElement;
            if (ae?.tagName !== "IFRAME") return;
            if (refs.floating.current?.contains(ae)) return;
            onClose();
        }, 0);
        window.addEventListener("blur", onBlur);
        return () => window.removeEventListener("blur", onBlur);
    }, [closeOnWindowBlur, onClose, isTop, refs]);

    if (!refEl && !rect) return null;

    return <FloatingPortal>
        <div
            ref={refs.setFloating}
            data-rk-popover
            className={["rkPopover", className].filter(Boolean).join(" ")}
            style={{...floatingStyles, zIndex: "var(--rk-z-popover)", ...style}}
            {...getFloatingProps()}
        >{children}</div>
    </FloatingPortal>;
}
