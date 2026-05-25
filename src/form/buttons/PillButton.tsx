import {CSSProperties, forwardRef} from "react";
import {ButtonPrimitive, PrimitiveButtonProps} from "./ButtonPrimitive";
import "./PillButton.css";

export interface PillButtonProps extends PrimitiveButtonProps {
    dotted?: boolean;
    bold?: boolean;
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, bold, disabled, loading, intent = "default", size = "normal", className, style, title, titleProps, name, confirmDouble, confirmDoubleText, ...rest},
    ref,
) {
    // idle: soft bg + soft-text + soft-border
    const idleVars = active ? {} : {
        background: intent === "default" ? "var(--rk-bg-raised)" : `var(--rk-${intent}-soft)`,
        color: `var(--rk-${intent}-soft-text)`,
        borderColor: `var(--rk-${intent}-soft-border)`,
    } as CSSProperties;
    // active solid fill color passed as CSS var so .pillBtn.active rule can pick it up
    const fillVar = {"--pillBtn-fill": intent === "default" ? "var(--rk-bg-raised)" : `var(--rk-${intent}-fill)`} as CSSProperties;

    let cls = "pillBtn";
    if (dotted) cls += " pillDotted";
    if (bold) cls += " pillBold";
    if (className) cls += " " + className;

    return (
        <ButtonPrimitive
            {...rest}
            ref={ref}
            intent={intent}
            size={size}
            active={active}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            name={name}
            confirmDouble={confirmDouble}
            confirmDoubleText={confirmDoubleText}
            className={cls}
            style={{...fillVar, ...idleVars, ...style}}
            title={title}
            titleProps={titleProps}
        >
            {children}
        </ButtonPrimitive>
    );
});
