import {CSSProperties, ReactNode, useEffect, useRef, useState} from "react";
import "../css/grid.css"
import {Tracker, TrackerOperation} from "../../EntityTracker";
import {ApiErrors} from "../../ApiError";
import {TipBox} from "../other/TipBox";
import {AsyncState, useAsyncState} from "../../helpers/useAsyncState";
import {FormObject, useAsyncForm} from "../useAsyncForm";
import {VALIDATION_ERROR} from "@grest-ts/schema";
import {Form} from "../Form";
import {useIsMobile} from "../../responsive/useResponsive";
import {MobileSortBar} from "./GridCards";
import {ButtonAppearanceContext} from "../buttons/buttonAppearance";

type FilterState<Q> = Q & GridQuery;

export interface Props<T extends { id: string | number }, Q> {
    fields: GridField<T>[]
    /** Grid injects `limit`/`orderBy`, and `id` when a tracker asks for one row
     *  back — honour `input.id` or `tracker.update(id)` patches the wrong row.
     *  Return `nextCursor` to page by token instead of offset: Grid sends it back as
     *  `input.cursor` on the next page and treats its absence as the end of the list. */
    load: (input: Q & GridQuery) => Promise<{ rows: T[], nextCursor?: string }>

    onData?: (rows: T[]) => void,

    defaultOrderBy?: GridOrderBy;
    defaultFilters?: Partial<Q>;
    filtersForm?: (F: FormObject<Q>) => ReactNode | ReactNode[]
    summaryForm?: () => ReactNode | ReactNode[]
    tracker?: Tracker<T["id"]>
    rowsPerCall?: number;
    filtersUrlKeyName?: string;
    hideFooter?: boolean;
    /** Compact headers: allows text wrapping and puts sort arrows on a separate line. */
    compact?: boolean;

    /** Custom mobile card renderer. When provided, replaces the auto-generated card layout. */
    mobileCard?: (row: T, index: number) => ReactNode;

    /** Alternative blocks/card view renderer. When provided and viewMode is "blocks", renders this instead of the table. */
    blocksView?: (rows: T[]) => ReactNode;
    /** Controls which view to render: "grid" (table) or "blocks" (blocksView). Defaults to "grid". */
    viewMode?: "grid" | "blocks";

    /** When this value changes, the grid resets and reloads. Useful for e.g. company/tenant switching. */
    reloadKey?: any;
}

export interface GridQuery {
    id?: any;
    orderBy?: GridOrderBy
    limit?: [number, number]
    /** Token from the previous load's `nextCursor`. Only set on a load-more call; a first
     *  page never carries one, so `limit[0]` can be ignored when paging by cursor. */
    cursor?: string
}

export interface GridOrderBy {
    field?: string,
    dir?: "asc" | "desc"
}

export interface GridField<T> {
    sortName?: keyof T;
    sortDir?: "asc" | "desc"
    sortOnlyOneWay?: boolean
    width?: number;
    rowSpan?: "sameId" | keyof T | ((row: T, no: number, data: T[]) => number)
    title?: string | ReactNode | ReactNode[];
    value: keyof T | ((row: T, no: number, data: T[]) => string | ReactNode | ReactNode[]);
    align?: "left" | "center" | "right";
    wrap?: boolean,
    style?: CSSProperties
    /** @deprecated Use mobileCard prop on Grid instead. Kept for backwards compatibility. */
    mobile?: string;
    /** @deprecated Use mobileCard prop on Grid instead. Kept for backwards compatibility. */
    mobileOrder?: number;
}

export function Grid<T extends { id: string | number }, Q>({
                                                                           load,
                                                                           filtersForm,
                                                                           summaryForm,
                                                                           onData,
                                                                           filtersUrlKeyName,
                                                                           fields,
                                                                           defaultFilters,
                                                                           defaultOrderBy,
                                                                           rowsPerCall,
                                                                           tracker,
                                                                           hideFooter,
                                                                           compact,
                                                                           mobileCard,
                                                                           blocksView,
                                                                           viewMode,
                                                                           reloadKey,
                                                                       }: Props<T, Q>) {
    rowsPerCall = rowsPerCall || 100;
    filtersUrlKeyName = filtersUrlKeyName || "grid"
    fields = fields.filter((e) => e !== undefined);

    const isMobile = useIsMobile();

    const sameIdRowSpan = (field: keyof T, row: T, no: number, data: T[]) => {
        let i = 1;
        for (let s = no + 1; s < data.length; s++) {
            if (data[no][field] === data[s][field]) {
                i++;
            } else {
                break;
            }
        }
        return i;
    }

    const containerRef = useRef<any>(null);

    const [filter, setFilter] = useState<FilterState<Q> | undefined>(undefined);
    const [data, setData, dataState] = useAsyncState<T[]>(undefined, {disableErrorAutoHandling: true});

    /** `next` is the token the newest load returned; `byCursor` latches once a loader has
     *  returned one, since from then on only the token can say whether more rows exist.
     *  `ver` discards an older in-flight load's token — useOnlyLatestResult drops its rows too. */
    const pagingRef = useRef<{ byCursor: boolean, next?: string, ver: number }>({byCursor: false, ver: 0});

    const lastRowsRef = useRef<T[] | undefined>(undefined);
    if (data !== undefined) {
        lastRowsRef.current = data;
    }

    const updateData = (rows: undefined | ((data: T[]) => T[]) | ((data: T[]) => Promise<T[]>)): void => {
        if (rows === undefined) {
            setData(undefined);
        } else {
            setData(async (dataOld) => {
                const rrows: T[] = await rows(dataOld);
                onData?.(rrows);
                return rrows;
            });
        }
    }

    /** Refetch from the top. Keeps the page size, so loaded-more rows stay loaded
     *  unless `resetPage` asks for the first page only. */
    const reload = (resetPage?: boolean) => {
        updateData(undefined);
        setFilter((f) => f ? {...f, limit: resetPage ? [0, rowsPerCall] as [number, number] : f.limit} : f);
    }

    /** Replaces the one loaded row matching `id` (or drops it when `next` is undefined),
     *  leaving the rest of the page untouched. */
    const patchRow = (id: T["id"], next: T | undefined) => {
        const i = data!.findIndex((e) => String(e.id) === String(id));
        if (i === -1) {
            return;
        }
        const copy = [...data!];
        if (next === undefined) {
            copy.splice(i, 1);
        } else {
            copy[i] = next;
        }
        updateData(() => copy);
    }

    const [F] = useAsyncForm({
        onSubmit: async (formObj) => {
            updateData(undefined);
            setFilter((filter) => {
                const cleaned = {...formObj};
                for (const key in cleaned) {
                    if ((cleaned as any)[key] === null) {
                        delete (cleaned as any)[key];
                    }
                }
                const newFilters = {...cleaned, limit: [0, rowsPerCall], orderBy: filter?.orderBy} as FilterState<Q>;
                updateUrl(filtersUrlKeyName, newFilters)
                return newFilters
            });
        },
        init: async () => {
            const startingFilter = {
                id: undefined as FilterState<Q>["id"],
                orderBy: defaultOrderBy ? {field: defaultOrderBy.field, dir: defaultOrderBy.dir || "asc"} : undefined,
                limit: [0, rowsPerCall] as [number, number],
                ...defaultFilters,
                ...parseFromUrl(filtersUrlKeyName),
            } as FilterState<Q>;
            setFilter(startingFilter);
            return startingFilter;
        }
    }, [])
    useEffect(() => {
        if (!filter) {
            return undefined;
        }
        const rowsToLoad = filter.limit![1] - filter.limit![0] - (data?.length || 0)
        if (rowsToLoad > 0) {
            updateData(async (data) => {
                const offset = data?.length || 0;
                const ver = ++pagingRef.current.ver;
                let newRows: T[] = [];
                try {
                    const res = await load({...filter, limit: [offset, rowsToLoad], cursor: offset > 0 ? pagingRef.current.next : undefined} as FilterState<Q>);
                    newRows = res.rows;
                    if (ver === pagingRef.current.ver) {
                        pagingRef.current.next = res.nextCursor;
                        pagingRef.current.byCursor = pagingRef.current.byCursor || res.nextCursor !== undefined;
                    }
                } catch (e) {
                    if (ApiErrors.is(e) && e.type === VALIDATION_ERROR.TYPE) {
                        F.getForm().setValidationErrors(
                            ApiErrors.issuesToFormErrors(ApiErrors.getValidationErrors(e as typeof VALIDATION_ERROR.infer))
                        );
                    }
                    throw e;
                }
                return [...(data || []), ...newRows];
            })
        }
    }, [filter]);

    useEffect(() => {
        if (reloadKey === undefined) return;
        reload(true);
    }, [reloadKey]);

    const onTracked = (id: T["id"] | undefined, operation: TrackerOperation) => {
        if (operation === TrackerOperation.RELOAD || operation === TrackerOperation.CREATE) {
            // Neither names a row this grid can patch in place: a reload ping says the set
            // changed, and a new row's position is the server's call.
            reload();
        } else if (data === undefined) {
            // A load is already in flight and will bring the row's new state with it.
            // Patching now would cancel it (useOnlyLatestResult keeps only the newest
            // result) and leave the grid empty.
        } else if (operation === TrackerOperation.UPDATE) {
            load({...filter, id: id, orderBy: undefined, limit: [0, 1]} as FilterState<Q>)
                .then((res) => {
                    // @TODO Possible can update with outdated version here, if race condition happens.
                    patchRow(id!, res.rows[0]);
                })
                .catch(() => {

                });
        } else if (operation === TrackerOperation.DELETE) {
            patchRow(id!, undefined);
        }
    }

    // Registered once — it must not re-subscribe on every filter change, and its cleanup
    // owns the URL keys — so the listener calls through a ref that each render refreshes.
    // That keeps the live filter, rows and `load` in reach without a ref per variable.
    const onTrackedRef = useRef(onTracked);
    useEffect(() => {
        onTrackedRef.current = onTracked;
    });
    useEffect(() => {
        const unregister = tracker?.listen((id, operation) => onTrackedRef.current(id, operation));
        return () => {
            unregister?.();
            cleanUrl(filtersUrlKeyName);
        }
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, {root: null, rootMargin: '0px', threshold: 1.0});
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [data, filter]);

    const loadMore = () => {
        setFilter((filter) => {
            if (!filter) return filter;
            const newFilters = {...filter, limit: [filter.limit![0], filter.limit![1] + rowsPerCall]} as FilterState<Q>;
            updateUrl(filtersUrlKeyName, newFilters)
            return newFilters
        });
    }

    const getValue = (f: GridField<T>, s: number, row: any, data: any[]) => {
        if (typeof f.value === "function") {
            return f.value(row, s, data)
        } else {
            return row[f.value]
        }
    }

    const applySort = (field: string, dir: "asc" | "desc") => {
        updateData(undefined);
        setFilter((filter) => {
            const newFilters = {...filter, limit: [0, rowsPerCall], orderBy: {field, dir}} as FilterState<Q>;
            updateUrl(filtersUrlKeyName, newFilters)
            return newFilters;
        });
    }

    if (!filter) {
        return <></>
    }

    /* ── Footer status rows (shared between table and card modes) ── */

    const isEmpty = dataState.state === AsyncState.OK && data && data.length === 0;
    const loadingState = dataState.state === AsyncState.LOADING || dataState.state === AsyncState.INIT;
    // Keep the previous rows on screen during a reload (filter/sort change) so the table
    // doesn't collapse to a loader and reflow. Only the first load (no prior rows) shows the loader.
    const reloading = loadingState && data === undefined && lastRowsRef.current !== undefined;
    const displayData = data !== undefined ? data : (reloading ? lastRowsRef.current : undefined);
    const isLoading = loadingState && !reloading;
    // hasMore and the footer derive from displayData (current rows, or the previous rows during a
    // reload) so the "Load more" row and the "No more rows" footer stay put instead of vanishing
    // and reflowing the table on every reload.
    // A cursor loader's last page can be full and simply carry no token, so a full page says
    // nothing there — only offset paging may infer "more rows" from the row count.
    const {byCursor, next: cursor} = pagingRef.current;
    const hasMore = !isLoading && !dataState.error && (byCursor ? cursor !== undefined : displayData?.length === filter.limit![1]);
    const showFooter = !hideFooter && !isLoading && !dataState.error && !!displayData && displayData.length > 0 && (byCursor ? cursor === undefined : displayData.length < filter.limit![1]);
    const isValidationError = dataState.state === AsyncState.ERROR && dataState.error && dataState.error.type === VALIDATION_ERROR.TYPE;
    const isOtherError = dataState.state === AsyncState.ERROR && dataState.error && dataState.error.type !== VALIDATION_ERROR.TYPE;

    /* ── Render ────────────────────────────────────────────────── */

    const rowSpanCounts: number[] = new Array(fields.length).fill(1);
    return <>
        {filtersForm && <div className="area gridFilters" style={{zIndex: 1}}>
            <Form prop={F}>
                <div>
                    {filtersForm(F as any)}
                </div>
            </Form>
        </div>}
        {summaryForm && <div className="area" style={{zIndex: 1}}>
            {summaryForm()}
        </div>}

        <ButtonAppearanceContext.Provider value="outline">
        {viewMode === "blocks" && blocksView ? <>
            {displayData && displayData.length > 0 && <div className={"gridReloadWrap" + (reloading ? " gridReloading" : "")}>{blocksView(displayData)}</div>}
            {hasMore && <div className="area"><div onClick={loadMore} ref={containerRef} className="gridCardsLoadMore">Load more</div></div>}
            {isEmpty && <div className="area"><TipBox intent="default">No entries found!</TipBox></div>}
            {isLoading && <div className="area"><div className="gridCardsLoading"><div className="loader"></div></div></div>}
            {isValidationError && <div className="area"><TipBox intent="warning" iconLetter="!">Check filters, some of the filters are invalid!</TipBox></div>}
            {isOtherError && <div className="area"><TipBox intent="danger" iconLetter="!">{ApiErrors.getDisplayMessage(dataState.error!)}</TipBox></div>}
        </> : isMobile && mobileCard ? (
            /* ── Mobile: card view ─────────────────────────────── */
            <div className="area">
                {reloading && <div className="gridReloadBar"/>}
                <MobileSortBar fields={fields} orderBy={filter.orderBy} onSort={applySort}/>

                {displayData && <div className={"gridCards" + (reloading ? " gridReloading" : "")}>{displayData.map((row, i) => <div key={row.id ?? i} className="gridCard">{mobileCard(row, i)}</div>)}</div>}

                {hasMore && <div onClick={loadMore} ref={containerRef} className="gridCardsLoadMore">Load more</div>}
                {isEmpty && <TipBox intent="default">No entries found!</TipBox>}
                {isLoading && <div className="gridCardsLoading"><div className="loader"></div></div>}
                {showFooter && <div className="gridCardsFooter">No more rows. Found {displayData.length} row(s)!</div>}
                {isValidationError && <TipBox intent="warning" iconLetter="!">Check filters, some of the filters are invalid!</TipBox>}
                {isOtherError && <TipBox intent="danger" iconLetter="!">{ApiErrors.getDisplayMessage(dataState.error!)}</TipBox>}
            </div>
        ) : (
            /* ── Desktop: table view ───────────────────────────── */
            <div className="area">
                {reloading && <div className="gridReloadBar"/>}
                <table className={"list grid" + (reloading ? " gridReloading" : "")}>
                    <tbody>
                    <tr>
                        {fields.map((f, s) => {
                            let onClick: (() => void) | undefined = undefined;
                            const isSortable = !!f.sortName;
                            if (isSortable) {
                                onClick = () => {
                                    const newOrderBy = {field: filter.orderBy?.field, dir: filter.orderBy?.dir}
                                    if (filter.orderBy?.field === f.sortName) {
                                        newOrderBy.dir = f.sortOnlyOneWay ? (f.sortDir || "asc") : (newOrderBy.dir === "asc" ? "desc" : "asc")
                                    } else {
                                        newOrderBy.field = f.sortName as string;
                                        newOrderBy.dir = f.sortDir || "asc";
                                    }
                                    applySort(newOrderBy.field!, newOrderBy.dir!);
                                }
                            }
                            const props: any = {width: f.width, style: compact ? {whiteSpace: "normal"} : undefined};
                            return <th key={s} {...props} onClick={onClick} className={"normal "+(isSortable ? "sort" : "") + (isSortable && f.sortName === filter.orderBy?.field ? " sorted" : "")}>{f.title || ""}
                                {isSortable && <>{compact && <br/>}<span className={"gridArrow " + (f.sortName === filter.orderBy?.field ? "" : "gridArrowNeutral")}>
                            {f.sortName === filter.orderBy?.field ? (filter.orderBy?.dir === "asc" ? <>&#8595;</> : <>&#8593;</>) : <>&#8693;</>}
                        </span></>}
                            </th>
                        })}
                    </tr>
                    {displayData?.map((row: any, i) => {
                        return <tr key={i}>{fields.map((f, s) => {
                            if (rowSpanCounts[s] > 1) {
                                rowSpanCounts[s]--;
                                return undefined;
                            }
                            let rowSpan: ((a: any, b: any, c: any) => number) | undefined = undefined;
                            if (f.rowSpan === "sameId") {
                                rowSpan = (a: any, b: any, c: any) => sameIdRowSpan("id", a, b, c);
                            } else if (typeof f.rowSpan === "string") {
                                rowSpan = (a: any, b: any, c: any) => sameIdRowSpan(f.rowSpan as any, a, b, c);
                            } else {
                                rowSpan = f.rowSpan as any;
                            }
                            const rowSpanValue = rowSpan?.(row, i, displayData);
                            if (rowSpanValue !== undefined && rowSpanValue > 1) {
                                rowSpanCounts[s] = rowSpanValue;
                            }

                            const style: CSSProperties = {whiteSpace: f.wrap ? "normal" : "nowrap", ...f.style}
                            return <td key={s} rowSpan={rowSpanValue} align={f.align} style={style}>{getValue(f, i, row, displayData)}</td>
                        })}</tr>
                    })}
                    {hasMore && <tr>
                        <td colSpan={fields.length + 1} onClick={loadMore} ref={containerRef} className="lastRow">Load more</td>
                    </tr>}
                    {isEmpty && <tr>
                        <td colSpan={fields.length + 1}><TipBox intent="default">No entries found!</TipBox></td>
                    </tr>}
                    {isLoading && <tr>
                        <td colSpan={fields.length + 1} className="loadingRows">
                            <div className="loader"></div>
                        </td>
                    </tr>}
                    {showFooter && <tr>
                        <td colSpan={fields.length + 1} className="noMoreRows">No more rows. Found {displayData.length} row(s)!</td>
                    </tr>}
                    {isValidationError && <tr>
                        <td colSpan={fields.length + 1}><TipBox intent="warning" iconLetter="!">Check filters, some of the filters are invalid!</TipBox></td>
                    </tr>}
                    {isOtherError && <tr>
                        <td colSpan={fields.length + 1}><TipBox intent="danger" iconLetter="!">{ApiErrors.getDisplayMessage(dataState.error!)}</TipBox></td>
                    </tr>}
                    </tbody>
                </table>
            </div>
        )}
        </ButtonAppearanceContext.Provider>
    </>
}

function parseFromUrl(urlKey: string): Partial<GridQuery> {
    const url = new URL(window.location.href);
    const filters: Partial<GridQuery> & Record<string, unknown> = {};
    url.searchParams.forEach((value, name) => {
        const namePart = name.split(".");
        if (namePart.length === 2 && namePart[0] === urlKey) {
            if (namePart[1] === "orderBy") {
                const val = value.split("-");
                if (val[0] !== "undefined") {
                    filters.orderBy = {field: val[0], dir: val[1] as GridOrderBy["dir"]};
                }
            } else if (namePart[1] === "limit") {
                const val = value.split("-");
                filters.limit = [Number(val[0]), Number(val[1])];
            } else {
                filters[namePart[1]] = value
            }
        }
    })
    return filters;
}

function updateUrl(urlKey: string, filter: GridQuery): void {
    const values: [string, string][] = [];
    for (const k in filter) {
        const val = (filter as Record<string, unknown>)[k];
        if (val) {
            const arg = urlKey + "." + k + "";
            if (k === "orderBy") {
                const ob = val as GridOrderBy;
                values.push([arg, ob.field + "-" + ob.dir])
            } else if (k === "limit") {
                const lim = val as [number, number];
                values.push([arg, lim[0] + "-" + lim[1]])
            } else {
                values.push([arg, String(val)]);
            }
        }
    }
    const url = new URL(window.location.href);
    const existing: string[] = []
    url.searchParams.forEach((value, name) => {
        if (name.substring(0, urlKey.length) === urlKey) {
            existing.push(name);
        }
    });
    existing.forEach((name) => {
        url.searchParams.delete(name)
    })
    values.forEach((value) => {
        url.searchParams.set(value[0], value[1]);
    })
    window.history.replaceState({path: url.toString()}, '', url.toString());
}

function cleanUrl(urlKey: string) {
    const url = new URL(window.location.href);
    const deleteKeys: string[] = [];

    url.searchParams.forEach((value, name) => {
        const namePart = name.split(".");
        if (namePart.length === 2 && namePart[0] === urlKey) {
            deleteKeys.push(name)
        }
    })
    deleteKeys.forEach((name) => {
        url.searchParams.delete(name)
    })
    window.history.replaceState({path: url.toString()}, '', url.toString());
}
