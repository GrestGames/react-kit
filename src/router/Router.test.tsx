import {describe, it, expect, beforeEach, afterEach} from "vitest";
import {Router} from "./Router";

function setUrl(search: string) {
    window.history.replaceState({}, "", "/" + (search ? "?" + search : ""));
}

const routes = {
    "page=home": () => "home",
    "a=?": () => "a",
    "b=?": () => "b",
    "c=?": () => "c",
};

let router: Router;
afterEach(() => router?.destroy());

describe("Router open-key ordering", () => {
    beforeEach(() => setUrl(""));

    it("reads open keys from the URL in order", () => {
        setUrl("a=1&b=2");
        router = new Router(routes, "page=home");
        expect(router.getOpenKeys()).toEqual(["a", "b"]);
    });

    it("falls back to the default route when the URL is empty", () => {
        router = new Router(routes, "page=home");
        expect(router.getOpenKeys()).toEqual(["page"]);
    });

    it("appends a newly opened panel after the existing ones", () => {
        router = new Router(routes, "page=home");
        router.add({a: "1"});
        router.add({b: "2"});
        expect(router.getOpenKeys()).toEqual(["page", "a", "b"]);
    });

    it("reopening an already-open panel moves it to the top (end)", () => {
        setUrl("a=1&b=2&c=3");
        router = new Router(routes, "page=home");
        expect(router.getOpenKeys()).toEqual(["a", "b", "c"]);
        router.add({a: "9"});
        expect(router.getOpenKeys()).toEqual(["b", "c", "a"]);
    });

    it("removes only the closed key, preserving the rest of the order", () => {
        setUrl("a=1&b=2&c=3");
        router = new Router(routes, "page=home");
        router.remove("b");
        expect(router.getOpenKeys()).toEqual(["a", "c"]);
    });

    it("removes a key's registered child params in the same update", () => {
        setUrl("a=1");
        router = new Router(routes, "page=home");
        router.add({aTab: "two"});
        router.registerChildParam("a", "aTab");
        expect(router.get("aTab")).toEqual("two");
        router.remove("a");
        expect(router.get("a")).toBeUndefined();
        expect(router.get("aTab")).toBeUndefined();
    });

    it("does not touch child params once unregistered", () => {
        setUrl("a=1");
        router = new Router(routes, "page=home");
        router.add({aTab: "two"});
        router.registerChildParam("a", "aTab");
        router.unregisterChildParam("a", "aTab");
        router.remove("a");
        expect(router.get("aTab")).toEqual("two");
    });
});
