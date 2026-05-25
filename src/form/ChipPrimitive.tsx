import {CSSProperties, forwardRef, ReactNode} from "react";
import {Intent} from "../intents";
import {ToolTipSupported, wrapToolTip} from "../mini/ToolTip";
import "./ChipPrimitive.css";

export interface ChipPrimitiveProps extends ToolTipSupported {
    children: ReactNode | ReactNode[];
    onClick?: () => void;
    intent?: Intent;
    active?: boolean;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
    /** "pill": bordered + rounded. "tag": borderless + square. */
    variant: "pill" | "tag";
}

function resolveColors(intent: Intent, active: boolean, variant: "pill" | "tag"): CSSProperties {
    if (active) {
        return {
            background: `var(--rk-${intent}-fill)`,
            color: "var(--rk-text-on-accent)",
            ...(variant === "pill" ? {borderColor: `var(--rk-${intent}-fill)`} : {}),
        };
    }
    return {
        // default-soft is surface-colored (invisible on surface); raise it for the tag variant
        background: intent === "default" && variant === "tag"
            ? "var(--rk-bg-raised)"
            : `var(--rk-${intent}-soft)`,
        color: `var(--rk-${intent}-soft-text)`,
        ...(variant === "pill" ? {borderColor: `var(--rk-${intent}-soft-border)`} : {}),
    };
}

export const ChipPrimitive = forwardRef<HTMLSpanElement, ChipPrimitiveProps>(function ChipPrimitive(
    {children, onClick, intent = "default", active = false, disabled = false, loading = false,
        className, style, title, titleProps, variant},
    ref,
) {
    const baseCls = variant === "pill" ? "pillBtn" : "tagBtn";
    let cls = baseCls;
    if (disabled) cls += " chipDisabled";
    if (loading) cls += " chipLoading";
    if (className) cls += " " + className;

    const colors = resolveColors(intent, active, variant);

    const element = (
        <span
            ref={ref}
            className={cls}
            style={{...colors, ...style}}
            aria-disabled={disabled || loading || undefined}
            onClick={disabled || loading ? undefined : onClick}
        >
            {loading ? (
                <>
                    <span className="chipLoadingContent" aria-hidden>{children}</span>
                    <span className="chipSpinner"><span className="chipSpinnerRing"/></span>
                </>
            ) : children}
        </span>
    );

    return wrapToolTip({title, titleProps}, element);
});
