import {CSSProperties, ReactNode} from "react";
import "./TipBox.css"

export interface Props {
    children: ReactNode | ReactNode[],
    style?: CSSProperties,
    className?: string
    onClick?: () => void;
}

export function TipBox({children, style, className, onClick}: Props) {
    return <div className={"tipBase hintTip " + className} style={{textAlign: "left", ...(style || {})}} onClick={onClick}>
        {/*<div className="tipIcon">?</div>*/}
        <div className="tipText">{children}</div>
    </div>
}

export function SuccessBox({children, style, className, onClick}: Props) {
    return <div className={"tipBase infoTip " + className} style={{textAlign: "left", ...(style || {})}} onClick={onClick}>
        <div className="tipIcon">i</div>
        <div className="tipText">{children}</div>
    </div>
}

export function ErrorBox({children, style, className, onClick}: Props) {
    return <div className={"tipBase errorTip " + className} style={{textAlign: "left", ...(style || {})}} onClick={onClick}>
        <div className="tipIcon">!</div>
        <div className="tipText">{children}</div>
    </div>
}

export function WarningBox({children, style, className, onClick}: Props) {
    return <div className={"tipBase warningTip " + className} style={{textAlign: "left", ...(style || {})}} onClick={onClick}>
        <div className="tipIcon">!</div>
        <div className="tipText">{children}</div>
    </div>
}