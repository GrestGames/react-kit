import "../css/button.css";
import {CSSProperties, PropsWithChildren, ReactNode, useContext, useState} from "react";
import {ToolTipSupported} from "../../mini/ToolTip";
import {AnyFormElement} from "./StandardFormElementProps";
import {FormObject} from "../useAsyncForm";
import {useForm} from "../Form";
import {useIsMobile} from "../../responsive/useResponsive";
import {Intent} from "../../intents";
import {ButtonAppearance, ButtonAppearanceContext} from "./buttonAppearance";
import {ButtonPrimitive, ButtonPrimitiveProps} from "./ButtonPrimitive";

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
    const [hadError, setHadError] = useState(false);

    const effectiveIntent = hadError ? "warning" : props.intent;
    const intentVars = effectiveIntent ? {
        "--btn-bg": `var(--rk-${effectiveIntent}-fill)`,
        "--btn-bg-hover": `var(--rk-${effectiveIntent}-fill-hover)`,
        "--btn-fg": `var(--rk-${effectiveIntent}-fill-text)`,
    } as CSSProperties : {};

    const contextAppearance = useContext(ButtonAppearanceContext);
    const appearance = props.appearance ?? contextAppearance ?? "gradient";

    const className = ["rkBtn", props.className, appearance === "outline" && "rkBtn-outline"].filter(Boolean).join(" ");

    const primitiveProps: Omit<ButtonPrimitiveProps, "children"> = {
        onClick: props.onClick,
        disabled: props.disabled || props.readOnly,
        confirmDouble: props.confirmDouble,
        confirmDoubleText: props.confirmDoubleText,
        type: props.type,
        className,
        style: {...intentVars, ...props.style},
        title: props.title,
        titleProps: props.titleProps,
        onError: () => setHadError(true),
        onErrorCleared: () => setHadError(false),
    };

    return <ButtonPrimitive {...primitiveProps}>{props.children}</ButtonPrimitive>;
}
