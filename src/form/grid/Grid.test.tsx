import {describe, it, expect, vi} from "vitest";
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
