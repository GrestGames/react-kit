import {createContext, useContext, useLayoutEffect, useSyncExternalStore} from "react";

const STEP = 10;

export type OverlayBand = "panel" | "top";
const BAND_RANK: Record<OverlayBand, number> = {panel: 0, top: 1};

export function overlayZ(band: OverlayBand, offset: number): string {
    const base = band === "top" ? "var(--rk-z-overlay)" : "var(--rk-z-modal)";
    return offset === 0 ? base : `calc(${base} + ${offset})`;
}

interface Entry {
    id: string;
    band: OverlayBand;
    order: number;
    seq: number;
    isModal: boolean;
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

function register(id: string, band: OverlayBand, order: number, isModal: boolean) {
    const found = entries.find((e) => e.id === id);
    if (found) {
        if (found.band !== band || found.order !== order || found.isModal !== isModal) {
            found.band = band; found.order = order; found.isModal = isModal; emit();
        }
        return;
    }
    entries.push({id, band, order, seq: seq++, isModal});
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

export function useOverlaySlot(id: string, band: OverlayBand, order: number, isModal = false): {offset: number; isTop: boolean; isTopModal: boolean} {
    useSyncExternalStore(subscribe, getVersion, getVersion);
    useLayoutEffect(() => {
        register(id, band, order, isModal);
        return () => unregister(id);
    }, [id, band, order, isModal]);

    const list = sorted();
    const i = list.findIndex((e) => e.id === id);

    // isTopModal: this is the topmost modal entry (non-modal overlays like Popover don't count)
    let isTopModal = false;
    for (let j = list.length - 1; j >= 0; j--) {
        if (list[j].isModal) { isTopModal = list[j].id === id; break; }
    }

    return {
        offset: (i < 0 ? list.length : i) * STEP,
        isTop: list.length === 0 || list[list.length - 1].id === id,
        isTopModal,
    };
}

export const OverlayOrderContext = createContext<number | undefined>(undefined);

export function useOverlayOrder(): number | undefined {
    return useContext(OverlayOrderContext);
}
