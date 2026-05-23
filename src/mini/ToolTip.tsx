import {CSSProperties, ReactNode, ReactPortal, RefObject, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import "./ToolTip.css"
import {AddToBody} from "../helpers/AddToBody";
import {Intent} from "../intents";

interface State {
    x: number
    y: number
    className: string;
}

export type MessageType = string | ReactNode | (() => string | ReactNode);

export type ToolTipTemplate = "normal" | "error";

export type ToolTipAlign = "vertical" | "horizontal";

export interface ToolTipProps {
    message: MessageType
    /** @deprecated use intent instead */
    template?: ToolTipTemplate
    intent?: Intent
    children?: ReactNode
    className?: string
    style?: CSSProperties
    /** Cursor-following (default) vs anchored to the wrapped element. */
    anchor?: "cursor" | "target"
    /** Cursor mode: which screen axis drives placement. */
    align?: ToolTipAlign
    /** Target mode: preferred side; flips toward the side with more room near a viewport edge. */
    placement?: "above" | "below"
    /** Target mode: max popup width in px (also the horizontal clamp width). */
    maxWidth?: number
    /** Target mode: hover-in / hover-out delays in ms. */
    openDelayMs?: number
    closeDelayMs?: number
    /** Target mode: "block" renders a div wrapper — needed when wrapping a flex/grid row. */
    display?: "inline" | "block"
}

export interface ToolTipControls {
    display: (message: MessageType, template?: ToolTipTemplate, align?: ToolTipAlign, intent?: Intent) => void,
    hide: () => void,
    portal: ReactPortal | undefined
}

function intentVars(intent: Intent | undefined, template: ToolTipTemplate | undefined): CSSProperties | undefined {
    const effective = intent ?? (template === "error" ? "danger" : undefined);
    return effective ? {
        "--tt-border": `var(--rk-${effective})`,
        color: `var(--rk-${effective})`,
    } as CSSProperties : undefined;
}

export function GetToolTipControls(): ToolTipControls {
    const [base, setBase] = useState<{ message: MessageType, className: string, align: ToolTipAlign, intentVars?: CSSProperties }>(undefined);
    const [state, setState] = useState<State>({x: -1000, y: -1000, className: ""});
    const ref = useRef<HTMLDivElement>(null);

    const pageZoom = 1;
    useEffect(() => {
        if (base) {
            const mousePos = (event: MouseEvent) => {
                if (!ref.current) {
                    return;
                }
                const size = ref.current.getBoundingClientRect();
                const docWidth = document.documentElement.clientWidth / pageZoom;
                const docHeight = document.documentElement.clientHeight / pageZoom;

                const mouseX = event.clientX / pageZoom;
                const mouseY = event.clientY / pageZoom;

                const isTop = mouseY <= docHeight * 0.5
                const isLeft = mouseX <= docWidth * 0.3
                const isRight = mouseX >= docWidth - docWidth * 0.3

                const topPlacement = () => {
                    className = "toolTipBottom"
                    x = mouseX - size.width * 0.5
                    y = mouseY + 15;
                }
                const rightPlacement = () => {
                    className = "toolTipRight"
                    x = mouseX + 24
                    y = mouseY - size.height * 0.5 + 14;
                }
                const bottomPlacement = () => {
                    className = "toolTipTop"
                    x = mouseX - size.width * 0.5
                    y = mouseY - size.height - 14;
                }
                const leftPlacement = () => {
                    className = "toolTipLeft"
                    x = mouseX - size.width - 18
                    y = mouseY - size.height * 0.5 + 14;
                }

                let x;
                let y;
                let className = "";
                if (base.align === "horizontal" || !base.align) {
                    if (isLeft) {
                        rightPlacement()
                    } else if (isRight) {
                        leftPlacement()
                    } else if (isTop) {
                        topPlacement()
                    } else {
                        bottomPlacement()
                    }
                } else {
                    if (isTop) {
                        topPlacement()
                    } else if (!isTop) {
                        bottomPlacement()
                    } else if (isRight) {
                        leftPlacement()
                    } else if (isLeft) {
                        rightPlacement()
                    }
                }

                setState({
                    x: Math.max(0, Math.min(docWidth - size.width, x)),
                    y: Math.max(0, Math.min(docHeight - size.height, y)),
                    className: className
                })
            }
            document.addEventListener("mousemove", mousePos);
            return () => document.removeEventListener("mousemove", mousePos)
        }
        return undefined
    }, [base]);

    const getMessageBox = (message: MessageType): ReactNode => {
        if (typeof message === "function") {
            return getMessageBox(message());
        } else if (typeof message === "string") {
            return <div className={"text " + base.className} dangerouslySetInnerHTML={{__html: message}}/>
        } else {
            return <div className={"text " + base.className}>{typeof message === "object" ? message : ""}</div>
        }
    }

    return {
        portal: base && AddToBody({
            id: "tooltip", children: <div ref={ref} className={["toolTip", state.className, base.className].join(" ")} style={{left: state.x + 'px', top: state.y + 'px', ...base.intentVars}}>
                <div className="arrow"/>
                {getMessageBox(base.message)}
            </div>
        }),
        display: (message: MessageType, template: ToolTipTemplate, align: ToolTipAlign, intent?: Intent) => {
            setBase({message: message, className: template === "error" ? "normal" : (template || "normal"), align: align, intentVars: intentVars(intent, template)});
        },
        hide: () => setBase(undefined)
    }
}

export function ToolTip(props: ToolTipProps) {
    return props.anchor === "target" ? <AnchoredToolTip {...props}/> : <CursorToolTip {...props}/>;
}

function CursorToolTip({children, message, align, template, intent, style, className}: ToolTipProps) {
    const provider = GetToolTipControls();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    let interval: any = undefined;
    useEffect(() => {
        if (isVisible) {
            provider.display(message, template, align, intent)

            if (typeof message !== "string") {
                interval = setInterval(() => {
                    provider.display(message, template, align, intent)
                }, 200)
                return () => {
                    clearInterval(interval);
                }
            }

        } else {
            provider.hide();
        }
        return undefined;
    }, [isVisible, message, template, intent]);

    return <>
        {provider.portal}
        <span className={className} style={style} onMouseOver={() => setIsVisible(true)} onMouseOut={() => setIsVisible(false)}>{children}</span>
    </>;
}

const ANCHOR_MIN_SPACE = 80;
const ANCHOR_GAP = 4;
const ANCHOR_MARGIN = 8;

function resolveMessage(message: MessageType): ReactNode {
    const value = typeof message === "function" ? message() : message;
    if (typeof value === "string") {
        return <span dangerouslySetInnerHTML={{__html: value}}/>;
    }
    return value;
}

function AnchoredToolTip({
    children, message, intent, template, className, style,
    placement = "below", maxWidth = 320, openDelayMs = 200, closeDelayMs = 100, display = "inline",
}: ToolTipProps) {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const wrapperRef = useRef<HTMLElement>(null);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelTimers = () => {
        if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null }
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    }
    useEffect(() => () => cancelTimers(), []);

    const onEnter = () => {
        cancelTimers();
        openTimer.current = setTimeout(() => {
            if (wrapperRef.current) setRect(wrapperRef.current.getBoundingClientRect());
        }, openDelayMs);
    };
    const onLeave = () => {
        cancelTimers();
        closeTimer.current = setTimeout(() => setRect(null), closeDelayMs);
    };
    const handlers = {onMouseEnter: onEnter, onMouseLeave: onLeave, onFocus: onEnter, onBlur: onLeave};

    const popup = rect && createPortal(
        <AnchoredPopup rect={rect} placement={placement} maxWidth={maxWidth} vars={intentVars(intent, template)}>
            {resolveMessage(message)}
        </AnchoredPopup>,
        document.body,
    );

    return <>
        {display === "block"
            ? <div ref={wrapperRef as RefObject<HTMLDivElement>} className={className} style={{display: "block", ...style}} {...handlers}>{children}</div>
            : <span ref={wrapperRef as RefObject<HTMLSpanElement>} className={className} style={{display: "inline-flex", alignItems: "center", ...style}} {...handlers}>{children}</span>}
        {popup}
    </>;
}

function AnchoredPopup({rect, placement, maxWidth, vars, children}: {
    rect: DOMRect, placement: "above" | "below", maxWidth: number, vars?: CSSProperties, children: ReactNode,
}) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = placement === "above"
        ? spaceAbove >= ANCHOR_MIN_SPACE || spaceBelow < ANCHOR_MIN_SPACE
        : spaceBelow < ANCHOR_MIN_SPACE && spaceAbove >= ANCHOR_MIN_SPACE;

    const vert: CSSProperties = showAbove
        ? {bottom: window.innerHeight - rect.top + ANCHOR_GAP}
        : {top: rect.bottom + ANCHOR_GAP};

    const center = rect.left + rect.width / 2;
    const left = Math.max(ANCHOR_MARGIN, Math.min(window.innerWidth - ANCHOR_MARGIN - maxWidth, center - maxWidth / 2));

    return <div className="toolTip toolTipAnchored" style={{...vert, left, maxWidth, ...vars}}>{children}</div>;
}
