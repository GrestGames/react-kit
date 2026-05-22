import {CSSProperties, ReactNode, ReactPortal, useEffect, useRef, useState} from "react";
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

export interface ToolTipControls {
    display: (message: MessageType, template?: ToolTipTemplate, align?: ToolTipAlign, intent?: Intent) => void,
    hide: () => void,
    portal: ReactPortal | undefined
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
            const effectiveIntent = intent ?? (template === "error" ? "danger" : undefined);
            const intentVars = effectiveIntent ? {
                "--tt-border": `var(--rk-${effectiveIntent})`,
                color: `var(--rk-${effectiveIntent})`,
            } as CSSProperties : undefined;
            setBase({message: message, className: template === "error" ? "normal" : (template || "normal"), align: align, intentVars});
        },
        hide: () => setBase(undefined)
    }
}

export function ToolTip({children, message, align, template, intent, style, className}:
                            { message: MessageType, /** @deprecated use intent instead */ template?: ToolTipTemplate, intent?: Intent, align?: ToolTipAlign, children?: ReactNode, className?: string, style?: CSSProperties }) {
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
