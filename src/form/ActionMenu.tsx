import {useState, useRef} from "react";
import {useOutsideClick} from "../helpers/useOutsideClick";

export interface ActionMenuItem {
    label: string;
    onClick?: () => void;
    danger?: boolean;
    href?: string;
}

export function ActionMenu({items}: { items: ActionMenuItem[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick([ref], () => setOpen(false), {active: open});

    if (items.length === 0) return null;

    return <div ref={ref} className="tv2ActionMenu">
        <button className="tv2ActionMenuBtn" onClick={() => setOpen(!open)} title="Actions">{"\u22EF"}</button>
        {open && <div className="tv2ActionMenuDropdown">
            {items.map((item, i) => <a key={i}
                className={item.danger ? "tv2ActionMenuDanger" : undefined}
                href={item.href}
                target={item.href ? "_blank" : undefined}
                rel={item.href ? "noopener noreferrer" : undefined}
                onClick={e => { if (!item.href) e.preventDefault(); setOpen(false); item.onClick?.(); }}>
                {item.label}
            </a>)}
        </div>}
    </div>;
}
