import {GridField, GridOrderBy} from "./Grid";
import "./GridCards.css";

/* ── Sort bar ────────────────────────────────────────── */

interface MobileSortBarProps<T> {
    fields: GridField<T>[];
    orderBy: GridOrderBy | undefined;
    onSort: (field: string, dir: "asc" | "desc") => void;
}

export function MobileSortBar<T>({fields, orderBy, onSort}: MobileSortBarProps<T>) {
    const sortable = fields.filter(f => f.sortName);
    if (sortable.length === 0) return null;

    return <div className="gridMobileSort">
        <select
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
        </select>
        {orderBy?.field && <button
            type="button"
            className="gridMobileSortDir"
            onClick={() => onSort(orderBy.field!, orderBy.dir === "asc" ? "desc" : "asc")}
        >
            {orderBy.dir === "asc" ? "↑" : "↓"}
        </button>}
    </div>;
}
