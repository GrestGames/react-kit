import {CSSProperties, PropsWithChildren} from 'react'
import {Intent} from "../intents";
import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import "./Alert.css";

interface Props {
    title?: string;
    buttonTitle?: string;
    onClick?: () => void;
    width?: number | string;
    intent?: Intent;
    iconLetter?: string;
}

function iconForIntent(intent: Intent): string {
    return intent === "danger" || intent === "critical" || intent === "warning" ? "!" : "i";
}

export function Alert({intent, iconLetter, title, children, buttonTitle, onClick, width}: PropsWithChildren<Props>) {
    const content = typeof children === "string" ? convertLineBreaksToBr(children) : children;
    const alertVars = intent ? {
        "--alert-bg": `var(--rk-${intent}-soft)`,
        "--alert-border": `var(--rk-${intent}-soft-border)`,
        "--alert-text": `var(--rk-${intent}-soft-text)`,
    } as CSSProperties : undefined;
    const btnVars = intent ? {
        "--btn-bg": `var(--rk-${intent}-fill)`,
        "--btn-bg-hover": `var(--rk-${intent}-fill-hover)`,
    } as CSSProperties : undefined;
    const letter = iconLetter ?? (intent ? iconForIntent(intent) : undefined);
    return <AddToBody id="alert">
        <DarkBackground zIndex="var(--rk-z-overlay)" onClick={onClick}/>
        <Panel className={intent ? "panelAlert" : undefined} width={width || "400px"} zIndex="var(--rk-z-overlay)" style={{marginTop: "180px", ...alertVars}}>
            <div className="alertBody">
                {intent
                    ? <div className="alertHead"><span className="alertIcon">{letter}</span><span className="alertHeadTitle">{title || "Alert"}</span></div>
                    : <div className="alertTitle">{title || "Alert"}</div>}
                <div className="alertContent">{content}</div>
                <div className="alertActions">
                    <button className="rkBtn" style={btnVars} onClick={onClick}>{buttonTitle || 'OK'}</button>
                </div>
            </div>
        </Panel>
    </AddToBody>
}

/** @deprecated prefer `<Alert intent="info">` */
export function InfoAlert(props: PropsWithChildren<Props>) {
    return <Alert {...props} intent="info"/>
}

/** @deprecated prefer `<Alert intent="warning">` */
export function WarningAlert(props: PropsWithChildren<Props>) {
    return <Alert {...props} intent="warning"/>
}

/** @deprecated prefer `<Alert intent="danger">` */
export function ErrorAlert(props: PropsWithChildren<Props>) {
    return <Alert {...props} intent="danger"/>
}

function convertLineBreaksToBr(string: string) {
    return string.split('\n').map((line: string, index: number, array: string[]) => (
        <span key={index}>
            {line}{index !== array.length - 1 && <br/>}
        </span>
    ));
}
