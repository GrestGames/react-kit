import {describe, it, expect} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {PopupPanel} from "./PopupPanel";

function open() {
    render(<PopupPanel title="Settings" width="600px" onClose={() => {}}>
        <button>first</button>
    </PopupPanel>);
}

describe("PopupPanel initial focus", () => {
    it("after a pointer press focuses the dialog itself, not a control", async () => {
        fireEvent.pointerDown(document.body);
        open();
        await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("dialog", {name: "Settings"})));
    });

    it("after a key press focuses the first content control, skipping the close button", async () => {
        fireEvent.keyDown(document.body, {key: "Enter"});
        open();
        await waitFor(() => expect(document.activeElement).toBe(screen.getByText("first")));
    });
});
