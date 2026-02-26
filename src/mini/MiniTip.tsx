import {ReactNode} from "react";
import "./MiniTip.css"

export function MiniTip({children}: { children: ReactNode | ReactNode[] }) {
    return <span className="miniTip">{children}</span>
}