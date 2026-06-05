import "./Callout.css";
import {CSSProperties, PropsWithChildren, ReactNode} from "react";
import {Intent} from "../intents";
import {Button} from "../form/buttons/Button";

export interface CalloutAction {
    label: ReactNode;
    onClick: () => void | Promise<unknown>;
}

interface Props {
    intent?: Intent;
    title?: ReactNode;
    iconLetter?: string;
    action?: CalloutAction;
    width?: number | string;
    className?: string;
    style?: CSSProperties;
}

function iconForIntent(intent: Intent): string {
    return intent === "danger" || intent === "critical" || intent === "warning" ? "!" : "i";
}

/** Inline intent-coloured message box (bordered, non-modal). For an acknowledge
 *  dialog use `Alert`; for a transient notification use `Toast`. */
export function Callout({intent, iconLetter, title, action, width, className, style, children}: PropsWithChildren<Props>) {
    const vars = intent ? {
        "--callout-bg": `var(--rk-${intent}-soft)`,
        "--callout-border": `var(--rk-${intent}-soft-border)`,
        "--callout-text": `var(--rk-${intent}-soft-text)`,
    } as CSSProperties : undefined;
    const letter = iconLetter ?? (intent ? iconForIntent(intent) : undefined);
    return <div className={["rkCallout", className].filter(Boolean).join(" ")} style={{width, ...vars, ...style}}>
        {(title || letter) && <div className="rkCalloutHead">
            {letter && <span className="rkCalloutIcon">{letter}</span>}
            {title && <span className="rkCalloutTitle">{title}</span>}
        </div>}
        {children && <div className="rkCalloutBody">{children}</div>}
        {action && <div className="rkCalloutActions">
            <Button intent={intent} onClick={action.onClick}>{action.label}</Button>
        </div>}
    </div>;
}
