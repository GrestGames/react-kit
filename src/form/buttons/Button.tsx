import "./button.css";
import {CSSProperties, ReactNode, useContext, useState} from "react";
import {FormObject} from "../useAsyncForm";
import {useForm} from "../Form";
import {useIsMobile} from "../../responsive/useResponsive";
import {ButtonAppearance, ButtonAppearanceContext} from "./buttonAppearance";
import {ButtonPrimitive, PrimitiveButtonProps} from "./ButtonPrimitive";

export interface ButtonProps extends PrimitiveButtonProps {
    onClick?: () => Promise<any> | void,
    appearance?: ButtonAppearance,
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

export function FormSubmitButton({alwaysEnabled, ...props}: Omit<ButtonProps, "onClick"> & {alwaysEnabled?: boolean}) {
    const form = useForm<any>();
    return AnyButton({
        ...props,
        type: form ? "button" : "submit",
        intent: props.intent ?? "danger",
        children: props.children || "Save",
        className: "formSubmit " + props.className,
        disabled: props.disabled || (form && !alwaysEnabled ? !form.isChanged() : false),
        onClick: form ? async () => form.getForm().submit() : () => undefined
    })
}

export function FormCancelButton(props: ButtonProps) {
    return AnyButton({...props, type: "button", intent: "warning", children: props.children || "Cancel", className: "formSubmit " + props.className, style: {float: "left", ...props.style}})
}

export function ArrayPushButton<T>({prop, blank, ...props}: Omit<ButtonProps, "onClick"> & { prop: FormObject<T[]>, blank?: Partial<T> | (() => Partial<T>) }) {
    return AnyButton({
        children: props.children || "Add row",
        ...props,
        type: "button",
        intent: "cool",
        className: "addRowButton",
        onClick: () => {
            const value = typeof blank === "function" ? (blank as (() => T))() : blank;
            prop.push(value || {} as any)
        }
    })
}

/**
 * @deprecated
 */
export function ArrayRemoveButtonOLD<T>({prop, index, ...props}: { prop: FormObject<T[]>, index: number, style?: CSSProperties }) {
    return AnyButton({
        children: "X",
        ...props,
        type: "button",
        intent: "danger",
        className: "deleteRowButton",
        onClick: () => {
            prop.splice(index, 1)
        }
    })
}

export function ArrayRemoveButton<T>({prop, ...props}: { prop: FormObject<T>, style?: CSSProperties }) {
    return AnyButton({
        children: "X",
        ...props,
        type: "button",
        intent: "danger",
        className: "deleteRowButton",
        onClick: () => {
            prop.removeFromParentArray();
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

function AnyButton({
    onClick, disabled, active, loading, name, size, confirmDouble, confirmDoubleText,
    type, className: classNameProp, style, title, titleProps, intent, appearance: appearanceProp,
    children, ...rest
}: ButtonProps & { type: "button" | "submit" | "reset" }) {
    const [hadError, setHadError] = useState(false);

    const effectiveIntent = hadError ? "warning" : intent;
    const intentVars = effectiveIntent ? {
        "--btn-bg": `var(--rk-${effectiveIntent}-fill)`,
        "--btn-bg-hover": `var(--rk-${effectiveIntent}-fill-hover)`,
        "--btn-fg": `var(--rk-${effectiveIntent}-fill-text)`,
    } as CSSProperties : {};

    const contextAppearance = useContext(ButtonAppearanceContext);
    const appearance = appearanceProp ?? contextAppearance ?? "gradient";

    const className = ["rkBtn", classNameProp, appearance === "outline" && "rkBtn-outline"].filter(Boolean).join(" ");

    return (
        <ButtonPrimitive
            {...rest}
            onClick={onClick}
            disabled={disabled}
            active={active}
            loading={loading}
            name={name}
            size={size ?? "normal"}
            confirmDouble={confirmDouble}
            confirmDoubleText={confirmDoubleText}
            type={type}
            className={className}
            style={{...intentVars, ...style}}
            title={title}
            titleProps={titleProps}
            onError={() => setHadError(true)}
            onErrorCleared={() => setHadError(false)}
        >
            {children}
        </ButtonPrimitive>
    );
}
