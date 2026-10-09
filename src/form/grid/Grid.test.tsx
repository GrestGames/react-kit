import {describe, it, expect, vi} from "vitest";
import {render, screen, act, waitFor} from "@testing-library/react";
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
