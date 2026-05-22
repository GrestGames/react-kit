import {CSSProperties, ReactNode, useEffect, useState} from "react";
import {Intent} from "../intents";
import {AddToBody} from "../helpers/AddToBody";
import "./Toast.css";

export type ToastPosition = "top-right" | "top" | "bottom-right" | "bottom";

interface ToastItem {
    id: number;
    message: ReactNode;
    intent: Intent;
}

const MAX_VISIBLE = 4;

let counter = 0;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach(l => l());
}

function remove(id: number) {
    items = items.filter(t => t.id !== id);
    emit();
}

function show(message: ReactNode, intent: Intent, duration: number): number {
    const id = ++counter;
    items = [...items, {id, message, intent}].slice(-MAX_VISIBLE);
    emit();
    if (duration > 0) {
        setTimeout(() => remove(id), duration);
    }
    return id;
}

export interface ToastOptions {
    intent?: Intent;
    duration?: number;
}

export const toast = Object.assign(
    (message: ReactNode, opts: ToastOptions = {}) => show(message, opts.intent ?? "neutral", opts.duration ?? 3200),
    {
        default: (message: ReactNode, duration = 3200) => show(message, "default", duration),
        neutral: (message: ReactNode, duration = 3200) => show(message, "neutral", duration),
        info: (message: ReactNode, duration = 3200) => show(message, "info", duration),
        cool: (message: ReactNode, duration = 3200) => show(message, "cool", duration),
        success: (message: ReactNode, duration = 3200) => show(message, "success", duration),
        warning: (message: ReactNode, duration = 4000) => show(message, "warning", duration),
        danger: (message: ReactNode, duration = 4500) => show(message, "danger", duration),
        critical: (message: ReactNode, duration = 4500) => show(message, "critical", duration),
        dismiss: (id: number) => remove(id),
    }
);

export function Toaster({position = "top-right"}: { position?: ToastPosition } = {}) {
    const [, forceRender] = useState(0);
    useEffect(() => {
        const listener = () => forceRender(v => v + 1);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    if (items.length === 0) {
        return null;
    }

    return <AddToBody id="rkToaster">
        <div className={"rkToaster rkToaster-" + position}>
            {items.map(t => (
                <div key={t.id} className="rkToast"
                     style={{"--toast-color": `var(--rk-${t.intent})`} as CSSProperties}
                     onClick={() => remove(t.id)}>
                    {t.message}
                </div>
            ))}
        </div>
    </AddToBody>;
}
