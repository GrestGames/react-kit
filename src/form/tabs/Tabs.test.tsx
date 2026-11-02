import {afterEach, describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Router, RouterProvider} from "../../router";
import {Tabs, type Tab} from "./Tabs";

let router: Router;
afterEach(() => router?.destroy());

function renderTabs(tabs: Tab[]) {
    window.history.replaceState({}, "", "/");
    router = new Router({"tab=?": () => null}, "");
    return render(<RouterProvider router={router}><Tabs urlKey="tab" defaultTab="general" layout="side" tabs={tabs}/></RouterProvider>);
}

describe("Tabs side layout", () => {
    const tabs: Tab[] = [
        {urlKey: "archive", title: "Archive", danger: true, body: () => "archive body"},
        {urlKey: "general", title: "General", group: "Basics", body: () => "general body"},
        {urlKey: "repos", title: "Repositories", group: "Basics", body: () => "repos body"},
        {urlKey: "clouds", title: "Clouds", group: "Infra", body: () => "clouds body"},
    ];

    it("heads each group once and pins danger tabs to the bottom", () => {
        const {container} = renderTabs(tabs);
        const items = [...container.querySelectorAll(".tabsMenu > div")].map(e => e.textContent);
        expect(items).toEqual(["Basics", "General", "Repositories", "Infra", "Clouds", "", "Archive"]);
    });

    it("titles the body with the selected tab and switches on click", async () => {
        renderTabs(tabs);
        expect(screen.getByRole("heading")).toHaveTextContent("General");
        await userEvent.click(screen.getByText("Clouds"));
        expect(screen.getByRole("heading")).toHaveTextContent("Clouds");
        expect(screen.getByText("clouds body")).toBeInTheDocument();
        expect(router.get("tab")).toBe("clouds");
    });
});
