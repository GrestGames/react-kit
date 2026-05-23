import {CSSProperties, ReactNode, useRef, useState} from "react";
import {
    arrow, autoUpdate, flip, FloatingPortal, offset, type Placement, safePolygon, shift,
    useClientPoint, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole,
} from "@floating-ui/react";
import "./ToolTip.css";
import {Intent} from "../intents";
import {MessageType, ToolTipAlign, ToolTipTemplate} from "./ToolTip";

export interface ToolTipV2Props {
    message: MessageType
    children?: ReactNode
    /** Cursor-following (default) or anchored to the wrapped element. */
    anchor?: "cursor" | "target"
    /** @deprecated use intent instead */
    template?: ToolTipTemplate
    intent?: Intent
    className?: string
    style?: CSSProperties
    /** Cursor mode: which screen axis drives side selection. */
    align?: ToolTipAlign
    /** Target mode: preferred side; flips toward the side with room. */
    placement?: "above" | "below"
    /** Target mode: max popup width in px. */
    maxWidth?: number
    /** Hover-in / hover-out delays in ms. Default 0 for cursor, 200/100 for target. */
    openDelayMs?: number
    closeDelayMs?: number
    /** "block" renders a div wrapper — needed when wrapping a flex/grid row. */
    display?: "inline" | "block"
}

function intentVars(intent: Intent | undefined, template: ToolTipTemplate | undefined): CSSProperties | undefined {
    const effective = intent ?? (template === "error" ? "danger" : undefined);
    return effective ? {
        "--tt-border": `var(--rk-${effective})`,
        color: `var(--rk-${effective})`,
    } as CSSProperties : undefined;
}

function resolveMessage(message: MessageType): ReactNode {
    const value = typeof message === "function" ? message() : message;
    if (typeof value === "string") {
        return <div className="text" dangerouslySetInnerHTML={{__html: value}}/>;
    }
    return <div className="text">{value}</div>;
}

const sideClass: Record<string, string> = {
    top: "toolTipTop", bottom: "toolTipBottom", left: "toolTipLeft", right: "toolTipRight",
};

export function ToolTipV2({
    message, children, anchor = "cursor", template, intent, className, style,
    align, placement, maxWidth, openDelayMs, closeDelayMs, display = "inline",
}: ToolTipV2Props) {
    const [open, setOpen] = useState(false);
    const arrowRef = useRef<HTMLDivElement>(null);

    const openDelay = openDelayMs ?? (anchor === "target" ? 200 : 0);
    const closeDelay = closeDelayMs ?? (anchor === "target" ? 100 : 0);

    const initialPlacement: Placement = anchor === "target"
        ? (placement === "above" ? "top" : "bottom")
        : (align === "horizontal" ? "right" : "bottom");

    const {refs, floatingStyles, context, middlewareData, placement: finalPlacement} = useFloating({
        open,
        onOpenChange: setOpen,
        strategy: "fixed",
        placement: initialPlacement,
        middleware: [
            offset(anchor === "target" ? 8 : 14),
            flip({padding: 8}),
            shift({padding: 8}),
            arrow({element: arrowRef}),
        ],
        whileElementsMounted: autoUpdate,
    });

    const hover = useHover(context, {
        move: anchor === "cursor",
        delay: {open: openDelay, close: closeDelay},
        handleClose: anchor === "target" ? safePolygon() : null,
    });
    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, {role: "tooltip"});
    const clientPoint = useClientPoint(context, {enabled: anchor === "cursor"});
    const {getReferenceProps, getFloatingProps} = useInteractions([hover, focus, dismiss, role, clientPoint]);

    const wrapperStyle: CSSProperties = display === "block"
        ? {display: "block", ...style}
        : {display: "inline-flex", alignItems: "center", ...style};

    const side = finalPlacement.split("-")[0];
    const arrowData = middlewareData.arrow;
    const arrowStyle: CSSProperties = side === "top" || side === "bottom"
        ? {left: arrowData?.x != null ? `${arrowData.x}px` : undefined, marginLeft: 0}
        : {top: arrowData?.y != null ? `${arrowData.y}px` : undefined, marginTop: 0};

    return <>
        {display === "block"
            ? <div ref={refs.setReference} className={className} style={wrapperStyle} {...getReferenceProps()}>{children}</div>
            : <span ref={refs.setReference} className={className} style={wrapperStyle} {...getReferenceProps()}>{children}</span>}
        {open && <FloatingPortal>
            <div
                ref={refs.setFloating}
                className={["toolTip", anchor === "target" && "toolTipAnchored", sideClass[side]].filter(Boolean).join(" ")}
                style={{
                    ...floatingStyles,
                    margin: 0,
                    maxWidth: anchor === "target" ? maxWidth ?? 320 : undefined,
                    ...intentVars(intent, template),
                }}
                {...getFloatingProps()}
            >
                <div className="arrow" ref={arrowRef} style={arrowStyle}/>
                {resolveMessage(message)}
            </div>
        </FloatingPortal>}
    </>;
}
