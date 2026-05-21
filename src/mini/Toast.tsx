import {ReactNode, useEffect, useState} from "react";
import {AddToBody} from "../helpers/AddToBody";
import "./Toast.css";

export type ToastType = "info" | "success" | "warning" | "error";
export type ToastPosition = "top-right" | "top" | "bottom-right" | "bottom";

interface ToastItem {
    id: number;
    message: ReactNode;
    type: ToastType;
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

function show(message: ReactNode, type: ToastType, duration: number): number {
    const id = ++counter;
    items = [...items, {id, message, type}].slice(-MAX_VISIBLE);
    emit();
    if (duration > 0) {
        setTimeout(() => remove(id), duration);
    }
    return id;
}

export interface ToastOptions {
    type?: ToastType;
    duration?: number;
}

export const toast = Object.assign(
    (message: ReactNode, opts: ToastOptions = {}) => show(message, opts.type ?? "info", opts.duration ?? 3200),
    {
        info: (message: ReactNode, duration = 3200) => show(message, "info", duration),
        success: (message: ReactNode, duration = 3200) => show(message, "success", duration),
        warning: (message: ReactNode, duration = 4000) => show(message, "warning", duration),
        error: (message: ReactNode, duration = 4500) => show(message, "error", duration),
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
                <div key={t.id} className={"rkToast rkToast-" + t.type} onClick={() => remove(t.id)}>
                    {t.message}
                </div>
            ))}
        </div>
    </AddToBody>;
}
