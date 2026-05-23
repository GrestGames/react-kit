import {CSSProperties, ReactNode, RefObject, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import "./ToolTip.css"
import {Intent} from "../intents";

export type MessageType = string | ReactNode | (() => string | ReactNode);

export type ToolTipTemplate = "normal" | "error";

export type ToolTipAlign = "vertical" | "horizontal";

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

interface Placed {
    x: number
    y: number
    /** Side class (`toolTipTop|Bottom|Left|Right`) — drives the arrow. */
    className: string
    /** Target mode: arrow's horizontal center within the box, in px. */
    arrowLeft?: number
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

/** Cursor mode: pick a side from where the cursor sits on screen (legacy behavior). */
function placeCursor(mouseX: number, mouseY: number, w: number, h: number, align: ToolTipAlign | undefined): Placed {
    const docWidth = document.documentElement.clientWidth;
    const docHeight = document.documentElement.clientHeight;
    const isTop = mouseY <= docHeight * 0.5;
    const isLeft = mouseX <= docWidth * 0.3;
    const isRight = mouseX >= docWidth - docWidth * 0.3;

    let x = 0, y = 0, className = "";
    const above = () => { className = "toolTipBottom"; x = mouseX - w * 0.5; y = mouseY + 15; };
    const right = () => { className = "toolTipRight"; x = mouseX + 24; y = mouseY - h * 0.5 + 14; };
    const below = () => { className = "toolTipTop"; x = mouseX - w * 0.5; y = mouseY - h - 14; };
    const left = () => { className = "toolTipLeft"; x = mouseX - w - 18; y = mouseY - h * 0.5 + 14; };

    if (align === "vertical") {
        isTop ? above() : below();
    } else {
        if (isLeft) right();
        else if (isRight) left();
        else if (isTop) above();
        else below();
    }
    return {
        x: Math.max(0, Math.min(docWidth - w, x)),
        y: Math.max(0, Math.min(docHeight - h, y)),
        className,
    };
}

/** Target mode: anchor above/below the element, centered on it, flipped + clamped to the viewport. */
function placeTarget(rect: DOMRect, w: number, h: number, placement: "above" | "below" | undefined): Placed {
    const margin = 8;
    const gap = 8;
    const vw = window.innerWidth, vh = window.innerHeight;
    const fits = (space: number) => space >= h + gap;
    const want = placement ?? "below";
    const below = want === "above"
        ? !fits(rect.top) && fits(vh - rect.bottom)
        : fits(vh - rect.bottom) || !fits(rect.top);

    const y = below ? rect.bottom + gap : rect.top - h - gap;
    const centerX = rect.left + rect.width / 2;
    const x = Math.max(margin, Math.min(vw - margin - w, centerX - w / 2));
    const arrowLeft = Math.max(12, Math.min(w - 12, centerX - x));
    return {x, y, className: below ? "toolTipBottom" : "toolTipTop", arrowLeft};
}

export function ToolTip({
    message, children, anchor = "cursor", template, intent, className, style,
    align, placement, maxWidth, openDelayMs, closeDelayMs, display = "inline",
}: ToolTipProps) {
    const [open, setOpen] = useState(false);
    const [placed, setPlaced] = useState<Placed | null>(null);
    const wrapperRef = useRef<HTMLElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({x: 0, y: 0});
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openDelay = openDelayMs ?? (anchor === "target" ? 200 : 0);
    const closeDelay = closeDelayMs ?? (anchor === "target" ? 100 : 0);

    const clearTimers = () => {
        if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    };

    const onEnter = (e: React.MouseEvent | React.FocusEvent) => {
        clearTimers();
        if (anchor === "cursor" && "clientX" in e) mouseRef.current = {x: e.clientX, y: e.clientY};
        openTimer.current = setTimeout(() => setOpen(true), openDelay);
    };
    const onLeave = () => {
        clearTimers();
        closeTimer.current = setTimeout(() => { setOpen(false); setPlaced(null); }, closeDelay);
    };

    useLayoutEffect(() => {
        if (!open) return undefined;
        const recompute = () => {
            const box = boxRef.current;
            if (!box) return;
            const {width: w, height: h} = box.getBoundingClientRect();
            if (anchor === "target") {
                const rect = wrapperRef.current?.getBoundingClientRect();
                if (rect) setPlaced(placeTarget(rect, w, h, placement));
            } else {
                setPlaced(placeCursor(mouseRef.current.x, mouseRef.current.y, w, h, align));
            }
        };
        recompute();

        const ro = new ResizeObserver(recompute);
        if (boxRef.current) ro.observe(boxRef.current);
        const onMove = (e: MouseEvent) => { mouseRef.current = {x: e.clientX, y: e.clientY}; recompute(); };
        if (anchor === "cursor") {
            document.addEventListener("mousemove", onMove);
        } else {
            window.addEventListener("resize", recompute);
            window.addEventListener("scroll", recompute, true);
        }
        return () => {
            ro.disconnect();
            document.removeEventListener("mousemove", onMove);
            window.removeEventListener("resize", recompute);
            window.removeEventListener("scroll", recompute, true);
        };
    }, [open, anchor, placement, align]);

    const wrapperStyle: CSSProperties = display === "block"
        ? {display: "block", ...style}
        : {display: "inline-flex", alignItems: "center", ...style};
    const handlers = {onMouseEnter: onEnter, onMouseLeave: onLeave, onFocus: onEnter, onBlur: onLeave};

    const box = open && createPortal(
        <div
            ref={boxRef}
            className={["toolTip", anchor === "target" && "toolTipAnchored", placed?.className].filter(Boolean).join(" ")}
            style={{
                left: placed?.x ?? -9999,
                top: placed?.y ?? -9999,
                maxWidth: anchor === "target" ? maxWidth ?? 320 : undefined,
                visibility: placed ? "visible" : "hidden",
                ...intentVars(intent, template),
            }}
        >
            <div className="arrow" style={placed?.arrowLeft != null ? {left: placed.arrowLeft} : undefined}/>
            {resolveMessage(message)}
        </div>,
        document.body,
    );

    return <>
        {display === "block"
            ? <div ref={wrapperRef as RefObject<HTMLDivElement>} className={className} style={wrapperStyle} {...handlers}>{children}</div>
            : <span ref={wrapperRef as RefObject<HTMLSpanElement>} className={className} style={wrapperStyle} {...handlers}>{children}</span>}
        {box}
    </>;
}
