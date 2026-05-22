import {useState, useRef, useEffect, KeyboardEvent, CSSProperties, ReactNode} from "react";
import {createPortal} from "react-dom";
import {CONFIRM_DOUBLE_WINDOW_MS, DEFAULT_CONFIRM_DOUBLE_TEXT} from "./confirmDouble";
import "./ActionMenu.css";

export interface ActionMenuItem {
    label: string;
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

interface ActionMenuProps {
    items: ActionMenuItem[];
    align?: "left" | "right" | "center";
    position?: "below" | "above";
    /** Trigger content; defaults to the ⋯ glyph. Visual only — the menu owns the
     *  click/keyboard interaction, so don't pass an interactive element. */
    trigger?: ReactNode;
    /** Color of the default trigger. */
    triggerColor?: string;
    /** title attr on the trigger. */
    title?: string;
}

/**
 * Trigger and items are <div role="…"> rather than <button>/<a> so they inherit
 * none of react-kit's global element styling — the menu is styled solely by its
 * own classes and can't be broken by changes to the base button/anchor rules.
 */
export function ActionMenu({items, align = "right", position = "below", trigger = "⋯", triggerColor, title = "Actions"}: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [dark, setDark] = useState(false);
    const [armedIdx, setArmedIdx] = useState<number | null>(null);
    const [pendingIdxs, setPendingIdxs] = useState<ReadonlySet<number>>(() => new Set());
    const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

    if (items.length === 0) return null;

    const openMenu = () => {
        const el = triggerRef.current;
        if (!el) return;
        setRect(el.getBoundingClientRect());
        setDark(el.closest(".rk-dark") !== null);
        setArmedIdx(null);
        setOpen(true);
    };
    const close = () => { setOpen(false); setArmedIdx(null); };

    const armDanger = (idx: number) => {
        setArmedIdx(idx);
        if (armTimer.current) clearTimeout(armTimer.current);
        armTimer.current = setTimeout(() => setArmedIdx(prev => (prev === idx ? null : prev)), CONFIRM_DOUBLE_WINDOW_MS);
    };

    const run = async (idx: number, item: ActionMenuItem) => {
        const result = item.onClick?.();
        if (!(result instanceof Promise)) { close(); return; }
        setPendingIdxs(prev => { const next = new Set(prev); next.add(idx); return next; });
        try {
            await result;
        } finally {
            setPendingIdxs(prev => { const next = new Set(prev); next.delete(idx); return next; });
            if (!item.keepOpen) close();
        }
    };

    const activate = (idx: number, item: ActionMenuItem) => {
        if (pendingIdxs.has(idx)) return;
        if (item.href) { window.open(item.href, "_blank", "noopener,noreferrer"); close(); return; }
        if ((item.danger || item.confirm) && armedIdx !== idx) { armDanger(idx); return; }
        run(idx, item);
    };

    const onTriggerKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); openMenu(); }
        else if (e.key === "Escape") { close(); }
    };
    const onItemKey = (idx: number, item: ActionMenuItem) => (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(idx, item); }
        else if (e.key === "Escape") { close(); }
    };

    const posStyle: CSSProperties = rect ? {
        ...(position === "above"
            ? {bottom: window.innerHeight - rect.top + 4}
            : {top: rect.bottom + 4}),
        ...(align === "right" ? {right: window.innerWidth - rect.right}
            : align === "center" ? {left: rect.left + rect.width / 2, transform: "translateX(-50%)"}
            : {left: rect.left}),
    } : {};

    return <>
        <div ref={triggerRef} className="tv2ActionMenuBtn" role="button" tabIndex={0}
             aria-haspopup="menu" aria-expanded={open} title={title}
             style={triggerColor ? {color: triggerColor} : undefined}
             onClick={() => open ? close() : openMenu()} onKeyDown={onTriggerKey}>{trigger}</div>
        {open && rect && createPortal(
            // data-rk-dropdown-portal marks this as a dropdown surface so a host's
            // outside-click handler can treat clicks here as "inside" — otherwise
            // opening this menu inside another popup collapses both at once.
            <div data-rk-dropdown-portal className={dark ? "rk-dark" : undefined}>
                <div className="tv2ActionMenuBackdrop" onClick={close}/>
                <div className="tv2ActionMenuDropdown" role="menu" style={posStyle}>
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
                            <span>{armed ? (item.confirmDoubleText ?? DEFAULT_CONFIRM_DOUBLE_TEXT) : item.label}</span>
                            {pending && <span className="tv2ActionMenuSpinner" aria-hidden>⟳</span>}
                        </div>;
                    })}
                </div>
            </div>, document.body)}
    </>;
}
