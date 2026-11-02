import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {useState} from "react";
import {SegmentedControl} from "./SegmentedControl";
import {useAsyncForm} from "../useAsyncForm";

const options = [
    {id: "all", name: "All"},
    {id: "agents", name: "Agents"},
    {id: "system", name: "System", disabled: true},
    {id: "outside", name: "Outside"},
];

function Controlled({onChange}: {onChange?: (v: string) => void}) {
    const [value, setValue] = useState("all");
    return <SegmentedControl<string> aria-label="Who" value={value} options={options} onChange={v => { setValue(v); onChange?.(v); }}/>;
}

describe("SegmentedControl", () => {
    it("renders a radiogroup with one checked radio in the tab order", () => {
        render(<Controlled/>);
        expect(screen.getByRole("radiogroup", {name: "Who"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "All"})).toHaveAttribute("aria-checked", "true");
        expect(screen.getAllByRole("radio").map(r => r.tabIndex)).toEqual([0, -1, -1, -1]);
    });

    it("selects on click and ignores disabled options", async () => {
        const onChange = vi.fn();
        render(<Controlled onChange={onChange}/>);
        await userEvent.click(screen.getByRole("radio", {name: "System"}));
        expect(onChange).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole("radio", {name: "Outside"}));
        expect(onChange).toHaveBeenCalledWith("outside");
        expect(screen.getByRole("radio", {name: "Outside"})).toHaveAttribute("aria-checked", "true");
    });

    it("moves the selection with the arrow keys, skipping disabled options and wrapping", async () => {
        render(<Controlled/>);
        await userEvent.tab();
        expect(screen.getByRole("radio", {name: "All"})).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}{ArrowRight}");
        expect(screen.getByRole("radio", {name: "Outside"})).toHaveFocus();
        expect(screen.getByRole("radio", {name: "Outside"})).toHaveAttribute("aria-checked", "true");
        await userEvent.keyboard("{ArrowRight}");
        expect(screen.getByRole("radio", {name: "All"})).toHaveAttribute("aria-checked", "true");
        await userEvent.keyboard("{End}{ArrowLeft}");
        expect(screen.getByRole("radio", {name: "Agents"})).toHaveFocus();
    });

    it("binds to a form field and marks it changed", async () => {
        function Bound() {
            const [F] = useAsyncForm<{lane: "both" | "work"}>({init: {lane: "both"}, onSubmit: async () => {}}, []);
            return <>
                <SegmentedControl prop={F.lane} options={[{id: "both", name: "Both"}, {id: "work", name: "Work"}]}/>
                <span data-testid="val">{F.lane.val()}</span>
            </>;
        }
        const {container} = render(<Bound/>);
        await userEvent.click(screen.getByRole("radio", {name: "Work"}));
        expect(screen.getByTestId("val")).toHaveTextContent("work");
        expect(container.querySelector(".rkSegmented")).toHaveClass("changed");
    });
});
