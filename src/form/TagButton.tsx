import {CSSProperties, ReactNode} from "react";
import {Intent} from "../intents";
import {ToolTipSupported} from "../mini/ToolTip";
import {ChipPrimitive} from "./ChipPrimitive";

export interface TagButtonProps extends ToolTipSupported {
    children: ReactNode | ReactNode[];
    intent?: Intent;
    size?: "micro" | "small" | "normal";
    bold?: boolean;
    active?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
}

export function TagButton({
    children, intent = "default", size = "micro", bold, active, disabled, loading,
    onClick, className, style, title, titleProps,
}: TagButtonProps) {
    const sizeVar = {"--tagBtn-font-size": `var(--rk-font-size-${size})`} as CSSProperties;
    let cls = bold ? "tagBtnBold" : "";
    if (className) cls += (cls ? " " : "") + className;

    return (
        <ChipPrimitive
            variant="tag"
            intent={intent}
            active={active}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            className={cls || undefined}
            style={{...sizeVar, ...style}}
            title={title}
            titleProps={titleProps}
        >
            {children}
        </ChipPrimitive>
    );
}
