import {useState, useRef, useEffect, type ReactNode, KeyboardEvent} from "react";
import {CONFIRM_DOUBLE_WINDOW_MS, DEFAULT_CONFIRM_DOUBLE_TEXT} from "../form/confirmDouble";
import "../form/ActionMenu.css";

export interface ActionMenuItem {
    label: string;
    /** Optional icon rendered to the left of the label. Use an SVG with `stroke="currentColor"` so it inherits danger/warning color. */
    icon?: ReactNode;
    onClick?: () => void | Promise<void>;
    danger?: boolean;
    /** Soft-warning color (orange). No arming on its own — for non-destructive actions that warrant a visual flag. Pair with `confirm` to also require a second click. */
    warning?: boolean;
    /** Require a confirming second click ("Click again to confirm"), like `danger` but without the destructive red — the item keeps its own color. */
    confirm?: boolean;
    /** Non-interactive label / section header. */
    info?: boolean;
    /** A divider line. `label`/`onClick` are ignored. */
    separator?: boolean;
    /** Opens in a new tab on activate. */
    href?: string;
    /** Keep the menu open after an async onClick resolves (sync onClicks still close immediately). */
    keepOpen?: boolean;
    /** Armed-state label for a `danger`/`confirm` item. Default: "Click again to confirm". */
    confirmDoubleText?: string;
}

/**
 * The interactive body of a menu — items, danger/confirm arming, async-pending
 * spinners, keyboard activation. Shared by the click-triggered {@link ActionMenu}
 * and the cursor-anchored ContextMenu so both behave identically. Render it inside
 * a `.tv2ActionMenuDropdown` container; the container owns positioning, this owns
 * behavior. `onClose` fires when an activated item resolves (or on Escape).
 *
 * Items are `<div role="…">` rather than `<button>`/`<a>` so they inherit none of
 * react-kit's global element styling — styled solely by their own classes.
 */
export function MenuItems({items, onClose}: {items: ActionMenuItem[]; onClose: () => void}) {
    const [armedIdx, setArmedIdx] = useState<number | null>(null);
    const [pendingIdxs, setPendingIdxs] = useState<ReadonlySet<number>>(() => new Set());
    const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

    const armDanger = (idx: number) => {
        setArmedIdx(idx);
        if (armTimer.current) clearTimeout(armTimer.current);
        armTimer.current = setTimeout(() => setArmedIdx(prev => (prev === idx ? null : prev)), CONFIRM_DOUBLE_WINDOW_MS);
    };

    const run = async (idx: number, item: ActionMenuItem) => {
        const result = item.onClick?.();
        if (!(result instanceof Promise)) { onClose(); return; }
        setPendingIdxs(prev => { const next = new Set(prev); next.add(idx); return next; });
        try {
            await result;
        } finally {
            setPendingIdxs(prev => { const next = new Set(prev); next.delete(idx); return next; });
            if (!item.keepOpen) onClose();
        }
    };

    const activate = (idx: number, item: ActionMenuItem) => {
        if (pendingIdxs.has(idx)) return;
        if (item.href) { window.open(item.href, "_blank", "noopener,noreferrer"); onClose(); return; }
        if ((item.danger || item.confirm) && armedIdx !== idx) { armDanger(idx); return; }
        run(idx, item);
    };

    const onItemKey = (idx: number, item: ActionMenuItem) => (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(idx, item); }
        else if (e.key === "Escape") { onClose(); }
    };

    return <>
        {items.map((item, i) => {
            if (item.separator) return <div key={i} className="tv2ActionMenuSeparator"/>;
            if (item.info) return <div key={i} className="tv2ActionMenuInfo">{item.label}</div>;
            const armed = armedIdx === i;
            const pending = pendingIdxs.has(i);
            const cls = ["tv2ActionMenuItem",
                item.danger ? "tv2ActionMenuDanger" : "",
                item.warning ? "tv2ActionMenuWarning" : "",
                armed ? "tv2ActionMenuArmed" : "",
                pending ? "tv2ActionMenuPending" : "",
            ].filter(Boolean).join(" ");
            return <div key={i} className={cls} role="menuitem" tabIndex={0}
                        onClick={() => activate(i, item)} onKeyDown={onItemKey(i, item)}>
                <span className="tv2ActionMenuItemLabel">
                    {item.icon && <span className="tv2ActionMenuItemIcon" aria-hidden>{item.icon}</span>}
                    {armed ? (item.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT) : item.label}
                </span>
                {pending && <span className="tv2ActionMenuSpinner" aria-hidden>⟳</span>}
            </div>;
        })}
    </>;
}
