import {CSSProperties, ReactNode, useSyncExternalStore} from "react";
import {Intent} from "../intents";
import {AddToBody} from "../helpers/AddToBody";
import "./Toast.css";

export type ToastPosition = "top-right" | "top" | "bottom-right" | "bottom";

export type ToastId = number;

interface ToastItem {
    id: ToastId;
    message: ReactNode;
    intent: Intent;
}

const MAX_VISIBLE = 4;

const DEFAULT_DURATION: Record<Intent, number> = {
    default: 3200,
    neutral: 3200,
    info: 3200,
    cool: 3200,
    success: 3200,
    warning: 4000,
    danger: 4500,
    critical: 4500,
};

let counter = 0;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach(l => l());
}

function remove(id: ToastId) {
    items = items.filter(t => t.id !== id);
    emit();
}

function show(message: ReactNode, intent: Intent, duration: number): ToastId {
    const id = ++counter;
    items = [...items, {id, message, intent}].slice(-MAX_VISIBLE);
    emit();
    if (duration > 0) {
        setTimeout(() => remove(id), duration);
    }
    return id;
}

export interface RkToastOptions {
    intent?: Intent;
    duration?: number;
}

type IntentToastFn = (message: ReactNode, opts?: Omit<RkToastOptions, "intent">) => ToastId;

function intentToast(intent: Intent): IntentToastFn {
    return (message, opts = {}) => show(message, intent, opts.duration ?? DEFAULT_DURATION[intent]);
}

export interface RkToastPromiseMessages<T> {
    loading: ReactNode;
    success: ReactNode | ((value: T) => ReactNode);
    error: ReactNode | ((err: unknown) => ReactNode);
}

export const RkToast = Object.assign(
    (message: ReactNode, opts: RkToastOptions = {}): ToastId =>
        show(message, opts.intent ?? "neutral", opts.duration ?? DEFAULT_DURATION[opts.intent ?? "neutral"]),
    {
        default: intentToast("default"),
        neutral: intentToast("neutral"),
        info: intentToast("info"),
        cool: intentToast("cool"),
        success: intentToast("success"),
        warning: intentToast("warning"),
        danger: intentToast("danger"),
        critical: intentToast("critical"),
        promise: <T,>(promise: Promise<T>, messages: RkToastPromiseMessages<T>): Promise<T> => {
            const id = show(messages.loading, "info", 0);
            promise.then(
                value => {
                    remove(id);
                    show(typeof messages.success === "function" ? messages.success(value) : messages.success, "success", DEFAULT_DURATION.success);
                },
                err => {
                    remove(id);
                    show(typeof messages.error === "function" ? messages.error(err) : messages.error, "danger", DEFAULT_DURATION.danger);
                },
            );
            return promise;
        },
        dismiss: (id?: ToastId) => {
            if (id === undefined) {
                items = [];
                emit();
            } else {
                remove(id);
            }
        },
    },
);

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
function snapshot() {
    return items;
}

export function ToastLayer({position = "top-right"}: { position?: ToastPosition } = {}) {
    const toasts = useSyncExternalStore(subscribe, snapshot, snapshot);

    if (toasts.length === 0) {
        return null;
    }

    return <AddToBody id="rkToaster">
        <div className={"rkToaster rkToaster-" + position}>
            {toasts.map(t => (
                <div key={t.id} className="rkToast"
                     style={{"--toast-color": `var(--rk-${t.intent})`} as CSSProperties}
                     onClick={() => remove(t.id)}>
                    {t.message}
                </div>
            ))}
        </div>
    </AddToBody>;
}
