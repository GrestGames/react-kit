import {ReactNode, useLayoutEffect, useRef, useState, useSyncExternalStore, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent} from "react";
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
    /** Also open on a plain left-click / tap, not just right-click. Opt in only when
     *  the wrapped element has no competing click action of its own — otherwise the
     *  two fight. (Touch always gets long-press regardless of this flag.) */
    openOnClick?: boolean;
}

const LONG_PRESS_MS = 450;

/** Declarative context menu: wrap any content, pass `items`. Opens on right-click;
 *  on touch a long-press opens it too (no right-click there). Pass `openOnClick` to
 *  also open on a plain tap/click. The wrapper is layout-neutral (`display: contents`),
 *  so it doesn't disturb grid/flex parents. */
export function ContextMenu({items, children, disabled, openOnClick}: ContextMenuProps) {
    const [point, setPoint] = useState<{x: number; y: number} | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // A fired long-press must swallow the click the browser synthesizes on touchend,
    // or the wrapped element's own onClick (e.g. "open terminal") runs right after the menu opens.
    const didLongPress = useRef(false);

    const open = (x: number, y: number) => {
        if (disabled || items.length === 0) return;
        setPoint({x, y});
    };

    const onContextMenu = (e: ReactMouseEvent) => {
        if (disabled || items.length === 0) return;
        e.preventDefault();
        open(e.clientX, e.clientY);
    };

    const onClick = openOnClick ? (e: ReactMouseEvent) => {
        if (disabled || items.length === 0) return;
        // The menu surface is a React child of this wrapper, so clicks on its items
        // bubble here through the React tree (portals bubble by tree, not DOM) — ignore
        // them, or activating an item would instantly reopen the menu.
        if ((e.target as Element | null)?.closest?.("[data-rk-dropdown-portal]")) return;
        e.preventDefault();
        open(e.clientX, e.clientY);
    } : undefined;

    const clearLongPress = () => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    };
    const onTouchStart = (e: ReactTouchEvent) => {
        if (disabled || items.length === 0) return;
        didLongPress.current = false;
        const {clientX, clientY} = e.touches[0]!;
        clearLongPress();
        longPressTimer.current = setTimeout(() => {
            longPressTimer.current = null;
            didLongPress.current = true;
            open(clientX, clientY);
        }, LONG_PRESS_MS);
    };
    const onTouchEnd = (e: ReactTouchEvent) => {
        clearLongPress();
        if (didLongPress.current) e.preventDefault();
    };

    return <span style={{display: "contents"}}
        onContextMenu={onContextMenu}
        onClick={onClick}
        onTouchStart={onTouchStart}
        onTouchMove={clearLongPress}
        onTouchEnd={onTouchEnd}
        onTouchCancel={clearLongPress}
    >
        {children}
        {point && <ContextMenuSurface x={point.x} y={point.y} items={items} onClose={() => setPoint(null)}/>}
    </span>;
}
