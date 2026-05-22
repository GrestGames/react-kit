import {CSSProperties, forwardRef} from "react";
import {Intent} from "../intents";
import "./PillButton.css";

interface PillButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    dotted?: boolean;
    active?: boolean;
    selected?: boolean;
    bold?: boolean;
    activeColor?: string;
    intent?: Intent;
    className?: string;
    title?: string;
}

export const PillButton = forwardRef<HTMLSpanElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, selected, bold, activeColor, intent, className, title}, ref
) {
    let cls = "pillBtn";
    if (dotted) cls += " pillDotted";
    if (active) cls += " pillActive";
    if (selected) cls += " pillSelected";
    if (bold) cls += " pillBold";
    if (className) cls += " " + className;

    let style: CSSProperties | undefined;
    if (intent) style = {
        background: `var(--rk-${intent}-soft)`,
        color: `var(--rk-${intent}-soft-text)`,
        borderColor: `var(--rk-${intent}-soft-border)`,
    };
    if (active && activeColor) style = {...style, background: activeColor, borderColor: activeColor};

    return <span ref={ref} className={cls} style={style} onClick={onClick} title={title}>{children}</span>;
});
