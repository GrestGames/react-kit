import {describe, it, expect} from "vitest";
import {useState} from "react";
import {render, fireEvent, waitFor, act} from "@testing-library/react";
import {AutoComplete} from "./AutoComplete";

const PEOPLE = [{id: "a", name: "Alice"}, {id: "b", name: "Bob"}, {id: "m", name: "Mallory (bob@x)"}];

function ServerSearch() {
    const [matches, setMatches] = useState<typeof PEOPLE>([]);
    const search = (text: string) => setMatches(text ? PEOPLE.filter(p => p.name.toLowerCase().includes(text) || p.id === "m") : []);
    return <AutoComplete<string | undefined> options={matches} onSearch={search} value={undefined} onChange={() => {}}/>;
}

describe("AutoComplete onSearch", () => {
    it("shows the caller's matches unfiltered", async () => {
        const view = render(<ServerSearch/>);
        const input = await waitFor(() => {
            const el = view.container.querySelector("input");
            expect(el?.disabled).toBe(false);
            return el!;
        });
        act(() => input.focus());
        await waitFor(() => expect(document.querySelector(".autocompleteSearch")?.textContent).toContain("Type to search"));
        fireEvent.change(input, {target: {value: "bob"}});
        await waitFor(() => expect(Array.from(document.querySelectorAll(".autocompleteSearch > div")).map(d => d.textContent))
            .toEqual(["Bob", "Mallory (bob@x)"]));
    });
});
