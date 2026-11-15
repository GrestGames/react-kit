import {Children, ReactNode} from "react";
import {GridField, GridOrderBy} from "./Grid";
import "./GridCards.css";

/* ── Sort bar ────────────────────────────────────────── */

interface MobileSortBarProps<T> {
    fields: GridField<T>[];
    orderBy: GridOrderBy | undefined;
    onSort: (field: string, dir: "asc" | "desc") => void;
    /** Header-cell actions (e.g. an add button in a column title) that have no column on a card. */
    children?: ReactNode;
}

export function MobileSortBar<T>({fields, orderBy, onSort, children}: MobileSortBarProps<T>) {
    const sortable = fields.filter(f => f.sortName);
    const hasActions = Children.toArray(children).length > 0;
    if (sortable.length === 0 && !hasActions) return null;

    return <div className="gridMobileSort">
        {sortable.length > 0 && <select
            className="rkSelect"
            value={orderBy?.field || ""}
            onChange={(e) => {
                const field = e.target.value;
                if (field) {
                    const f = sortable.find(s => s.sortName === field);
                    onSort(field, f?.sortDir || "asc");
                }
            }}
        >
            <option value="">Sort by…</option>
            {sortable.map(f => {
                const label = typeof f.title === "string" ? f.title : String(f.sortName);
                return <option key={String(f.sortName)} value={String(f.sortName)}>{label}</option>;
            })}
        </select>}
        {orderBy?.field && <button
            type="button"
            className="gridMobileSortDir"
            onClick={() => onSort(orderBy.field!, orderBy.dir === "asc" ? "desc" : "asc")}
        >
            {orderBy.dir === "asc" ? "↑" : "↓"}
        </button>}
        {hasActions && <div className="gridMobileActions">{children}</div>}
    </div>;
}
