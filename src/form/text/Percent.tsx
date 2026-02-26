import {CSSProperties} from "react";

export function Percent({value, decimals, hide0, className, style}: { value: number, decimals?: number, hide0?: boolean, className?: string, style?: CSSProperties }) {
    if (isNaN(Number(value)) || value === null || value === undefined || Math.round(value * 100) / 100 === 0 && hide0) {
        return <span>&nbsp;</span>
    } else {
        return <span className={className} style={style}>{Number(value).toFixed(decimals === undefined ? 2 : decimals).replace(/\d(?=(\d{3})+$)/g, '$& ') + "%"}</span>
    }
}