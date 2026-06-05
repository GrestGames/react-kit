import {CSSProperties, forwardRef, ReactNode, useEffect, useRef, useState} from "react";
import {isPromise} from "../../util/isPromise";
import {ToolTipSupported, wrapToolTip} from "../../mini/ToolTip";
import {alertError} from "../../ErrorTracker";
import {CONFIRM_DOUBLE_WINDOW_MS, DEFAULT_CONFIRM_DOUBLE_TEXT, pickConfirmText} from "../confirmDouble";
import React from "react";
import {Intent} from "../../intents";

/** Shared behavioral prop surface for all button-family components. */
export interface PrimitiveButtonProps extends ToolTipSupported {
    children?: ReactNode;
    onClick?: () => void | Promise<unknown>;
    intent?: Intent;
    size?: "micro" | "small" | "normal";
    /** Controlled loading; merged with async-derived: effective = loading || asyncLoading */
    loading?: boolean;
    active?: boolean;
    confirmDouble?: boolean;
    confirmDoubleText?: string;
    disabled?: boolean;
    name?: string;
    className?: string;
    style?: CSSProperties;
}

export interface ButtonPrimitiveProps extends PrimitiveButtonProps {
    type?: "button" | "submit" | "reset";
    /** Called when an async onClick rejects, so the parent can react (e.g. swap intent color). */
    onError?: () => void;
    /** Called on mouseEnter when an error was previously set, so the parent can clear its state. */
    onErrorCleared?: () => void;
}

export const ButtonPrimitive = forwardRef<HTMLButtonElement, ButtonPrimitiveProps>(
    function ButtonPrimitive({
        children, onClick, intent, size, loading, active, confirmDouble, confirmDoubleText,
        disabled, name, className, style, type, onError, onErrorCleared, title, titleProps,
        ...rest
    }, forwardedRef) {
        const [asyncLoading, setAsyncLoading] = useState(false);
        const [armed, setArmed] = useState(false);
        const [confirmText, setConfirmText] = useState<string>();
        const internalRef = useRef<HTMLButtonElement>(null);
        const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

        const effectiveLoading = loading || asyncLoading;

        const resolveRef = (node: HTMLButtonElement | null) => {
            (internalRef as React.RefObject<HTMLButtonElement | null>).current = node;
            if (typeof forwardedRef === "function") {
                forwardedRef(node);
            } else if (forwardedRef) {
                (forwardedRef as React.RefObject<HTMLButtonElement | null>).current = node;
            }
        };

        useEffect(() => {
            if (!internalRef.current || !confirmDouble) return;
            setConfirmText(pickConfirmText(internalRef.current, confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT));
        }, [internalRef.current, confirmDouble, confirmDoubleText]);

        useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

        const run = () => {
            if (!onClick) return;
            const res = onClick();
            if (isPromise(res)) {
                setAsyncLoading(true);
                res.then(() => {
                    setAsyncLoading(false);
                }).catch((err) => {
                    setAsyncLoading(false);
                    onError?.();
                    alertError(err);
                });
            }
        };

        const click = () => {
            if (effectiveLoading) return;
            if (confirmDouble && !armed) {
                setArmed(true);
                if (armTimer.current) clearTimeout(armTimer.current);
                armTimer.current = setTimeout(() => setArmed(false), CONFIRM_DOUBLE_WINDOW_MS);
                return;
            }
            if (armTimer.current) clearTimeout(armTimer.current);
            setArmed(false);
            run();
        };

        const sizeClass = size ? `rkBtn-size-${size}` : undefined;
        const stateClasses = [active && "active", armed && "rkBtn-armed", effectiveLoading && "loading"].filter(Boolean).join(" ");
        const fullClassName = [className, sizeClass, stateClasses].filter(Boolean).join(" ");

        const swapped = effectiveLoading || armed;
        const overlay: CSSProperties = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", whiteSpace: "nowrap"};
        // Spinner centered WITHOUT transform — the spin animation owns `transform`, so a
        // translate here would clash and make the ring slide instead of rotate.
        const spinnerOverlay: CSSProperties = {position: "absolute", inset: 0, margin: "auto"};
        // Short labels get the compact ring, longer ones the wide bar (restores the old
        // width-based pick, keyed on label length so no measurement is needed).
        const spinnerClass = typeof children === "string" && children.trim().length <= 3 ? "smallAnimation" : "defaultAnimation";

        const button = (
            <button
                {...rest}
                ref={resolveRef}
                type={type ?? "button"}
                name={name}
                disabled={disabled || effectiveLoading}
                title={armed ? (confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT) : undefined}
                style={{...style}}
                className={fullClassName}
                onClick={click}
                onMouseEnter={() => onErrorCleared?.()}
            >
                {/* Resting label always rendered (hidden while swapped) so it holds the
                    button's size — the spinner / confirm text overlay it, no resize, no JS. */}
                <span style={swapped ? {visibility: "hidden"} : undefined}>{children}</span>
                {effectiveLoading && <div className={spinnerClass} style={spinnerOverlay} aria-hidden/>}
                {!effectiveLoading && armed && <span style={overlay}>{confirmText ?? children}</span>}
            </button>
        );

        return armed ? button : wrapToolTip({title, titleProps}, button);
    }
);
