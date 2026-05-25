import {createContext, useContext, useLayoutEffect, useSyncExternalStore} from "react";

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

const entries: Entry[] = [];
let seq = 0;
let version = 0;
let sortedCache: Entry[] | null = null;
const listeners = new Set<() => void>();

function emit() {
    version++;
    sortedCache = null;
    listeners.forEach((l) => l());
}

function register(id: string, band: OverlayBand, order: number) {
    const found = entries.find((e) => e.id === id);
    if (found) {
        if (found.band !== band || found.order !== order) { found.band = band; found.order = order; emit(); }
        return;
    }
    entries.push({id, band, order, seq: seq++});
    emit();
}

function unregister(id: string) {
    const i = entries.findIndex((e) => e.id === id);
    if (i >= 0) { entries.splice(i, 1); emit(); }
}

function sorted(): Entry[] {
    if (!sortedCache) {
        sortedCache = [...entries].sort((a, b) =>
            (BAND_RANK[a.band] - BAND_RANK[b.band]) || (a.order - b.order) || (a.seq - b.seq));
    }
    return sortedCache;
}

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
function getVersion() { return version; }

export function useOverlaySlot(id: string, band: OverlayBand, order: number): {offset: number; isTop: boolean} {
    useSyncExternalStore(subscribe, getVersion, getVersion);
    useLayoutEffect(() => {
        register(id, band, order);
        return () => unregister(id);
    }, [id, band, order]);

    const list = sorted();
    const i = list.findIndex((e) => e.id === id);
    return {
        offset: (i < 0 ? list.length : i) * STEP,
        isTop: list.length === 0 || list[list.length - 1].id === id,
    };
}

export const OverlayOrderContext = createContext<number | undefined>(undefined);

export function useOverlayOrder(): number | undefined {
    return useContext(OverlayOrderContext);
}
