import {ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState} from "react";

const STEP = 10;

export function overlayZ(offset: number): string {
    if (offset === 0) return "var(--rk-z-modal)";
    return offset > 0
        ? `calc(var(--rk-z-modal) + ${offset})`
        : `calc(var(--rk-z-modal) - ${-offset})`;
}

export type OverlayBand = "panel" | "top";
const BAND_RANK: Record<OverlayBand, number> = {panel: 0, top: 1};

interface Entry {
    id: string;
    band: OverlayBand;
    order: number;
    seq: number;
}

interface OverlayStackValue {
    register: (id: string, band: OverlayBand, order: number) => void;
    unregister: (id: string) => void;
    offsetOf: (id: string) => number;
    isTop: (id: string) => boolean;
}

const OverlayStackContext = createContext<OverlayStackValue | undefined>(undefined);

export function OverlayStackProvider({children}: {children: ReactNode}) {
    const [entries, setEntries] = useState<Entry[]>([]);
    const seq = useRef(0);

    const register = useCallback((id: string, band: OverlayBand, order: number) => {
        setEntries((prev) => {
            const found = prev.find((e) => e.id === id);
            if (found) return found.band === band && found.order === order ? prev : prev.map((e) => (e.id === id ? {...e, band, order} : e));
            return [...prev, {id, band, order, seq: seq.current++}];
        });
    }, []);

    const unregister = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const value = useMemo<OverlayStackValue>(() => {
        const sorted = [...entries].sort((a, b) =>
            (BAND_RANK[a.band] - BAND_RANK[b.band]) || (a.order - b.order) || (a.seq - b.seq));
        const pos = new Map(sorted.map((e, i) => [e.id, i] as const));
        const topId = sorted.length ? sorted[sorted.length - 1].id : undefined;
        return {
            register,
            unregister,
            offsetOf: (id) => (pos.get(id) ?? 0) * STEP,
            isTop: (id) => id === topId,
        };
    }, [entries, register, unregister]);

    return <OverlayStackContext.Provider value={value}>{children}</OverlayStackContext.Provider>;
}

export function useOverlayStack(): OverlayStackValue | undefined {
    return useContext(OverlayStackContext);
}

export const OverlayOrderContext = createContext<number | undefined>(undefined);

export function useOverlayOrder(): number | undefined {
    return useContext(OverlayOrderContext);
}
