import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, act, waitFor, fireEvent} from "@testing-library/react";
import {Grid} from "./Grid";
import {Tracker} from "../../EntityTracker";

type Row = {id: string, name: string}

/** One grid over a mutable server-side table, so a tracker op can be checked against
 *  both what the grid renders and how many times it refetched. */
function setup(initial: Row[], defaultFilters?: Record<string, unknown>) {
    let table = [...initial];
    const tracker = new Tracker<string>();
    const load = vi.fn(async (input: any) => {
        if (input?.id !== undefined && input.id !== null) {
            return {rows: table.filter(r => r.id === String(input.id))};
        }
        return {rows: table};
    });
    const view = render(<Grid<Row, any>
        load={load}
        tracker={tracker}
        defaultFilters={defaultFilters}
        hideFooter
        fields={[{title: "Name", value: r => r.name}]}
    />);
    return {
        tracker, load, view,
        setTable: (rows: Row[]) => { table = rows },
        names: () => Array.from(view.container.querySelectorAll("table.grid td")).map(td => td.textContent),
    };
}

const rows: Row[] = [
    {id: "img-a", name: "Alpha"},
    {id: "img-b", name: "Beta"},
    {id: "img-c", name: "Gamma"},
];

const loaded = (g: ReturnType<typeof setup>) =>
    waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));

describe("Grid tracker ops", () => {
    it("delete removes only that row, without refetching", async () => {
        const g = setup(rows);
        await loaded(g);
        const callsBefore = g.load.mock.calls.length;

        await act(async () => { g.tracker.delete("img-b") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Gamma"]));
        expect(g.load).toHaveBeenCalledTimes(callsBefore);
    });

    it("delete of an unknown id leaves the page alone", async () => {
        const g = setup(rows);
        await loaded(g);

        await act(async () => { g.tracker.delete("img-zz") });

        await loaded(g);
    });

    it("update refetches just that row", async () => {
        const g = setup(rows);
        await loaded(g);
        g.setTable([rows[0], {id: "img-b", name: "Beta renamed"}, rows[2]]);

        await act(async () => { g.tracker.update("img-b") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta renamed", "Gamma"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({id: "img-b", limit: [0, 1]}));
    });

    it("two updates answered before a re-render both stay", async () => {
        const g = setup(rows);
        await loaded(g);
        g.setTable([{id: "img-a", name: "Alpha renamed"}, {id: "img-b", name: "Beta renamed"}, rows[2]]);

        await act(async () => {
            g.tracker.update("img-a");
            g.tracker.update("img-b");
        });

        await waitFor(() => expect(g.names()).toEqual(["Alpha renamed", "Beta renamed", "Gamma"]));
    });

    it("update keeps the grid's active filters", async () => {
        const g = setup(rows, {scope: "cloud-1"});
        await loaded(g);

        await act(async () => { g.tracker.update("img-b") });

        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({id: "img-b", scope: "cloud-1"}));
    });

    it("refresh reloads the whole list", async () => {
        const g = setup(rows);
        await loaded(g);
        g.setTable([rows[0], rows[2]]);

        await act(async () => { g.tracker.refresh() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Gamma"]));
    });

    it("create reloads the whole list", async () => {
        const g = setup(rows);
        await loaded(g);
        g.setTable([...rows, {id: "img-d", name: "Delta"}]);

        await act(async () => { g.tracker.create("img-d") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]));
    });

    // The row is gone server-side before the tracker fires, but a read already in flight was
    // issued before that and answers with the stale page — so the op must force a re-read
    // rather than be dropped for finding no rows to patch.
    it("re-reads when an op lands with a load in flight", async () => {
        let table = [...rows];
        let park = false;
        let release: (() => void) | undefined;
        const load = vi.fn(async (input: any) => {
            if (input?.id !== undefined && input.id !== null) {
                return {rows: table.filter(r => r.id === String(input.id))};
            }
            const snapshot = [...table];
            if (park) {
                park = false;
                await new Promise<void>(res => { release = res });
            }
            return {rows: snapshot};
        });
        const tracker = new Tracker<string>();
        const view = render(<Grid<Row, any>
            load={load} tracker={tracker} hideFooter
            fields={[{title: "Name", value: r => r.name}]}
        />);
        const names = () => Array.from(view.container.querySelectorAll("table.grid td")).map(td => td.textContent);
        await waitFor(() => expect(names()).toEqual(["Alpha", "Beta", "Gamma"]));

        park = true;
        await act(async () => { tracker.refresh() });
        await waitFor(() => expect(release).toBeDefined());

        table = table.filter(r => r.id !== "img-b");
        await act(async () => { tracker.delete("img-b") });
        await act(async () => { release!() });

        await waitFor(() => expect(names()).toEqual(["Alpha", "Gamma"]));
    });

    it("stops listening once unmounted", async () => {
        const g = setup(rows);
        await loaded(g);
        g.view.unmount();
        const callsBefore = g.load.mock.calls.length;

        await act(async () => { g.tracker.refresh() });

        expect(g.load).toHaveBeenCalledTimes(callsBefore);
        expect(screen.queryByText("Alpha")).toBeNull();
    });
});

/** Loader over fixed pages: a page's `nextCursor` is the index of the page it hands out next,
 *  and a call with no cursor is always the first page. */
const pagedLoad = (pages: {rows: Row[], nextCursor?: string}[]) =>
    vi.fn(async (input: any) => pages[input.cursor === undefined ? 0 : Number(input.cursor)] ?? {rows: []});

function setupPaged(load: any, props?: Record<string, unknown>) {
    const el = (extra?: Record<string, unknown>) => <Grid<Row, any>
        load={load}
        rowsPerCall={2}
        fields={[{title: "Name", sortName: "name", value: (r) => r.name}]}
        {...props}
        {...extra}
    />;
    const view = render(el());
    return {
        view, load,
        setProps: (extra: Record<string, unknown>) => view.rerender(el(extra)),
        names: () => Array.from(view.container.querySelectorAll("table.grid td:not(.lastRow):not(.noMoreRows)")).map(td => td.textContent),
        loadMore: () => fireEvent.click(view.getByText("Load more")),
        sortByName: () => fireEvent.click(view.container.querySelector("th.sort")!),
        hasLoadMore: () => !!view.container.querySelector("td.lastRow"),
        footer: () => view.container.querySelector("td.noMoreRows")?.textContent,
        lastQuery: () => load.mock.calls.at(-1)![0],
    };
}

const twoThenOne = () => pagedLoad([
    {rows: [rows[0], rows[1]], nextCursor: "1"},
    {rows: [rows[2]]},
]);

describe("Grid cursor paging", () => {
    it("load more sends the previous page's cursor", async () => {
        const g = setupPaged(twoThenOne());
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        expect(g.lastQuery().cursor).toBeUndefined();

        await act(async () => { g.loadMore() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({limit: [2, 2], cursor: "1"}));
        expect(g.hasLoadMore()).toBe(false);
        expect(g.footer()).toBe("No more rows. Found 3 row(s)!");
    });

    it("a full last page without a cursor ends the list", async () => {
        const g = setupPaged(pagedLoad([
            {rows: [rows[0], rows[1]], nextCursor: "1"},
            {rows: [rows[2], {id: "img-d", name: "Delta"}]},
        ]));
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));

        await act(async () => { g.loadMore() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]));
        expect(g.hasLoadMore()).toBe(false);
        expect(g.footer()).toBe("No more rows. Found 4 row(s)!");
    });

    it("a reloadKey change restarts at the first page with no cursor", async () => {
        const g = setupPaged(twoThenOne(), {reloadKey: 1});
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        await act(async () => { g.loadMore() });
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));

        await act(async () => { g.setProps({reloadKey: 2}) });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({limit: [0, 2], cursor: undefined}));
        expect(g.hasLoadMore()).toBe(true);
    });

    it("a sort change restarts at the first page with no cursor", async () => {
        const g = setupPaged(twoThenOne());
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        await act(async () => { g.loadMore() });
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));

        await act(async () => { g.sortByName() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({
            limit: [0, 2], cursor: undefined, orderBy: {field: "name", dir: "asc"},
        }));
    });

    it("tracker.refresh() reloads from the first page without a cursor", async () => {
        const tracker = new Tracker<string>();
        const g = setupPaged(twoThenOne(), {tracker});
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        await act(async () => { g.loadMore() });
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));

        await act(async () => { tracker.refresh() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        expect(g.lastQuery().cursor).toBeUndefined();
        expect(g.lastQuery().limit[0]).toBe(0);
    });

    it("short pages never grow a call past rowsPerCall", async () => {
        const g = setupPaged(pagedLoad([
            {rows: [rows[0]], nextCursor: "1"},
            {rows: [rows[1]], nextCursor: "2"},
            {rows: [], nextCursor: "3"},
            {rows: [rows[2]]},
        ]));
        await waitFor(() => expect(g.names()).toEqual(["Alpha"]));

        for (let i = 0; i < 3; i++) await act(async () => { g.loadMore() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        expect(g.load.mock.calls.map(([q]: any[]) => q.limit[1])).toEqual([2, 2, 2, 2]);
        expect(g.hasLoadMore()).toBe(false);
    });

    it("a loader that returns no cursor still pages by offset", async () => {
        const load = vi.fn(async (input: any) => ({rows: rows.slice(input.limit[0], input.limit[0] + input.limit[1])}));
        const g = setupPaged(load);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta"]));
        expect(g.hasLoadMore()).toBe(true);

        await act(async () => { g.loadMore() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({limit: [2, 2]}));
        expect(g.lastQuery().cursor).toBeUndefined();
        expect(g.hasLoadMore()).toBe(false);
        expect(g.footer()).toBe("No more rows. Found 3 row(s)!");
    });
});

describe("Grid colSpan", () => {
    it("a spanning cell takes the columns after it, only on its row", async () => {
        const view = render(<Grid<Row, any>
            load={async () => ({rows})}
            hideFooter
            fields={[
                {title: "Name", value: r => r.name, colSpan: r => r.id === "img-b" ? 2 : 1},
                {title: "Id", value: r => r.id},
            ]}
        />);
        const cells = () => Array.from(view.container.querySelectorAll("table.grid tr")).slice(1)
            .map(tr => Array.from(tr.querySelectorAll("td")).map(td => [td.textContent, td.colSpan]));
        await waitFor(() => expect(cells()).toEqual([
            [["Alpha", 1], ["img-a", 1]],
            [["Beta", 2]],
            [["Gamma", 1], ["img-c", 1]],
        ]));
    });

    it("a spanning cell next to a rowSpan column keeps later rows aligned", async () => {
        const view = render(<Grid<Row, any>
            load={async () => ({rows})}
            hideFooter
            fields={[
                {title: "Group", value: () => "all", rowSpan: (_r, no) => no === 0 ? 3 : 1},
                {title: "Name", value: r => r.name, colSpan: r => r.id === "img-b" ? 2 : 1},
                {title: "Id", value: r => r.id},
            ]}
        />);
        const cells = () => Array.from(view.container.querySelectorAll("table.grid tr")).slice(1)
            .map(tr => Array.from(tr.querySelectorAll("td")).map(td => td.textContent));
        await waitFor(() => expect(cells()).toEqual([["all", "Alpha", "img-a"], ["Beta"], ["Gamma", "img-c"]]));
    });
});

describe("Grid list layout", () => {
    let width = 390;
    let resize: (() => void) | undefined;
    beforeEach(() => {
        width = 390;
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
            return {width: this.classList.contains("rkGrid") ? width : 0} as DOMRect;
        });
        globalThis.ResizeObserver = class {
            constructor(cb: () => void) { resize = cb }
            observe() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
    });
    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as any).ResizeObserver;
        window.history.replaceState(null, "", "/");
    });

    type U = {id: string, name: string, email: string, role: string, note?: string}
    const users: U[] = [
        {id: "u1", name: "Ann", email: "ann@x", role: "admin", note: "vip"},
        {id: "u2", name: "Bob", email: "bob@x", role: ""},
    ];
    const isList = (c: HTMLElement) => !!c.querySelector("ul.gridList") && !c.querySelector("table.grid");
    const rowTexts = (c: HTMLElement) => Array.from(c.querySelectorAll(".gridListRow")).map(li =>
        Array.from(li.querySelectorAll(".gridListTitle, .gridListSubtitle, .gridListTrailing, .gridListLabel, .gridListValue, .gridListActions"))
            .map(e => e.classList[0].replace("gridList", "") + ":" + e.textContent));

    it("switches with the grid's own width, with hysteresis on the way back", async () => {
        const view = render(<Grid<U, any> load={async () => ({rows: users})} hideFooter fields={[{title: "Name", value: "name"}]}/>);
        await screen.findByText("Ann");
        expect(isList(view.container)).toBe(true);
        width = 620;
        act(() => resize!());
        expect(isList(view.container)).toBe(true);
        width = 650;
        act(() => resize!());
        expect(isList(view.container)).toBe(false);
        width = 590;
        act(() => resize!());
        expect(isList(view.container)).toBe(true);
    });

    it("layout forces table or list regardless of width", async () => {
        const table = render(<Grid<U, any> layout="table" load={async () => ({rows: users})} hideFooter fields={[{title: "Name", value: "name"}]}/>);
        await waitFor(() => expect(table.container.querySelector("table.grid td")).not.toBeNull());
        expect(isList(table.container)).toBe(false);
        table.unmount();
        width = 1200;
        const list = render(<Grid<U, any> layout="list" load={async () => ({rows: users})} hideFooter fields={[{title: "Name", value: "name"}]}/>);
        await screen.findByText("Ann");
        expect(isList(list.container)).toBe(true);
    });

    it("table: hide keeps a field in the list but out of the table", async () => {
        const fields = [{title: "Name", list: "title" as const, value: "name" as const},
            {title: "Summary", list: "subtitle" as const, table: "hide" as const, value: (r: U) => `${r.email} (${r.role})`}];
        const table = render(<Grid<U, any> layout="table" load={async () => ({rows: users})} hideFooter fields={fields}/>);
        await waitFor(() => expect(table.container.querySelector("table.grid td")).not.toBeNull());
        expect(table.container.textContent).not.toContain("Summary");
        expect(table.container.textContent).not.toContain("ann@x (admin)");
        table.unmount();
        render(<Grid<U, any> layout="list" load={async () => ({rows: users})} hideFooter fields={fields}/>);
        expect(await screen.findByText("ann@x (admin)")).toBeTruthy();
    });

    it("places fields by hint, joins subtitles, skips empty values", async () => {
        const view = render(<Grid<U, any> load={async () => ({rows: users})} hideFooter fields={[
            {title: "No", list: "hide", value: (r, no) => no + 1},
            {title: "Name", list: "title", value: "name"},
            {title: "Email", list: "subtitle", value: "email"},
            {title: "Role", list: "subtitle", value: "role"},
            {title: "Note", list: "trailing", value: r => r.note},
            {title: "Id", value: "id"},
            {value: r => r.name.toLowerCase()},
            {list: "actions", value: r => <button>Edit {r.name}</button>},
        ]}/>);
        await screen.findByText("Ann");
        expect(rowTexts(view.container)).toEqual([
            ["Title:Ann", "Subtitle:ann@x · admin", "Trailing:vip", "Label:Id", "Value:u1", "Value:ann", "Actions:Edit Ann"],
            ["Title:Bob", "Subtitle:bob@x", "Label:Id", "Value:u2", "Value:bob", "Actions:Edit Bob"],
        ]);
    });

    it("without hints renders every titled field as a label/value line", async () => {
        const view = render(<Grid<U, any> load={async () => ({rows: users.slice(0, 1)})} hideFooter fields={[
            {title: "Name", value: "name"},
            {title: "Email", value: "email"},
        ]}/>);
        await screen.findByText("Ann");
        expect(rowTexts(view.container)).toEqual([["Label:Name", "Value:Ann", "Label:Email", "Value:ann@x"]]);
    });

    it("moves a control used as an actions/hide column title to the toolbar", async () => {
        const view = render(<Grid<U, any> load={async () => ({rows: users})} hideFooter fields={[
            {title: "Name", list: "title", value: "name"},
            {title: <button onClick={() => {}}>Invite</button>, list: "hide", value: () => <button>View</button>},
        ]}/>);
        await screen.findByText("Ann");
        expect(screen.getByRole("button", {name: "Invite"}).closest(".gridListToolbarActions")).not.toBeNull();
        expect(screen.queryByRole("button", {name: "View"})).toBeNull();
    });

    it("onRowClick fires once from the row, the row button and Enter on it, never from an inner control", async () => {
        const onRowClick = vi.fn();
        const inner = vi.fn();
        render(<Grid<U, any> load={async () => ({rows: users})} hideFooter onRowClick={onRowClick} fields={[
            {title: "Name", list: "title", value: "name"},
            {title: "Email", list: "subtitle", value: "email"},
            {list: "actions", value: r => <button onClick={inner}>Edit {r.name}</button>},
        ]}/>);
        fireEvent.click(await screen.findByText("ann@x"));
        expect(onRowClick.mock.calls).toEqual([[users[0]]]);
        fireEvent.click(screen.getByRole("button", {name: "Edit Bob"}));
        expect(inner).toHaveBeenCalledTimes(1);
        expect(onRowClick).toHaveBeenCalledTimes(1);
        const target = screen.getByRole("button", {name: "Bob bob@x"});
        target.focus();
        fireEvent.click(target);
        expect(onRowClick.mock.calls).toEqual([[users[0]], [users[1]]]);
    });

    it("listRow replaces the slots and keeps the row click, named by its content", async () => {
        const onRowClick = vi.fn();
        render(<Grid<U, any> load={async () => ({rows: users})} hideFooter onRowClick={onRowClick}
                             listRow={r => <b>{r.name} custom</b>}
                             fields={[{title: "Name", list: "title", value: "name"}]}/>);
        fireEvent.click(await screen.findByText("Ann custom"));
        expect(onRowClick.mock.calls).toEqual([[users[0]]]);
        expect(document.querySelector(".gridListTitle")).toBeNull();
        fireEvent.click(screen.getByRole("button", {name: "Bob custom"}));
        expect(onRowClick.mock.calls).toEqual([[users[0]], [users[1]]]);
    });

    it("onRowClick on the table: row click and Enter fire, inner buttons don't", async () => {
        width = 1200;
        const onRowClick = vi.fn();
        const inner = vi.fn();
        const view = render(<Grid<U, any> load={async () => ({rows: users})} hideFooter onRowClick={onRowClick} fields={[
            {title: "Name", value: "name"},
            {value: r => <button onClick={inner}>Edit {r.name}</button>},
        ]}/>);
        fireEvent.click(await screen.findByText("Ann"));
        fireEvent.click(screen.getByRole("button", {name: "Edit Bob"}));
        const row = view.container.querySelectorAll("tr.gridRowClickable")[1];
        fireEvent.keyDown(row, {key: "Enter"});
        expect(onRowClick.mock.calls).toEqual([[users[0]], [users[1]]]);
        expect(inner).toHaveBeenCalledTimes(1);
    });

    it("folds filtersForm behind Filters, keeps searchForm visible, and opens with a badge when the URL carries a filter", async () => {
        const fields = [{title: "Name", value: "name" as const}];
        const view = render(<Grid<U, any> load={async () => ({rows: users})} hideFooter defaultFilters={{show: "all"}} fields={fields}
            searchForm={() => <input placeholder="Search"/>} filtersForm={() => <input placeholder="Show"/>}/>);
        await screen.findByText("Ann");
        expect(screen.getByPlaceholderText("Search")).toBeTruthy();
        expect(screen.queryByPlaceholderText("Show")).toBeNull();
        fireEvent.click(screen.getByRole("button", {name: "Filters"}));
        expect(screen.getByPlaceholderText("Show")).toBeTruthy();
        view.unmount();

        window.history.replaceState(null, "", "/?grid.show=mine");
        render(<Grid<U, any> load={async () => ({rows: users})} hideFooter defaultFilters={{show: "all"}} fields={fields}
            filtersForm={() => <input placeholder="Show"/>}/>);
        await screen.findByText("Ann");
        expect(screen.getByPlaceholderText("Show")).toBeTruthy();
        expect(screen.getByRole("button", {name: /^Filters\s*\(active\)$/})).toBeTruthy();
    });

    it("sorts from the toolbar select", async () => {
        const load = vi.fn(async () => ({rows: users}));
        render(<Grid<U, any> load={load} hideFooter fields={[{title: "Name", value: "name", sortName: "name"}]}/>);
        await screen.findByText("Ann");
        fireEvent.change(screen.getByLabelText("Sort by"), {target: {value: "1"}});
        await waitFor(() => expect(load).toHaveBeenLastCalledWith(expect.objectContaining({orderBy: {field: "name", dir: "desc"}})));
    });
});
