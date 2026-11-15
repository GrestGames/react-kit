import {Fragment, KeyboardEvent, MouseEvent, ReactNode, useId} from "react";
import type {GridField, GridOrderBy} from "./Grid";
import {Button} from "../buttons/Button";
import {ButtonAppearanceContext} from "../buttons/buttonAppearance";
import "./GridList.css";

/** Where a field goes in the list layout. Untagged fields with a title are `label value` detail lines. */
export type GridListSlot = "title" | "subtitle" | "trailing" | "actions" | "hide";
type Slot = GridListSlot | "detail";

export const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

const listSlot = (f: GridField<any>): Slot => f.list ?? (isEmpty(f.title) ? "actions" : "detail");

/** A control as an `actions` or `hide` column's title (an `AddNewButton`), shown in the list toolbar instead. */
const headerAction = (f: GridField<any>): ReactNode => {
    const slot = listSlot(f);
    return (slot === "actions" || slot === "hide") && !isEmpty(f.title) && typeof f.title !== "string" ? f.title : undefined;
};

const CONTROLS = "a, button, input, select, textarea, label, summary, [tabindex], [role=button], [role=link], [role=checkbox], [role=switch], [role=menuitem]";

/** Click and Enter/Space handlers for a clickable row. Clicks on the row's own controls, and a drag that
 *  selected its text, are left alone; the row itself may carry a tabindex. */
export const rowHandlers = <T,>(onRowClick: (row: T) => void, row: T) => ({
    onClick: (e: MouseEvent<HTMLElement>) => {
        const row$ = e.currentTarget, target = e.target as Element;
        const control = target.closest(CONTROLS);
        const selection = window.getSelection();
        // Portalled popups bubble through the React tree, so the target can be outside the row.
        if (!row$.contains(target) || (control && control !== row$ && row$.contains(control))) return;
        if (selection && !selection.isCollapsed && row$.contains(selection.anchorNode)) return;
        onRowClick(row);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onRowClick(row);
        }
    },
});

export function GridListToolbar<T>({fields, orderBy, onSort, filters}: {
    fields: GridField<T>[]
    orderBy: GridOrderBy | undefined
    onSort: (field: string, dir: "asc" | "desc") => void
    filters?: { open: boolean, active: boolean, toggle: () => void }
}) {
    const actions = fields.map(headerAction).filter(a => a !== undefined);
    if (!filters && actions.length === 0 && !fields.some(f => f.sortName)) return null;
    return <ButtonAppearanceContext.Provider value="outline">
        <div className="gridListToolbar">
            {filters && <Button active={filters.open} onClick={filters.toggle}>
                Filters{filters.active && <span className="gridListBadge"><span className="gridListSrOnly"> (active)</span></span>}
            </Button>}
            <GridListSort fields={fields} orderBy={orderBy} onSort={onSort}/>
            {actions.length > 0 && <div className="gridListToolbarActions">{actions.map((a, s) => <Fragment key={s}>{a}</Fragment>)}</div>}
        </div>
    </ButtonAppearanceContext.Provider>;
}

export function GridListRows<T extends { id: string | number }>({fields, rows, cell, onRowClick, card}: {
    fields: GridField<T>[]
    rows: T[]
    cell: (f: GridField<T>, row: T, i: number) => ReactNode
    onRowClick?: (row: T) => void
    card?: (row: T, i: number) => ReactNode
}) {
    const id = useId();
    const bySlot = (slot: Slot) => fields.filter(f => listSlot(f) === slot);
    const slots = {title: bySlot("title"), subtitle: bySlot("subtitle"), detail: bySlot("detail"), trailing: bySlot("trailing"), actions: bySlot("actions")};
    const labels = slots.detail.flatMap(f => typeof f.title === "string" ? [f.title.length] : []);
    const labelWidth = labels.length ? Math.min(14, Math.max(5, ...labels)) + 1 + "ch" : undefined;
    const hit = (row: T, labelledBy: string | undefined) => onRowClick &&
        <button type="button" className="gridListHit" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : "Open"} onClick={() => onRowClick(row)}/>;
    return <ul className="gridList" role="list" style={{"--grid-list-label": labelWidth} as React.CSSProperties}>
        {rows.map((row, i) => {
            const clickable = onRowClick ? " gridListClickable" : "";
            const onClick = onRowClick && rowHandlers(onRowClick, row).onClick;
            if (card) return <li key={row.id ?? i} className={"gridListRow" + clickable} onClick={onClick}>
                {hit(row, `${id}-${i}-c`)}
                <div id={`${id}-${i}-c`}>{card(row, i)}</div>
            </li>;
            const values = (slot: keyof typeof slots) => slots[slot].map(f => ({f, v: cell(f, row, i)})).filter(({v}) => !isEmpty(v));
            const titles = values("title"), subtitles = values("subtitle"), details = values("detail"), trailing = values("trailing"), actions = values("actions");
            const headId = `${id}-${i}-h`, detailsId = `${id}-${i}-d`;
            return <li key={row.id ?? i} className={"gridListRow gridListFields" + clickable} onClick={onClick}>
                {hit(row, titles.length || subtitles.length ? headId : details.length ? detailsId : undefined)}
                <div className="gridListHead" id={headId}>
                    {titles.length > 0 && <div className="gridListTitle">{titles.map(({v}, s) => <Fragment key={s}>{s > 0 && " "}{v}</Fragment>)}</div>}
                    {subtitles.length > 0 && <div className="gridListSubtitle">{subtitles.map(({v}, s) => <Fragment key={s}>{s > 0 && " · "}{v}</Fragment>)}</div>}
                </div>
                {trailing.length > 0 && <div className="gridListTrailing">{trailing.map(({v}, s) => <div key={s}>{v}</div>)}</div>}
                {details.length > 0 && <div className="gridListDetails" id={detailsId}>{details.map(({f, v}, s) => <Fragment key={s}>
                    <span className="gridListLabel">{f.title}</span><span className="gridListValue">{v}</span>
                </Fragment>)}</div>}
                {actions.length > 0 ? <div className="gridListActions">{actions.map(({v}, s) => <Fragment key={s}>{v}</Fragment>)}</div>
                    : onRowClick && <span className="gridListChevron" aria-hidden="true">›</span>}
            </li>;
        })}
    </ul>;
}

function GridListSort<T>({fields, orderBy, onSort}: {
    fields: GridField<T>[]
    orderBy: GridOrderBy | undefined
    onSort: (field: string, dir: "asc" | "desc") => void
}) {
    const options = fields.filter(f => f.sortName).flatMap(f => {
        const label = typeof f.title === "string" && f.title ? f.title : String(f.sortName);
        const dirs: ("asc" | "desc")[] = f.sortOnlyOneWay ? [f.sortDir || "asc"] : f.sortDir === "desc" ? ["desc", "asc"] : ["asc", "desc"];
        return dirs.map(dir => ({value: `${String(f.sortName)}:${dir}`, label: `${label} ${dir === "asc" ? "↓" : "↑"}`}));
    });
    if (options.length === 0) return null;
    const current = orderBy?.field ? `${orderBy.field}:${orderBy.dir || "asc"}` : "";
    const known = options.some(o => o.value === current);
    return <label className="gridListSort">
        <span aria-hidden="true">⇅</span>
        <select aria-label="Sort by" value={known ? current : ""} onChange={(e) => {
            const [field, dir] = e.target.value.split(":");
            if (field) onSort(field, dir as "asc" | "desc");
        }}>
            {!known && <option value="">Sort</option>}
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </label>;
}
