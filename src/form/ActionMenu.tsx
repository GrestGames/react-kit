import {useState, useRef, useEffect, MouseEvent, CSSProperties} from "react";
import {createPortal} from "react-dom";
import "./ActionMenu.css";

export interface ActionMenuItem {
    label: string;
    onClick?: () => void | Promise<void>;
    danger?: boolean;
    /** Soft-warning color (orange). No arming — for non-destructive actions that warrant a visual flag. */
    warning?: boolean;
    /** Non-interactive label / section header. */
    info?: boolean;
    /** A divider line. `label`/`onClick` are ignored. */
    separator?: boolean;
    href?: string;
    /** Keep the menu open after an async onClick resolves (sync onClicks still close immediately). */
    keepOpen?: boolean;
}

const DANGER_CONFIRM_WINDOW_MS = 2000;

export function ActionMenu({items, align = "right"}: { items: ActionMenuItem[]; align?: "left" | "right" }) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [dark, setDark] = useState(false);
    const [armedIdx, setArmedIdx] = useState<number | null>(null);
    const [pendingIdxs, setPendingIdxs] = useState<ReadonlySet<number>>(() => new Set());
    const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current); }, []);

    if (items.length === 0) return null;

    const openMenu = () => {
        const el = btnRef.current;
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
        armTimer.current = setTimeout(() => setArmedIdx(prev => (prev === idx ? null : prev)), DANGER_CONFIRM_WINDOW_MS);
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

    const handleClick = (idx: number, item: ActionMenuItem) => (e: MouseEvent) => {
        e.preventDefault();
        if (pendingIdxs.has(idx)) return;
        if (item.danger && armedIdx !== idx) { armDanger(idx); return; }
        run(idx, item);
    };

    const posStyle: CSSProperties = rect ? {
        position: "fixed",
        top: rect.bottom + 4,
        ...(align === "right" ? {right: window.innerWidth - rect.right} : {left: rect.left}),
    } : {};

    return <>
        <button ref={btnRef} className="tv2ActionMenuBtn" onClick={() => open ? close() : openMenu()} title="Actions">{"⋯"}</button>
        {open && rect && createPortal(
            <div className={dark ? "rk-dark" : undefined}>
                <div className="tv2ActionMenuBackdrop" onClick={close}/>
                <div className="tv2ActionMenuDropdown" style={posStyle}>
                    {items.map((item, i) => {
                        if (item.separator) return <div key={i} className="tv2ActionMenuSeparator"/>;
                        if (item.info) return <div key={i} className="tv2ActionMenuInfo">{item.label}</div>;
                        const armed = armedIdx === i;
                        const pending = pendingIdxs.has(i);
                        const cls = [
                            item.danger ? "tv2ActionMenuDanger" : "",
                            item.warning ? "tv2ActionMenuWarning" : "",
                            armed ? "tv2ActionMenuArmed" : "",
                            pending ? "tv2ActionMenuPending" : "",
                        ].filter(Boolean).join(" ") || undefined;
                        if (item.href) {
                            return <a key={i} className={cls} href={item.href} target="_blank" rel="noopener noreferrer" onClick={close}>
                                <span>{item.label}</span>
                            </a>;
                        }
                        return <a key={i} className={cls} onClick={handleClick(i, item)}>
                            <span>{armed ? "Click again to confirm" : item.label}</span>
                            {pending && <span className="tv2ActionMenuSpinner" aria-hidden>⟳</span>}
                        </a>;
                    })}
                </div>
            </div>, document.body)}
    </>;
}
