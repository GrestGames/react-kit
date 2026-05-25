import {ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState} from "react";

/** Gap between stacked overlays. Leaves room for an overlay's own sub-layers
 *  (e.g. PopupPanel's close-guard scrim + confirm dialog at offset+1 / +2)
 *  without colliding with the next panel. */
const STEP = 10;

/** z-index for a stacked overlay at `offset`, anchored to the `--rk-z-modal` token so the
 *  whole stack sits in the modal band. */
export function overlayZ(offset: number): string {
    if (offset === 0) return "var(--rk-z-modal)";
    return offset > 0
        ? `calc(var(--rk-z-modal) + ${offset})`
        : `calc(var(--rk-z-modal) - ${-offset})`;
}

interface Entry {
    id: string;
    order: number;
    seq: number;
}

interface OverlayStackValue {
    register: (id: string, order: number) => void;
    unregister: (id: string) => void;
    /** Per-overlay z offset; the overlay paints at `overlayZ(offsetOf(id))`. */
    offsetOf: (id: string) => number;
    /** Whether this overlay is the topmost — only the top one renders the shared backdrop. */
    isTop: (id: string) => boolean;
}

const OverlayStackContext = createContext<OverlayStackValue | undefined>(undefined);

/** Coordinates stacked modal overlays so they paint in a single, ordered band.
 *
 *  Overlays register with an `order` (PopupPanel derives it from the router's URL order, so
 *  the URL is the source of truth for stacking — including reopen-raises). The stack assigns
 *  each a z-index by sorted position; the topmost renders the lone shared backdrop, which
 *  kills the cumulative dimming of per-panel scrims. With no provider above, overlays fall
 *  back to their own legacy behavior. */
export function OverlayStackProvider({children}: {children: ReactNode}) {
    const [entries, setEntries] = useState<Entry[]>([]);
    const seq = useRef(0);

    const register = useCallback((id: string, order: number) => {
        setEntries((prev) => {
            const found = prev.find((e) => e.id === id);
            if (found) return found.order === order ? prev : prev.map((e) => (e.id === id ? {...e, order} : e));
            return [...prev, {id, order, seq: seq.current++}];
        });
    }, []);

    const unregister = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const value = useMemo<OverlayStackValue>(() => {
        // Sort by router order, then registration order as a stable tiebreak.
        const sorted = [...entries].sort((a, b) => a.order - b.order || a.seq - b.seq);
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

/** Explicit stacking order for an overlay, supplied by an outer layer — the router's
 *  `RouterOutlet` provides each routed view its position, so URL order drives the stack
 *  (and reopening an open panel raises it) without the overlay knowing about routing.
 *  Absent → the stack falls back to registration order. */
export const OverlayOrderContext = createContext<number | undefined>(undefined);

export function useOverlayOrder(): number | undefined {
    return useContext(OverlayOrderContext);
}
