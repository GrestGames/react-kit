import React, {CSSProperties, ReactNode, useEffect} from "react";
import "./Panel.css"
import {useDisableMainPage} from "../MyPage";

export interface Props {
    title?: string;
    subTitle?: string;
    width?: string | number,
    children: ReactNode | ReactNode[],
    onClose?: () => void;
    onClickTitle?: () => void
    zIndex?: number | string,
    style?: CSSProperties,
    className?: string
}

export function Panel({children, title, subTitle, width, zIndex, style, className, onClose, onClickTitle}: Props) {
    const [isDrawnOnce, setIsDrawnOnce] = React.useState(false);
    useEffect(() => {
        setTimeout(() => {
            setIsDrawnOnce(true);
        }, 10)
    }, [])

    useDisableMainPage();

    return <div className={"panel" + (isDrawnOnce ? " " : " panelInit") + (className ? " " + className : "")} style={{width: width, zIndex: zIndex || 100, ...style}}>

        <div className="panelTop">
            {title && <div className="panelTitleArea" onClick={onClickTitle} style={{cursor: onClickTitle ? "pointer" : undefined}}>
                <span className="panelTitle">{title}</span>
                {subTitle && <><br/><span className="panelSubTitle">{subTitle}</span></>}
            </div>}

            {/* Out of the tab order so a dialog's initial focus lands on its content; Escape closes it. */}
            {onClose && <button type="button" tabIndex={-1} className="closeButton" aria-label="Close" onClick={onClose}>X</button>}
        </div>

        <div className="panelInner" style={{width: "100%", height: "100%"}}>
            {children}
        </div>
    </div>
}