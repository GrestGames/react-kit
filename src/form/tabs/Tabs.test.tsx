import {afterEach, describe, expect, it} from "vitest";
import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Router, RouterProvider} from "../../router";
import {Tabs, type Props, type Tab} from "./Tabs";

let router: Router;
afterEach(() => router?.destroy());

function renderTabs(tabs: Tab[], layout: Props["layout"] = "side", url = "/") {
    window.history.replaceState({}, "", url);
    router = new Router({"tab=?": () => null}, "");
    return render(<RouterProvider router={router}><Tabs urlKey="tab" defaultTab="general" layout={layout} tabs={tabs}/></RouterProvider>);
}

const tabs: Tab[] = [
    {urlKey: "archive", title: "Archive", danger: true, body: () => "archive body"},
    {urlKey: "general", title: "General", group: "Basics", body: () => "general body"},
    {urlKey: "repos", title: "Repositories", group: "Basics", body: () => "repos body"},
    {urlKey: "clouds", title: "Clouds", group: "Infra", body: () => "clouds body"},
];

describe("Tabs side layout", () => {
    it("heads each group once and pins danger tabs to the bottom", () => {
        const {container} = renderTabs(tabs);
        const items = [...container.querySelectorAll(".tabsList > *")].map(e => e.textContent);
        expect(items).toEqual(["Basics", "General", "Repositories", "Infra", "Clouds", "", "Archive"]);
    });

    it("titles the body with the selected tab and switches on click", async () => {
        renderTabs(tabs);
        expect(screen.getByRole("heading")).toHaveTextContent("General");
        await userEvent.click(screen.getByRole("tab", {name: "Clouds"}));
        expect(screen.getByRole("heading")).toHaveTextContent("Clouds");
        expect(screen.getByRole("tabpanel")).toHaveTextContent("clouds body");
        expect(router.get("tab")).toBe("clouds");
    });

    it("puts the selected tab's actions on its title line", async () => {
        renderTabs([...tabs, {urlKey: "builds", title: "Builds", actions: () => <button>Open builds</button>, body: () => "builds body"}]);
        expect(screen.queryByRole("button", {name: "Open builds"})).toBeNull();
        await userEvent.click(screen.getByRole("tab", {name: "Builds"}));
        expect(screen.getByRole("heading").parentElement).toContainElement(screen.getByRole("button", {name: "Open builds"}));
    });

    it("moves with the arrow keys and wraps, keeping one tab in the tab order", async () => {
        renderTabs(tabs);
        const general = screen.getByRole("tab", {name: "General"});
        expect(general).toHaveAttribute("aria-selected", "true");
        expect(screen.getAllByRole("tab").filter(t => t.tabIndex === 0)).toEqual([general]);
        general.focus();
        await userEvent.keyboard("{ArrowDown}");
        expect(screen.getByRole("tab", {name: "Repositories"})).toHaveFocus();
        expect(router.get("tab")).toBe("repos");
        await userEvent.keyboard("{End}");
        expect(screen.getByRole("tab", {name: "Archive"})).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        expect(screen.getByRole("tab", {name: "General"})).toHaveFocus();
    });

    it("filters by title or group once there are more than 15 tabs", async () => {
        const many = Array.from({length: 16}, (_, i): Tab => ({urlKey: "t" + i, title: "Tab " + i, group: i < 8 ? "Alpha" : "Beta", body: () => "body " + i}));
        renderTabs(many);
        await userEvent.type(screen.getByRole("searchbox"), "beta");
        expect(screen.getAllByRole("tab")).toHaveLength(8);
        await userEvent.clear(screen.getByRole("searchbox"));
        await userEvent.type(screen.getByRole("searchbox"), "tab 12{Enter}");
        expect(screen.getAllByRole("tab").map(t => t.textContent)).toEqual(["Tab 12"]);
        expect(router.get("tab")).toBe("t12");
    });

    it("has no filter with 15 tabs or fewer", () => {
        renderTabs(tabs);
        expect(screen.queryByRole("searchbox")).toBeNull();
    });
});

describe("Tabs side layout on mobile", () => {
    const desktopWidth = window.innerWidth;
    afterEach(() => { window.innerWidth = desktopWidth; });

    it("lists the sections as plain buttons until one is picked, then shows it with a back button", async () => {
        window.innerWidth = 390;
        renderTabs(tabs);
        expect(screen.queryByRole("tab")).toBeNull();
        expect(screen.queryByRole("region")).toBeNull();
        await userEvent.click(screen.getByRole("button", {name: "General"}));
        expect(router.get("tab")).toBe("general");
        expect(screen.queryByRole("button", {name: "Repositories"})).toBeNull();
        expect(screen.getByRole("region", {name: "General"})).toHaveTextContent("general body");
        await userEvent.click(screen.getByRole("button", {name: "Back"}));
        await waitFor(() => expect(router.get("tab")).toBeFalsy());
        expect(screen.getByRole("button", {name: "General"})).toHaveFocus();
    });

    it("goes back through history, so browser back after Back doesn't reopen the section", async () => {
        window.innerWidth = 390;
        renderTabs(tabs);
        const depth = window.history.length;
        await userEvent.click(screen.getByRole("button", {name: "Clouds"}));
        await userEvent.click(screen.getByRole("button", {name: "Back"}));
        await waitFor(() => expect(router.get("tab")).toBeFalsy());
        expect(window.location.search).toBe("");
        expect(window.history.length).toBe(depth + 1);
    });

    it("returns to the list when another section was pushed after the one opened from it", async () => {
        window.innerWidth = 390;
        renderTabs(tabs);
        await userEvent.click(screen.getByRole("button", {name: "General"}));
        act(() => router.add({tab: "clouds"}));
        await userEvent.click(screen.getByRole("button", {name: "Back"}));
        expect(router.get("tab")).toBeFalsy();
        expect(screen.getByRole("button", {name: "Clouds"})).toBeInTheDocument();
    });

    it("opens a deep-linked section, whose back button returns to the list", async () => {
        window.innerWidth = 390;
        renderTabs(tabs, "side", "/?tab=clouds");
        expect(screen.getByRole("region", {name: "Clouds"})).toHaveTextContent("clouds body");
        await userEvent.click(screen.getByRole("button", {name: "Back"}));
        expect(router.get("tab")).toBeFalsy();
        expect(screen.getByRole("button", {name: "Clouds"})).toBeInTheDocument();
    });
});

describe("Tabs top layout", () => {
    it("is a horizontal tablist driven by left/right", async () => {
        renderTabs(tabs.filter(t => !t.danger), "top");
        screen.getByRole("tab", {name: "General"}).focus();
        await userEvent.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", {name: "Repositories"})).toHaveFocus();
        await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
        expect(screen.getByRole("tab", {name: "Clouds"})).toHaveFocus();
    });
});
