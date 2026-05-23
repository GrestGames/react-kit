import "../css/button.css";
import {CSSProperties, PropsWithChildren, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {isPromise} from "../../util/isPromise";
import {Alert} from "../../mini/Alert";
import {ToolTipSupported, wrapToolTip} from "../../mini/ToolTip";
import {ApiErrorMessage} from "../../ErrorTracker";
import {AnyFormElement} from "./StandardFormElementProps";
import {FormObject} from "../useAsyncForm";
import {useForm} from "../Form";
import {ERROR} from "@grest-ts/schema";
import {useIsMobile} from "../../responsive/useResponsive";
import {Intent} from "../../intents";
import {ButtonAppearance, ButtonAppearanceContext} from "./buttonAppearance";
import {CONFIRM_DOUBLE_WINDOW_MS, DEFAULT_CONFIRM_DOUBLE_TEXT, pickConfirmText} from "../confirmDouble";

export interface ButtonProps extends PropsWithChildren<AnyFormElement>, ToolTipSupported {
    onClick: () => Promise<any> | void,
    intent?: Intent,
    appearance?: ButtonAppearance,
    /** First click arms (pulsing ring + confirm label, keeps intent color); a second click within ~2s fires onClick. */
    confirmDouble?: boolean,
    /** Full confirm phrase: the armed tooltip, and the widest rung of the adaptive armed label
     *  (which degrades to "Sure?" / "?" on narrow buttons). Default: "Click again to confirm". */
    confirmDoubleText?: string,
}

/** @deprecated prefer `<Button intent="warning">` */
export function WarningButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: "warning"})
}

/** @deprecated prefer `<Button intent="danger">` */
export function DangerButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: "danger"})
}

export function SecondaryButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: "cool"})
}

export function Button(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: props.intent})
}

export function SubmitButton(props: Omit<ButtonProps, "onClick">) {
    const form = useForm<any>();
    return AnyButton({
        ...props,
        type: form ? "button" : "submit",
        intent: "warning",
        children: props.children || "Save",
        disabled: props.disabled || (form ? !form.isChanged() : false),
        onClick: form ? async () => form.getForm().submit() : () => undefined
    })
}

export function FormSubmitButton(props: Omit<ButtonProps, "onClick">) {
    const form = useForm<any>();
    return AnyButton({
        ...props,
        type: form ? "button" : "submit",
        intent: "danger",
        children: props.children || "Save",
        className: "formSubmit " + props.className,
        disabled: props.disabled || (form ? !form.isChanged() : false),
        onClick: form ? async () => form.getForm().submit() : () => undefined
    })
}

export function FormCancelButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: "warning", children: props.children || "Cancel", className: "formSubmit " + props.className, style: {float: "left", ...props.style}})
}

export function ArrayPushButton<T>(props: Omit<ButtonProps, "onClick"> & { prop: FormObject<T[]>, blank?: Partial<T> | (() => Partial<T>) }) {
    return AnyButton({
        children: props.children || "Add row",
        ...props,
        type: "button",
        intent: "cool",
        className: "addRowButton",
        onClick: () => {
            const value = typeof props.blank === "function" ? (props.blank as (() => T))() : props.blank;
            props.prop.push(value || {} as any)
        }
    })
}

/**
 * @deprecated
 */
export function ArrayRemoveButtonOLD<T>(props: { prop: FormObject<T[]>, index: number, style?: CSSProperties }) {
    return AnyButton({
        children: "X",
        ...props,
        type: "button",
        intent: "danger",
        className: "deleteRowButton",
        onClick: () => {
            props.prop.splice(props.index, 1)
        }
    })
}

export function ArrayRemoveButton<T>(props: { prop: FormObject<T>, style?: CSSProperties }) {
    return AnyButton({
        children: "X",
        ...props,
        type: "button",
        intent: "danger",
        className: "deleteRowButton",
        onClick: () => {
            props.prop.removeFromParentArray();
        }
    })
}

export function AddNewButton({onClick, children}: {onClick: () => void, children?: ReactNode}) {
    const isMobile = useIsMobile();
    return AnyButton({
        type: "button",
        className: "gridAddNew",
        children: isMobile ? "+" : (children || "Add new"),
        onClick
    });
}

function AnyButton(props: PropsWithChildren<ButtonProps & {
    type: "button" | "submit" | "reset",
}>) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ERROR<string, any>>();
    const [hadError, setHadError] = useState(false);
    const [armed, setArmed] = useState(false);
    const [confirmText, setConfirmText] = useState<string>();
    const [size, setSize] = useState<[number, number]>(undefined)
    const ref = useRef<HTMLButtonElement>(null);
    const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setSize([ref.current.offsetWidth, ref.current.offsetHeight])
        if (props.confirmDouble) setConfirmText(pickConfirmText(ref.current, props.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT))
    }, [ref.current]);

    useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

    const run = () => {
        const res = props.onClick();
        if (isPromise(res)) {
            setIsLoading(true);
            res.then(() => {
                setIsLoading(false);
            }).catch((err) => {
                setIsLoading(false);
                setError(ERROR.fromUnknown(err))
                setHadError(true)
            })
        }
    }

    const click = () => {
        if (isLoading) {
            return;
        }
        if (props.confirmDouble && !armed) {
            setArmed(true);
            if (armTimer.current) clearTimeout(armTimer.current);
            armTimer.current = setTimeout(() => setArmed(false), CONFIRM_DOUBLE_WINDOW_MS);
            return;
        }
        if (armTimer.current) clearTimeout(armTimer.current);
        setArmed(false);
        run();
    }

    const effectiveIntent = hadError ? "warning" : props.intent;
    const intentVars = effectiveIntent ? {
        "--btn-bg": `var(--rk-${effectiveIntent}-fill)`,
        "--btn-bg-hover": `var(--rk-${effectiveIntent}-fill-hover)`,
        "--btn-fg": `var(--rk-${effectiveIntent}-fill-text)`,
    } as CSSProperties : {};

    const contextAppearance = useContext(ButtonAppearanceContext);
    const appearance = props.appearance ?? contextAppearance ?? "gradient";

    const button = <button type={props.type}
                ref={ref}
                disabled={props.disabled || props.readOnly || isLoading}
                title={armed ? (props.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT) : undefined}
                style={{width: size?.[0], height: size?.[1], ...intentVars, ...props.style}}
                className={["rkBtn", props.className, appearance === "outline" && "rkBtn-outline", armed && "rkBtn-armed", isLoading && "loading"].filter(Boolean).join(" ")}
                onClick={click}
                onMouseEnter={() => setHadError(false)}>
            {isLoading && <div className={size?.[0] <= 45 ? "smallAnimation" : "defaultAnimation"}/>}
            {!isLoading && (armed ? (confirmText ?? props.children) : props.children)}
        </button>;

    return <>
        {error && <Alert intent="danger" onClick={() => setError(undefined)}><ApiErrorMessage error={error}/></Alert>}
        {armed ? button : wrapToolTip(props, button)}
    </>
}
