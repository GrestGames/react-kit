import "../css/button.css";
import {CSSProperties, PropsWithChildren, ReactNode, useEffect, useRef, useState} from "react";
import {isPromise} from "../../util/isPromise";
import {ErrorAlert} from "../../mini/Alert";
import {ApiErrorMessage} from "../../ErrorTracker";
import {AnyFormElement} from "./StandardFormElementProps";
import {FormObject} from "../useAsyncForm";
import {useForm} from "../Form";
import {ERROR} from "@grest-ts/schema";
import {useIsMobile} from "../../responsive/useResponsive";

export interface ButtonProps extends PropsWithChildren<AnyFormElement> {
    onClick: () => Promise<any> | void,
}

export function WarningButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", design: "warning"})
}

export function DangerButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", design: "danger"})
}

export function SecondaryButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", design: "secondary"})
}

export function Button(props: ButtonProps) {
    return AnyButton({...props, type: "button"})
}

export function SubmitButton(props: Omit<ButtonProps, "onClick">) {
    const form = useForm<any>();
    return AnyButton({
        ...props,
        type: form ? "button" : "submit",
        design: "secondary",
        children: props.children || "Save",
        onClick: form ? async () => form.getForm().submit() : () => undefined
    })
}

export function FormSubmitButton(props: Omit<ButtonProps, "onClick">) {
    const form = useForm<any>();
    return AnyButton({
        ...props,
        type: form ? "button" : "submit",
        design: "danger",
        children: props.children || "Save",
        className: "formSubmit " + props.className,
        onClick: form ? async () => form.getForm().submit() : () => undefined
    })
}

export function FormCancelButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", design: "warning", children: props.children || "Cancel", className: "formSubmit " + props.className, style: {float: "left", ...props.style}})
}

export function ArrayPushButton<T>(props: Omit<ButtonProps, "onClick"> & { prop: FormObject<T[]>, blank?: Partial<T> | (() => Partial<T>) }) {
    return AnyButton({
        children: props.children || "Add row",
        ...props,
        type: "button",
        className: "addRowButton secondary",
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
        className: "deleteRowButton danger",
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
        className: "deleteRowButton danger",
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
    design?: "warning" | "secondary" | "danger"
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
    return <>
        {error && <ErrorAlert onClick={() => setError(undefined)}><ApiErrorMessage error={error}/></ErrorAlert>}
        <button type={props.type}
                ref={ref}
                disabled={props.disabled || props.readOnly || isLoading}
                style={{width: size?.[0], height: size?.[1], ...props.style}}
                className={props.design + " " + props.className + " " + (isLoading && " loading ") + " " + (hadError && " warning ")}
                onClick={click}
                onMouseEnter={() => setHadError(false)}>
            {isLoading && <div className={size?.[0] <= 45 ? "smallAnimation" : "defaultAnimation"}/>}
            {!isLoading && props.children}
        </button>
    </>
}
