import {useState, useRef, useEffect} from "react";
import DatePicker from "react-datepicker";
import {DateUtils} from "../../util/DateUtils";

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
    if (!date) return {whiteSpace: "nowrap", color: "#bbb"};
    const days = DateUtils.daysBetween(DateUtils.dateNow(), date);
    return {
        whiteSpace: "nowrap",
        color: days === 0 ? "#0d6efd" : days < 0 ? "#e67e22" : "#888",
        fontWeight: days === 0 ? 600 : undefined,
    };
}

export function RelativeDate({date}: { date: string | null }) {
    if (!date) return <span style={{whiteSpace: "nowrap", color: "#bbb"}}>No date</span>;
    return <span style={dateStyle(date)} title={date}>{formatRelativeDate(date)}</span>;
}

export function ClickableDate({date, onChange}: { date: string | null, onChange: (date: string | null) => void }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    const selected = date ? new Date(date + "T00:00:00") : undefined;

    const handleChange = (d: Date | null) => {
        const value = d ? DateUtils.date(d) : null;
        if (value === date) { setOpen(false); return; }
        onChange(value);
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return () => {};
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const label = !date ? <span style={{whiteSpace: "nowrap", color: "#bbb"}}>No date</span>
        : <span style={dateStyle(date)} title={date}>{formatRelativeDate(date)}</span>;

    return <span ref={wrapperRef} style={{position: "relative", cursor: "pointer"}} onDoubleClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {label}
        {open && <span style={{position: "absolute", right: 0, top: "100%", zIndex: 20}} onClick={(e) => e.stopPropagation()}>
            <DatePicker
                selected={selected}
                onChange={handleChange}
                inline
                dateFormat="yyyy/MM/dd"
            />
        </span>}
    </span>;
}
