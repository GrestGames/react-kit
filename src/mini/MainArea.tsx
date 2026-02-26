import {CSSProperties, PropsWithChildren} from "react";

export function MainArea({children, style}: PropsWithChildren<{ style?: CSSProperties }>) {
    return <div className="main" style={style}>{children}</div>
}
