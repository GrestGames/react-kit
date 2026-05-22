import {ReactNode} from "react";
import {Intent} from "../intents";
import "./MiniTip.css"

export function MiniTip({children, intent}: { children: ReactNode | ReactNode[]; intent?: Intent }) {
    const style = intent ? {color: `var(--rk-${intent}-soft-text)`} : undefined;
    return <span className="miniTip" style={style}>{children}</span>
}
