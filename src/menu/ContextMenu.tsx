import {ReactNode, useLayoutEffect, useState, useSyncExternalStore, type MouseEvent as ReactMouseEvent} from "react";
import {autoUpdate, flip, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions} from "@floating-ui/react";
import {ActionMenuItem, MenuItems} from "./MenuItems";
import "../form/ActionMenu.css";

export type {ActionMenuItem};

/** Floating menu anchored at a viewport point. Shared by {@link ContextMenu} and
 *  the imperative {@link RkContextMenu}. Positions with @floating-ui (same lib as
 *  ToolTip): top-left at the point, flips up / shifts in when near a viewport edge.
 *  Dismisses on outside-press, Escape, or scroll. */
function ContextMenuSurface({x, y, items, onClose}: {x: number; y: number; items: ActionMenuItem[]; onClose: () => void}) {
    const {refs, floatingStyles, context} = useFloating({
        open: true,
        onOpenChange: o => { if (!o) onClose(); },
        strategy: "fixed",
        placement: "bottom-start",
        middleware: [offset(2), flip({padding: 8}), shift({padding: 8})],
        whileElementsMounted: autoUpdate,
    });
    const dismiss = useDismiss(context, {outsidePress: true, escapeKey: true, ancestorScroll: true});
    const {getFloatingProps} = useInteractions([dismiss]);

    useLayoutEffect(() => {
        refs.setPositionReference({
            getBoundingClientRect: () => ({width: 0, height: 0, x, y, top: y, left: x, right: x, bottom: y, toJSON: () => ({})}) as DOMRect,
        });
    }, [x, y, refs]);

    if (items.length === 0) return null;

    return <FloatingPortal>
        {/* data-rk-dropdown-portal: lets a host's outside-click handler (e.g. Popover)
            treat clicks here as "inside", so opening this inside a popup won't close it. */}
        <div ref={refs.setFloating} data-rk-dropdown-portal role="menu"
             className="tv2ActionMenuDropdown" style={{...floatingStyles, zIndex: "var(--rk-z-overlay)"}} {...getFloatingProps()}>
            <MenuItems items={items} onClose={onClose}/>
        </div>
    </FloatingPortal>;
}

interface ContextMenuState {x: number; y: number; items: ActionMenuItem[]}

let current: ContextMenuState | null = null;
const listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

/** Imperative right-click menu, mirroring `RkToast`. Call from an `onContextMenu`
 *  handler; rendered by {@link RkOverlayHost}. */
export const RkContextMenu = {
    open(e: ReactMouseEvent | {clientX: number; clientY: number; preventDefault?: () => void}, items: ActionMenuItem[]) {
        e.preventDefault?.();
        current = {x: e.clientX, y: e.clientY, items};
        emit();
    },
    close() { current = null; emit(); },
};

function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }
function snapshot() { return current; }

/** Renders the active imperative context menu. Mounted once via `RkOverlayHost`. */
export function RkContextMenuHost() {
    const state = useSyncExternalStore(subscribe, snapshot, snapshot);
    if (!state) return null;
    return <ContextMenuSurface key={`${state.x},${state.y}`} x={state.x} y={state.y} items={state.items} onClose={() => RkContextMenu.close()}/>;
}

export interface ContextMenuProps {
    items: ActionMenuItem[];
    children: ReactNode;
    disabled?: boolean;
}

/** Declarative right-click menu: wrap any content, pass `items`. The wrapper is
 *  layout-neutral (`display: contents`), so it doesn't disturb grid/flex parents. */
export function ContextMenu({items, children, disabled}: ContextMenuProps) {
    const [point, setPoint] = useState<{x: number; y: number} | null>(null);

    const onContextMenu = (e: ReactMouseEvent) => {
        if (disabled || items.length === 0) return;
        e.preventDefault();
        setPoint({x: e.clientX, y: e.clientY});
    };

    return <span style={{display: "contents"}} onContextMenu={onContextMenu}>
        {children}
        {point && <ContextMenuSurface x={point.x} y={point.y} items={items} onClose={() => setPoint(null)}/>}
    </span>;
}
