import {CSSProperties, ReactNode} from "react";
import {Intent} from "../intents";
import {ToolTipSupported, wrapToolTip} from "./ToolTip";

export interface TagProps extends ToolTipSupported {
    children: ReactNode | ReactNode[];
    intent?: Intent;
    size?: "micro" | "small" | "normal";
    bold?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

export function Tag({children, intent = "default", size = "micro", bold, className, style, onClick, title, titleProps}: TagProps) {
    const intentVars = {
        // Tag draws no border, so default-soft (= surface) is invisible; back the no-status chip with a raised gray.
        "--tag-bg": intent === "default" ? "var(--rk-bg-raised)" : `var(--rk-${intent}-soft)`,
        "--tag-text": `var(--rk-${intent}-soft-text)`,
        "--tag-font-size": `var(--rk-font-size-${size})`,
    } as CSSProperties;
    return wrapToolTip({title, titleProps},
        <span className={"tag" + (bold ? " tagBold" : "") + (className ? " " + className : "")}
              style={{...intentVars, ...style}}
              onClick={onClick}>{children}</span>);
}
