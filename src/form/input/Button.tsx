import "../css/button.css";
import {CSSProperties, PropsWithChildren, ReactNode, useEffect, useRef, useState} from "react";
import {isPromise} from "../../util/isPromise";
import {Alert} from "../../mini/Alert";
import {ApiErrorMessage} from "../../ErrorTracker";
import {AnyFormElement} from "./StandardFormElementProps";
import {FormObject} from "../useAsyncForm";
import {useForm} from "../Form";
import {ERROR} from "@grest-ts/schema";
import {useIsMobile} from "../../responsive/useResponsive";
import {Intent} from "../../intents";

export interface ButtonProps extends PropsWithChildren<AnyFormElement> {
    onClick: () => Promise<any> | void,
    intent?: Intent,
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
    const [size, setSize] = useState<[number, number]>(undefined)
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setSize([ref.current.offsetWidth, ref.current.offsetHeight])
    }, [ref.current]);

    const click = () => {
        if (isLoading) {
            return;
        }
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

    const effectiveIntent = hadError ? "warning" : props.intent;
    const intentVars = effectiveIntent ? {
        "--btn-bg": `var(--rk-${effectiveIntent}-fill)`,
        "--btn-bg-hover": `var(--rk-${effectiveIntent}-fill-hover)`,
        "--btn-fg": `var(--rk-${effectiveIntent}-fill-text)`,
    } as CSSProperties : {};

    return <>
        {error && <Alert intent="danger" onClick={() => setError(undefined)}><ApiErrorMessage error={error}/></Alert>}
        <button type={props.type}
                ref={ref}
                disabled={props.disabled || props.readOnly || isLoading}
                style={{width: size?.[0], height: size?.[1], ...intentVars, ...props.style}}
                className={[props.className, isLoading && "loading"].filter(Boolean).join(" ")}
                onClick={click}
                onMouseEnter={() => setHadError(false)}>
            {isLoading && <div className={size?.[0] <= 45 ? "smallAnimation" : "defaultAnimation"}/>}
            {!isLoading && props.children}
        </button>
    </>
}
