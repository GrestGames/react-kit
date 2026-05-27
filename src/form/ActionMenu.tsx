import {useState, KeyboardEvent, ReactNode} from "react";
import {createPortal} from "react-dom";
import {autoUpdate, flip, offset, type Placement, shift, size, useFloating} from "@floating-ui/react";
import {ToolTipSupported, wrapToolTip} from "../mini/ToolTip";
import {overOffset, type OverlayPlacement} from "../mini/overlayPlacement";
import {ActionMenuItem, MenuItems} from "../menu/MenuItems";
import "./ActionMenu.css";

export type {ActionMenuItem};

interface ActionMenuProps extends ToolTipSupported {
    items: ActionMenuItem[];
    /** Menu placement relative to the trigger: a Floating UI placement, or "over"
     *  to center on it. Default "bottom-end". */
    placement?: OverlayPlacement;
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
 *
 * Positioned with @floating-ui (same lib as ToolTip/ContextMenu): `placement`
 * picks the preferred side+alignment, then flip up / shift in / cap height + scroll
 * keep it on-screen when the preferred side has no room.
 */
export function ActionMenu({items, placement = "bottom-end", trigger = "⋯", triggerColor, title, titleProps}: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(false);

    const over = placement === "over";
    const fuiPlacement: Placement = placement === "over" ? "bottom" : placement;

    const {refs, floatingStyles, placement: finalPlacement} = useFloating({
        open,
        onOpenChange: setOpen,
        strategy: "fixed",
        placement: fuiPlacement,
        middleware: [
            over ? overOffset() : offset(4),
            ...(over ? [] : [flip({padding: 8})]),
            shift({padding: 8}),
            size({padding: 8, apply({availableHeight, elements}) {
                elements.floating.style.maxHeight = `${availableHeight}px`;
                elements.floating.style.overflowY = "auto";
            }}),
        ],
        whileElementsMounted: autoUpdate,
    });

    if (items.length === 0) return null;

    const openMenu = () => {
        setDark(refs.domReference.current?.closest(".rk-dark") != null);
        setOpen(true);
    };
    const close = () => { setOpen(false); };

    const onTriggerKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); openMenu(); }
        else if (e.key === "Escape") { close(); }
    };

    const tipLabel = typeof title === "string" ? title : "Actions";
    const triggerEl = <div ref={refs.setReference} className="tv2ActionMenuBtn" role="button" tabIndex={0}
             aria-haspopup="menu" aria-expanded={open} aria-label={tipLabel}
             style={triggerColor ? {color: triggerColor} : undefined}
             onClick={() => open ? close() : openMenu()} onKeyDown={onTriggerKey}>{trigger}</div>;

    return <>
        {wrapToolTip({title: title ?? "Actions", titleProps}, triggerEl)}
        {open && createPortal(
            // data-rk-dropdown-portal marks this as a dropdown surface so a host's
            // outside-click handler can treat clicks here as "inside" — otherwise
            // opening this menu inside another popup collapses both at once.
            <div data-rk-dropdown-portal className={dark ? "rk-dark" : undefined}>
                <div className="tv2ActionMenuBackdrop" onClick={close}/>
                <div ref={refs.setFloating} className="tv2ActionMenuDropdown" role="menu"
                     data-placement={finalPlacement} style={floatingStyles}>
                    <MenuItems items={items} onClose={close}/>
                </div>
            </div>, document.body)}
    </>;
}
