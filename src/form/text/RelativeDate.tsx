import {useState} from "react";
import DatePicker from "react-datepicker";
import {DateUtils} from "../../util/DateUtils";
import {autoUpdate, flip, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions} from "@floating-ui/react";

export function formatRelativeDate(date: string): string {
    const today = DateUtils.dateNow();
    const days = DateUtils.daysBetween(today, date);

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";
    if (days > 1 && days <= 30) return "In " + days + " days";
    if (days < -1 && days >= -30) return Math.abs(days) + " days ago";
    return date;
}

function dateStyle(date: string | null): React.CSSProperties {
    if (!date) return {whiteSpace: "nowrap", color: "var(--rk-text-muted)"};
    const days = DateUtils.daysBetween(DateUtils.dateNow(), date);
    return {
        whiteSpace: "nowrap",
        color: days === 0 ? "var(--rk-accent)" : days < 0 ? "var(--rk-warning)" : "var(--rk-text-muted)",
        fontWeight: days === 0 ? 600 : undefined,
    };
}

export function RelativeDate({date}: { date: string | null }) {
    if (!date) return <span style={{whiteSpace: "nowrap", color: "var(--rk-text-muted)"}}>No date</span>;
    return <span style={dateStyle(date)} title={date}>{formatRelativeDate(date)}</span>;
}

export function ClickableDate({date, onChange}: { date: string | null, onChange: (date: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const selected = date ? new Date(date + "T00:00:00") : undefined;

    const handleChange = (d: Date | null) => {
        const value = d ? DateUtils.date(d) : null;
        if (value === date) { setOpen(false); return; }
        onChange(value);
        setOpen(false);
    };

    const {refs, floatingStyles, context} = useFloating({
        open,
        onOpenChange: setOpen,
        strategy: "fixed",
        placement: "bottom-end",
        middleware: [flip(), shift({padding: 8}), offset(4)],
        whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context);
    const {getFloatingProps} = useInteractions([dismiss]);

    const label = !date
        ? <span style={{whiteSpace: "nowrap", color: "var(--rk-text-muted)"}}>No date</span>
        : <span style={dateStyle(date)} title={date}>{formatRelativeDate(date)}</span>;

    return <>
        <span
            ref={refs.setReference}
            style={{cursor: "pointer"}}
            onDoubleClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
            {label}
        </span>
        {open && <FloatingPortal>
            <span
                ref={refs.setFloating}
                style={{...floatingStyles, zIndex: "var(--rk-z-popover)"}}
                onClick={(e) => e.stopPropagation()}
                {...getFloatingProps()}
            >
                <DatePicker
                    selected={selected}
                    onChange={handleChange}
                    inline
                    dateFormat="yyyy/MM/dd"
                />
            </span>
        </FloatingPortal>}
    </>;
}
