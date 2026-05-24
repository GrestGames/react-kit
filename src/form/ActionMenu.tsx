import {useState, useRef, KeyboardEvent, CSSProperties, ReactNode} from "react";
import {createPortal} from "react-dom";
import {ToolTipSupported, wrapToolTip} from "../mini/ToolTip";
import {ActionMenuItem, MenuItems} from "../menu/MenuItems";
import "./ActionMenu.css";

export type {ActionMenuItem};

interface ActionMenuProps extends ToolTipSupported {
    items: ActionMenuItem[];
    align?: "left" | "right" | "center";
    position?: "below" | "above";
    /** Trigger content; defaults to the ⋯ glyph. Visual only — the menu owns the
     *  click/keyboard interaction, so don't pass an interactive element. */
    trigger?: ReactNode;
    /** Color of the default trigger. */
    triggerColor?: string;
}

/**
 * Trigger and items are <div role="…"> rather than <button>/<a> so they inherit
 * none of react-kit's global element styling — the menu is styled solely by its
 * own classes and can't be broken by changes to the base button/anchor rules.
 */
export function ActionMenu({items, align = "right", position = "below", trigger = "⋯", triggerColor, title, titleProps}: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [dark, setDark] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    if (items.length === 0) return null;

    const openMenu = () => {
        const el = triggerRef.current;
        if (!el) return;
        setRect(el.getBoundingClientRect());
        setDark(el.closest(".rk-dark") !== null);
        setOpen(true);
    };
    const close = () => { setOpen(false); };

    const onTriggerKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); openMenu(); }
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

    const tipLabel = typeof title === "string" ? title : "Actions";
    const triggerEl = <div ref={triggerRef} className="tv2ActionMenuBtn" role="button" tabIndex={0}
             aria-haspopup="menu" aria-expanded={open} aria-label={tipLabel}
             style={triggerColor ? {color: triggerColor} : undefined}
             onClick={() => open ? close() : openMenu()} onKeyDown={onTriggerKey}>{trigger}</div>;

    return <>
        {wrapToolTip({title: title ?? "Actions", titleProps}, triggerEl)}
        {open && rect && createPortal(
            // data-rk-dropdown-portal marks this as a dropdown surface so a host's
            // outside-click handler can treat clicks here as "inside" — otherwise
            // opening this menu inside another popup collapses both at once.
            <div data-rk-dropdown-portal className={dark ? "rk-dark" : undefined}>
                <div className="tv2ActionMenuBackdrop" onClick={close}/>
                <div className="tv2ActionMenuDropdown" role="menu" style={posStyle}>
                    <MenuItems items={items} onClose={close}/>
                </div>
            </div>, document.body)}
    </>;
}
