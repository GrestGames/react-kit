import {forwardRef} from "react";
import "./PillButton.css";

interface PillButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    dotted?: boolean;
    active?: boolean;
    selected?: boolean;
    bold?: boolean;
    activeColor?: string;
    className?: string;
    title?: string;
}

export const PillButton = forwardRef<HTMLSpanElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, selected, bold, activeColor, className, title}, ref
) {
    let cls = "pillBtn";
    if (dotted) cls += " pillDotted";
    if (active) cls += " pillActive";
    if (selected) cls += " pillSelected";
    if (bold) cls += " pillBold";
    if (className) cls += " " + className;

    const style = active && activeColor ? {background: activeColor, borderColor: activeColor} : undefined;

    return <span ref={ref} className={cls} style={style} onClick={onClick} title={title}>{children}</span>;
});
