import {PropsWithChildren} from 'react'
import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import "./Alert.css";

interface Props {
    title?: string;
    buttonTitle?: string;
    onClick?: () => void;
    width?: number | string
}

type AlertVariant = "neutral" | "info" | "warning" | "error";

const VARIANTS: Record<Exclude<AlertVariant, "neutral">, { cls: string; icon: string; button: string }> = {
    info: {cls: "alertInfo", icon: "i", button: ""},
    warning: {cls: "alertWarning", icon: "!", button: "warning"},
    error: {cls: "alertError", icon: "!", button: "danger"},
};

function AlertBase({variant, title, children, buttonTitle, onClick, width}: PropsWithChildren<Props & { variant: AlertVariant }>) {
    const content = typeof children === "string" ? convertLineBreaksToBr(children) : children;
    const cfg = variant === "neutral" ? undefined : VARIANTS[variant];
    return <AddToBody id="alert">
        <DarkBackground zIndex={200} onClick={onClick}/>
        <Panel className={cfg ? "panelAlert " + cfg.cls : undefined} width={width || "400px"} zIndex={201} style={{marginTop: "180px"}}>
            <div className="alertBody">
                {cfg
                    ? <div className="alertHead"><span className="alertIcon">{cfg.icon}</span><span className="huge bold">{title || "Alert"}</span></div>
                    : <div className="huge bold alertTitle">{title || "Alert"}</div>}
                <div className="alertContent">{content}</div>
                <div className="alertActions">
                    <button className={cfg?.button || undefined} onClick={onClick}>{buttonTitle || 'OK'}</button>
                </div>
            </div>
        </Panel>
    </AddToBody>
}

export function Alert(props: PropsWithChildren<Props>) {
    return <AlertBase {...props} variant="neutral"/>
}

export function InfoAlert(props: PropsWithChildren<Props>) {
    return <AlertBase {...props} variant="info"/>
}

export function WarningAlert(props: PropsWithChildren<Props>) {
    return <AlertBase {...props} variant="warning"/>
}

export function ErrorAlert(props: PropsWithChildren<Props>) {
    return <AlertBase {...props} variant="error"/>
}

function convertLineBreaksToBr(string: string) {
    return string.split('\n').map((line: string, index: number, array: string[]) => (
        <span key={index}>
            {line}{index !== array.length - 1 && <br/>}
        </span>
    ));
}
