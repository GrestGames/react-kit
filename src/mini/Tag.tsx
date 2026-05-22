import {CSSProperties, ReactNode} from "react";
import {Intent} from "../intents";

export interface TagProps {
    children: ReactNode | ReactNode[];
    intent?: Intent;
    size?: "micro" | "small" | "normal";
    bold?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
    title?: string;
}

export function Tag({children, intent = "default", size = "micro", bold, className, style, onClick, title}: TagProps) {
    const intentVars = {
        // Tag draws no border, so default-soft (= surface) is invisible; back the no-status chip with a raised gray.
        "--tag-bg": intent === "default" ? "var(--rk-bg-raised)" : `var(--rk-${intent}-soft)`,
        "--tag-text": `var(--rk-${intent}-soft-text)`,
        "--tag-font-size": `var(--rk-font-size-${size})`,
    } as CSSProperties;
    return <span className={"tag" + (bold ? " tagBold" : "") + (className ? " " + className : "")}
                 style={{...intentVars, ...style}}
                 onClick={onClick}
                 title={title}>{children}</span>;
}
