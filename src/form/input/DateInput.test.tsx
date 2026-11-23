import {describe, it, expect, afterEach, vi} from "vitest";
import {render} from "@testing-library/react";
import {DateInput, YearMonthSelect} from "./DateInput";

describe("DateInput", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("shows the stored day west of UTC, not the day before", () => {
        vi.stubEnv("TZ", "America/Los_Angeles");
        const {container} = render(<DateInput<string> value="2026-03-05"/>);
        expect(container.querySelector("input")!.value).toBe("2026/03/05");
    });

    it("shows the stored month west of UTC", () => {
        vi.stubEnv("TZ", "America/Los_Angeles");
        const {container} = render(<YearMonthSelect<string> value="2026-03"/>);
        expect(container.querySelector("input")!.value).toBe("2026/03");
    });
});
