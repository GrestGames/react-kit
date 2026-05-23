import {CSSProperties, forwardRef} from "react";
import {Intent} from "../intents";
import {ToolTipSupported, wrapToolTip} from "../mini/ToolTip";
import "./PillButton.css";

interface PillButtonProps extends ToolTipSupported {
    children: React.ReactNode;
    onClick?: () => void;
    dotted?: boolean;
    active?: boolean;
    bold?: boolean;
    disabled?: boolean;
    intent?: Intent;
    className?: string;
}

export const PillButton = forwardRef<HTMLSpanElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, bold, disabled, intent = "default", className, tooltip, tooltipProps}, ref
) {
    let cls = "pillBtn";
    if (dotted) cls += " pillDotted";
    if (bold) cls += " pillBold";
    if (disabled) cls += " pillDisabled";
    if (className) cls += " " + className;

    const style: CSSProperties = active ? {
        background: `var(--rk-${intent}-fill)`,
        color: "var(--rk-text-on-accent)",
        borderColor: `var(--rk-${intent}-fill)`,
    } : {
        background: `var(--rk-${intent}-soft)`,
        color: `var(--rk-${intent}-soft-text)`,
        borderColor: `var(--rk-${intent}-soft-border)`,
    };

    return wrapToolTip({tooltip, tooltipProps},
        <span ref={ref} className={cls} style={style}
              aria-disabled={disabled || undefined}
              onClick={disabled ? undefined : onClick}>{children}</span>);
});
