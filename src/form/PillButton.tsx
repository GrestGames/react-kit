import {CSSProperties, forwardRef} from "react";
import {Intent} from "../intents";
import "./PillButton.css";

interface PillButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    dotted?: boolean;
    active?: boolean;
    bold?: boolean;
    disabled?: boolean;
    intent?: Intent;
    className?: string;
    title?: string;
}

export const PillButton = forwardRef<HTMLSpanElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, bold, disabled, intent = "default", className, title}, ref
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

    return <span ref={ref} className={cls} style={style} title={title}
                 aria-disabled={disabled || undefined}
                 onClick={disabled ? undefined : onClick}>{children}</span>;
});
