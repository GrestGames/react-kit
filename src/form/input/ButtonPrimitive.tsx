import {CSSProperties, forwardRef, ReactNode, useEffect, useRef, useState} from "react";
import {isPromise} from "../../util/isPromise";
import {Alert} from "../../mini/Alert";
import {ToolTipSupported, wrapToolTip} from "../../mini/ToolTip";
import {ApiErrorMessage} from "../../ErrorTracker";
import {ERROR} from "@grest-ts/schema";
import {CONFIRM_DOUBLE_WINDOW_MS, DEFAULT_CONFIRM_DOUBLE_TEXT, pickConfirmText} from "../confirmDouble";
import React from "react";

export interface ButtonPrimitiveProps extends ToolTipSupported {
    children: ReactNode;
    onClick?: () => void | Promise<unknown>;
    /** Controlled loading; merged with async-derived: effective = loading || asyncLoading */
    loading?: boolean;
    disabled?: boolean;
    /** Signals a selected / active state (for step-2 chip reuse; Button does not expose this yet). */
    active?: boolean;
    /** First click arms (pulsing ring + confirm label, keeps intent color); a second click within ~2s fires onClick. */
    confirmDouble?: boolean,
    /** Full confirm phrase: the armed tooltip, and the widest rung of the adaptive armed label
     *  (which degrades to "Sure?" / "?" on narrow buttons). Default: "Click again to confirm". */
    confirmDoubleText?: string,
    type?: "button" | "submit" | "reset";
    className?: string;
    style?: CSSProperties;
    /** Called when an async onClick rejects, so the parent can react (e.g. swap intent color). */
    onError?: () => void;
    /** Called on mouseEnter when an error was previously set, so the parent can clear its state. */
    onErrorCleared?: () => void;
}

export const ButtonPrimitive = forwardRef<HTMLButtonElement, ButtonPrimitiveProps>(
    function ButtonPrimitive(props, forwardedRef) {
        const [asyncLoading, setAsyncLoading] = useState(false);
        const [error, setError] = useState<ERROR<string, any>>();
        const [armed, setArmed] = useState(false);
        const [confirmText, setConfirmText] = useState<string>();
        const [size, setSize] = useState<[number, number]>(undefined);
        const internalRef = useRef<HTMLButtonElement>(null);
        const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

        const effectiveLoading = props.loading || asyncLoading;

        const resolveRef = (node: HTMLButtonElement | null) => {
            (internalRef as React.RefObject<HTMLButtonElement | null>).current = node;
            if (typeof forwardedRef === "function") {
                forwardedRef(node);
            } else if (forwardedRef) {
                (forwardedRef as React.RefObject<HTMLButtonElement | null>).current = node;
            }
        };

        useEffect(() => {
            if (!internalRef.current) return;
            setSize([internalRef.current.offsetWidth, internalRef.current.offsetHeight]);
            if (props.confirmDouble) {
                setConfirmText(pickConfirmText(internalRef.current, props.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT));
            }
        }, [internalRef.current]);

        useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

        const run = () => {
            if (!props.onClick) return;
            const res = props.onClick();
            if (isPromise(res)) {
                setAsyncLoading(true);
                res.then(() => {
                    setAsyncLoading(false);
                }).catch((err) => {
                    setAsyncLoading(false);
                    setError(ERROR.fromUnknown(err));
                    props.onError?.();
                });
            }
        };

        const click = () => {
            if (effectiveLoading) return;
            if (props.confirmDouble && !armed) {
                setArmed(true);
                if (armTimer.current) clearTimeout(armTimer.current);
                armTimer.current = setTimeout(() => setArmed(false), CONFIRM_DOUBLE_WINDOW_MS);
                return;
            }
            if (armTimer.current) clearTimeout(armTimer.current);
            setArmed(false);
            run();
        };

        const stateClasses = [armed && "rkBtn-armed", effectiveLoading && "loading"].filter(Boolean).join(" ");
        const fullClassName = [props.className, stateClasses].filter(Boolean).join(" ");

        const button = (
            <button
                ref={resolveRef}
                type={props.type ?? "button"}
                disabled={props.disabled || effectiveLoading}
                title={armed ? (props.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT) : undefined}
                style={{width: size?.[0], height: size?.[1], ...props.style}}
                className={fullClassName}
                onClick={click}
                onMouseEnter={() => props.onErrorCleared?.()}
            >
                {effectiveLoading && <div className={size?.[0] <= 45 ? "smallAnimation" : "defaultAnimation"}/>}
                {!effectiveLoading && (armed ? (confirmText ?? props.children) : props.children)}
            </button>
        );

        return <>
            {error && <Alert intent="danger" onClick={() => setError(undefined)}><ApiErrorMessage error={error}/></Alert>}
            {armed ? button : wrapToolTip(props, button)}
        </>;
    }
);
