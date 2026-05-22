import {CSSProperties, ReactNode} from "react";
import {Intent} from "../intents";

export interface TagProps {
    children: ReactNode | ReactNode[];
    intent?: Intent;
    size?: "micro" | "small" | "normal";
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
    title?: string;
}

export function Tag({children, intent = "neutral", size = "micro", className, style, onClick, title}: TagProps) {
    const intentVars = {
        "--tag-bg": `var(--rk-${intent}-soft)`,
        "--tag-text": `var(--rk-${intent}-soft-text)`,
        "--tag-font-size": `var(--rk-font-size-${size})`,
    } as CSSProperties;
    return <span className={"tag" + (className ? " " + className : "")}
                 style={{...intentVars, ...style}}
                 onClick={onClick}
                 title={title}>{children}</span>;
}
