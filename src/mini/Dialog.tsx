import {CSSProperties, ReactNode, useEffect, useSyncExternalStore} from "react";
import {Intent} from "../intents";
import {Modal} from "./Modal";
import {Panel} from "./Panel";
import "./Alert.css";

type DialogKind = "alert" | "confirm";

interface DialogRequest {
    id: number;
    kind: DialogKind;
    title?: string;
    message: ReactNode;
    intent?: Intent;
    iconLetter?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    buttonTitle?: string;
    width?: number | string;
    resolve: (v: boolean) => void;
}

let counter = 0;
let queue: DialogRequest[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach(l => l());
}

function push(req: Omit<DialogRequest, "id" | "resolve">): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        queue = [...queue, {...req, id: ++counter, resolve}];
        emit();
    });
}

function resolveCurrent(v: boolean) {
    const current = queue[0];
    if (!current) return;
    queue = queue.slice(1);
    emit();
    current.resolve(v);
}

export interface RkConfirmOptions {
    title?: string;
    message: ReactNode;
    intent?: Intent;
    confirmLabel?: string;
    cancelLabel?: string;
}

export interface RkAlertOptions {
    title?: string;
    message: ReactNode;
    intent?: Intent;
    iconLetter?: string;
    buttonTitle?: string;
    width?: number | string;
}

type RkConfirmFn = (opts: RkConfirmOptions) => Promise<boolean>;
type RkAlertFn = (opts: RkAlertOptions) => Promise<void>;

function confirmWith(intent?: Intent): RkConfirmFn {
    return opts => push({...opts, kind: "confirm", intent: intent ?? opts.intent});
}
function alertWith(intent?: Intent): RkAlertFn {
    return async opts => { await push({...opts, kind: "alert", intent: intent ?? opts.intent}); };
}

export const RkConfirm = Object.assign(confirmWith(), {
    info: confirmWith("info"),
    warning: confirmWith("warning"),
    danger: confirmWith("danger"),
});

export const RkAlert = Object.assign(alertWith(), {
    info: alertWith("info"),
    warning: alertWith("warning"),
    danger: alertWith("danger"),
});

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
function snapshot() {
    return queue[0];
}

function iconForIntent(intent: Intent): string {
    return intent === "danger" || intent === "critical" || intent === "warning" ? "!" : "i";
}

export function RkDialogLayer() {
    const current = useSyncExternalStore(subscribe, snapshot, snapshot);

    useEffect(() => {
        if (!current) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") { e.stopPropagation(); resolveCurrent(true); }
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [current]);

    if (!current) return null;

    const {intent} = current;
    const alertVars = intent ? {
        "--alert-bg": `var(--rk-${intent}-soft)`,
        "--alert-border": `var(--rk-${intent}-soft-border)`,
        "--alert-text": `var(--rk-${intent}-soft-text)`,
    } as CSSProperties : undefined;
    const btnVars = intent ? {
        "--btn-bg": `var(--rk-${intent}-fill)`,
        "--btn-bg-hover": `var(--rk-${intent}-fill-hover)`,
    } as CSSProperties : undefined;
    const letter = current.iconLetter ?? (intent ? iconForIntent(intent) : undefined);

    return <Modal band="top" onDismiss={() => resolveCurrent(false)}>
        <Panel className={intent ? "panelAlert" : undefined} width={current.width ?? "420px"} style={{marginTop: "180px", ...alertVars}}>
            <div className="alertBody">
                {current.title && (intent
                    ? <div className="alertHead"><span className="alertIcon">{letter}</span><span className="alertHeadTitle">{current.title}</span></div>
                    : <div className="alertTitle">{current.title}</div>)}
                <div className="alertContent">{current.message}</div>
                <div className="alertActions">
                    {current.kind === "confirm" &&
                        <button className="rkBtn rkBtn-outline" style={btnVars} onClick={() => resolveCurrent(false)}>{current.cancelLabel ?? "Cancel"}</button>}
                    <button className="rkBtn" style={btnVars} autoFocus onClick={() => resolveCurrent(true)}>
                        {current.kind === "confirm" ? (current.confirmLabel ?? "Confirm") : (current.buttonTitle ?? "OK")}
                    </button>
                </div>
            </div>
        </Panel>
    </Modal>;
}
