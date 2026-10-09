import {describe, it, expect, vi, beforeAll} from "vitest";
import {render, screen, act, waitFor} from "@testing-library/react";
import {Grid} from "./Grid";
import {Tracker} from "../../EntityTracker";

type Row = {id: string, name: string}

// jsdom has no IntersectionObserver; Grid uses one for its load-more sentinel.
beforeAll(() => {
    (globalThis as any).IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

/** One grid over a mutable server-side table, so a tracker op can be checked against
 *  both what the grid renders and how many times it refetched. */
function setup(initial: Row[]) {
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
        fields={[{title: "Name", value: r => r.name}]}
    />);
    return {
        tracker, load, view,
        setTable: (rows: Row[]) => { table = rows },
        names: () => Array.from(view.container.querySelectorAll("table.grid td:not([class])")).map(td => td.textContent),
    };
}

const rows: Row[] = [
    {id: "img-a", name: "Alpha"},
    {id: "img-b", name: "Beta"},
    {id: "img-c", name: "Gamma"},
];

describe("Grid tracker ops", () => {
    it("renders string row ids", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
    });

    it("delete removes only that row, without refetching", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        const callsBefore = g.load.mock.calls.length;

        await act(async () => { g.tracker.delete("img-b") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Gamma"]));
        expect(g.load).toHaveBeenCalledTimes(callsBefore);
    });

    it("delete of an unknown id leaves the page alone", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));

        await act(async () => { g.tracker.delete("img-zz") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
    });

    it("update refetches just that row", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        g.setTable([rows[0], {id: "img-b", name: "Beta renamed"}, rows[2]]);

        await act(async () => { g.tracker.update("img-b") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta renamed", "Gamma"]));
        expect(g.load).toHaveBeenLastCalledWith(expect.objectContaining({id: "img-b", limit: [0, 1]}));
    });

    it("update keeps the grid's active filters", async () => {
        const tracker = new Tracker<string>();
        const load = vi.fn(async () => ({rows}));
        render(<Grid<Row, any>
            load={load}
            tracker={tracker}
            defaultFilters={{scope: "cloud-1"}}
            fields={[{title: "Name", value: r => r.name}]}
        />);
        await waitFor(() => expect(screen.getByText("Beta")).toBeInTheDocument());

        await act(async () => { tracker.update("img-b") });

        expect(load).toHaveBeenLastCalledWith(expect.objectContaining({id: "img-b", scope: "cloud-1"}));
    });

    it("refresh reloads the whole list", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        g.setTable([rows[0], rows[2]]);

        await act(async () => { g.tracker.refresh() });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Gamma"]));
    });

    it("create reloads the whole list", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        g.setTable([...rows, {id: "img-d", name: "Delta"}]);

        await act(async () => { g.tracker.create("img-d") });

        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma", "Delta"]));
    });

    it("stops listening once unmounted", async () => {
        const g = setup(rows);
        await waitFor(() => expect(g.names()).toEqual(["Alpha", "Beta", "Gamma"]));
        g.view.unmount();
        const callsBefore = g.load.mock.calls.length;

        await act(async () => { g.tracker.refresh() });

        expect(g.load).toHaveBeenCalledTimes(callsBefore);
        expect(screen.queryByText("Alpha")).toBeNull();
    });
});
