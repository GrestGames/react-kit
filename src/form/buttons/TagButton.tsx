import {CSSProperties, forwardRef} from "react";
import {ButtonPrimitive, PrimitiveButtonProps} from "./ButtonPrimitive";
import "./TagButton.css";

export interface TagButtonProps extends PrimitiveButtonProps {
    bold?: boolean;
}

export const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(function TagButton({
    children, intent = "default", size = "micro", bold, active, disabled, loading,
    onClick, className, style, title, titleProps, name, confirmDouble, confirmDoubleText,
    ...rest
}, ref) {
    // active solid fill color; default-soft invisible on surface → raise it
    const fillVar = intent === "default"
        ? {"--tagBtn-fill": "var(--rk-bg-raised)"} as CSSProperties
        : {"--tagBtn-fill": `var(--rk-${intent}-fill)`} as CSSProperties;
    // idle background: default → raised, others → soft
    const bgVar = intent === "default"
        ? {"background": "var(--rk-bg-raised)", "color": `var(--rk-default-soft-text)`} as CSSProperties
        : {"background": `var(--rk-${intent}-soft)`, "color": `var(--rk-${intent}-soft-text)`} as CSSProperties;

    let cls = "tagBtn";
    if (bold) cls += " tagBtnBold";
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
            style={{...fillVar, ...bgVar, ...style}}
            title={title}
            titleProps={titleProps}
        >
            {children}
        </ButtonPrimitive>
    );
});
