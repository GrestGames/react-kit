import {describe, it, expect, vi} from "vitest";
import {render, fireEvent} from "@testing-library/react";
import {Select} from "./Select";

describe("Select", () => {
    it("picks an option whose id is an empty string", () => {
        const onChange = vi.fn();
        const {container} = render(<Select<string> value="a" onChange={onChange} options={[{id: "", name: "None"}, {id: "a", name: "A"}]}/>);
        fireEvent.change(container.querySelector("select")!, {target: {value: ""}});
        expect(onChange).toHaveBeenCalledWith("");
    });

    it("shows an empty-string id as selected", () => {
        const {container} = render(<Select<string> value="" options={[{id: "", name: "Role…"}, {id: "a", name: "A"}]}/>);
        expect(container.querySelector("select")!.value).toBe("");
    });
});
