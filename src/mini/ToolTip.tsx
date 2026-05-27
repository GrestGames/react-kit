import {CSSProperties, cloneElement, isValidElement, ReactElement, ReactNode, Ref, useRef, useState} from "react";
import {
    arrow, autoUpdate, flip, FloatingPortal, offset, type Placement, safePolygon, shift,
    useClientPoint, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole,
} from "@floating-ui/react";
import "./ToolTip.css";
import {Intent} from "../intents";
import {overOffset, type OverlayPlacement} from "./overlayPlacement";

export type MessageType = string | ReactNode | (() => string | ReactNode);

export type ToolTipTemplate = "normal" | "error";

export interface ToolTipProps {
    message: MessageType
    children?: ReactNode
    /** Cursor-following (default) or anchored to the wrapped element. */
    anchor?: "cursor" | "target"
    /** @deprecated use intent instead */
    template?: ToolTipTemplate
    intent?: Intent
    className?: string
    style?: CSSProperties
    /** Side relative to the trigger (target mode) or cursor (cursor mode): a
     *  Floating UI placement, or "over" to center on the trigger. Default "bottom". */
    placement?: OverlayPlacement
    /** Target mode: max popup width in px. */
    maxWidth?: number
    /** Hover-in / hover-out delays in ms. Default 0 for cursor, 200/100 for target. */
    openDelayMs?: number
    closeDelayMs?: number
    /** "block" renders a div wrapper — needed when wrapping a flex/grid row. */
    display?: "inline" | "block"
    /** Force the tooltip open without hover — useful for onboarding hints. */
    pinned?: boolean
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

function combineRef<T>(set: (node: T | null) => void, orig: Ref<T> | undefined): (node: T | null) => void {
    return (node) => {
        set(node);
        if (typeof orig === "function") orig(node);
        else if (orig) (orig as {current: T | null}).current = node;
    };
}

export function ToolTip({
    message, children, anchor = "cursor", template, intent, className, style,
    placement, maxWidth, openDelayMs, closeDelayMs, display = "inline", pinned,
}: ToolTipProps) {
    const [open, setOpen] = useState(false);
    const arrowRef = useRef<HTMLDivElement>(null);

    const openDelay = openDelayMs ?? (anchor === "target" ? 200 : 0);
    const closeDelay = closeDelayMs ?? (anchor === "target" ? 100 : 0);

    const over = placement === "over";
    const initialPlacement: Placement = placement == null || placement === "over" ? "bottom" : placement;

    const isOpen = pinned || open;

    const {refs, floatingStyles, context, middlewareData, placement: finalPlacement} = useFloating({
        open: isOpen,
        onOpenChange: pinned ? undefined : setOpen,
        strategy: "fixed",
        placement: initialPlacement,
        middleware: [
            over ? overOffset() : offset(anchor === "target" ? 8 : 14),
            ...(over ? [] : [flip({padding: 8})]),
            shift({padding: 8}),
            arrow({element: arrowRef}),
        ],
        whileElementsMounted: autoUpdate,
    });

    const hover = useHover(context, {
        enabled: !pinned,
        move: anchor === "cursor",
        delay: {open: openDelay, close: closeDelay},
        handleClose: anchor === "target" ? safePolygon() : null,
    });
    const focus = useFocus(context, {enabled: !pinned});
    const dismiss = useDismiss(context, {enabled: !pinned});
    const role = useRole(context, {role: "tooltip"});
    const clientPoint = useClientPoint(context, {enabled: !pinned && anchor === "cursor"});
    const {getReferenceProps, getFloatingProps} = useInteractions([hover, focus, dismiss, role, clientPoint]);

    const wrapperStyle: CSSProperties = display === "block"
        ? {display: "block", ...style}
        : {display: "inline-flex", alignItems: "center", ...style};

    const side = finalPlacement.split("-")[0];
    const arrowData = middlewareData.arrow;
    const arrowStyle: CSSProperties = side === "top" || side === "bottom"
        ? {left: arrowData?.x != null ? `${arrowData.x}px` : undefined, marginLeft: 0}
        : {top: arrowData?.y != null ? `${arrowData.y}px` : undefined, marginTop: 0};

    // A single host element (button/span/a/…) is cloned so the ref + handlers land
    // directly on it — no wrapper box, so the caller's layout is untouched. Non-host
    // or multi children (and display="block") fall back to a wrapping span/div.
    const hostChild = display !== "block" && isValidElement(children) && typeof children.type === "string"
        ? children as ReactElement<Record<string, any>>
        : null;
    const reference = hostChild
        ? cloneElement(hostChild, {
            ...getReferenceProps(hostChild.props),
            ref: combineRef(refs.setReference, (hostChild.props as {ref?: Ref<any>}).ref),
        })
        : display === "block"
            ? <div ref={refs.setReference} className={className} style={wrapperStyle} {...getReferenceProps()}>{children}</div>
            : <span ref={refs.setReference} className={className} style={wrapperStyle} {...getReferenceProps()}>{children}</span>;

    return <>
        {reference}
        {isOpen && <FloatingPortal>
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

/** Mix into a component's props to give it a styled tooltip with one integration point. */
export interface ToolTipSupported {
    /** Styled tooltip content (mirrors the native `title` attribute; accepts rich content). */
    title?: MessageType
    /** Anchor/placement/intent/delay overrides. Defaults to anchored (`anchor: "target"`). */
    titleProps?: Omit<ToolTipProps, "message" | "children">
}

/** Wrap a component's root element in a ToolTip when `title` is set; otherwise return it untouched. */
export function wrapToolTip(props: ToolTipSupported, element: ReactElement): ReactNode {
    if (props.title == null) return element;
    return <ToolTip message={props.title} anchor="target" {...props.titleProps}>{element}</ToolTip>;
}
