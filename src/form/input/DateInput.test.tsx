import {describe, it, expect, afterEach} from "vitest";
import {render} from "@testing-library/react";
import {DateInput, YearMonthSelect} from "./DateInput";

const tz = process.env.TZ;

describe("DateInput", () => {
    afterEach(() => {
        process.env.TZ = tz;
    });

    it("shows the stored day west of UTC, not the day before", () => {
        process.env.TZ = "America/Los_Angeles";
        const {container} = render(<DateInput<string> value="2026-03-05"/>);
        expect(container.querySelector("input")!.value).toBe("2026/03/05");
    });

    it("shows the stored month west of UTC", () => {
        process.env.TZ = "America/Los_Angeles";
        const {container} = render(<YearMonthSelect<string> value="2026-03"/>);
        expect(container.querySelector("input")!.value).toBe("2026/03");
    });
});
