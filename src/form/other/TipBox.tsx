import {CSSProperties, ReactNode} from "react";
import {Intent} from "../../intents";
import "./TipBox.css"

export interface Props {
    children: ReactNode | ReactNode[],
    intent?: Intent,
    iconLetter?: string,
    style?: CSSProperties,
    className?: string,
    onClick?: () => void;
}

export function TipBox({intent = "default", iconLetter, children, style, className, onClick}: Props) {
    const intentVars = {
        "--tip-bg": `var(--rk-${intent}-soft)`,
        "--tip-border": `var(--rk-${intent}-soft-border)`,
        "--tip-text": `var(--rk-${intent}-soft-text)`,
    } as CSSProperties;
    return <div className={"tipBase" + (className ? " " + className : "")}
                style={{textAlign: "left", ...intentVars, ...style}}
                onClick={onClick}>
        {iconLetter && <div className="tipIcon">{iconLetter}</div>}
        <div className="tipText">{children}</div>
    </div>
}

/** @deprecated prefer `<TipBox intent="neutral">` */
export function NeutralTipBox(p: Props) {
    return <TipBox {...p} intent="neutral"/>
}

/** @deprecated prefer `<TipBox intent="success">` */
export function SuccessBox(p: Props) {
    return <TipBox {...p} intent="success" iconLetter="i"/>
}

/** @deprecated prefer `<TipBox intent="danger">` */
export function ErrorBox(p: Props) {
    return <TipBox {...p} intent="danger" iconLetter="!"/>
}

/** @deprecated prefer `<TipBox intent="warning">` */
export function WarningBox(p: Props) {
    return <TipBox {...p} intent="warning" iconLetter="!"/>
}
