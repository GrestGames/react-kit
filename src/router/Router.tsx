import {ReactNode, createContext, useContext} from "react";

export interface RouteArgs {
    [key: string]: string | number;
}

export interface Routes {
    [key: string]: (...args: any[]) => ReactNode;
}

interface ParsedRoute {
    args: {key: string; value: string; isOptional: boolean}[];
    display: (...args: any[]) => ReactNode;
}

export const RouteKeyContext = createContext<string | undefined>(undefined);
export const useRouteKey = () => useContext(RouteKeyContext);

export type RouterCallback = (elements: ReactNode[], openKeys: string[]) => void;

export class Router {
    private readonly routes: ParsedRoute[] = [];
    private readonly seenVariables = new Set<string>();
    private readonly defaultRoute?: RouteArgs;

    private routeArgs: RouteArgs = {};
    private _callback?: RouterCallback;
    private elements: ReactNode[] = [];
    private openKeys: string[] = [];

    private isCtrlDown = false;

    private readonly onPopState = () => {
        const url = new URL(window.location.href);
        const next: RouteArgs = {};
        url.searchParams.forEach((value, key) => { next[key] = value; });
        this.updateRoutes(next, false);
    };
    private readonly onKeyDown = (e: KeyboardEvent) => { if (e.ctrlKey) this.isCtrlDown = true; };
    private readonly onKeyUp = (e: KeyboardEvent) => { if (!e.ctrlKey) this.isCtrlDown = false; };
    private readonly clearCtrl = () => { this.isCtrlDown = false; };

    constructor(routes: Routes, defaultRoute: string) {
        window.addEventListener("popstate", this.onPopState);
        document.body.addEventListener("keydown", this.onKeyDown);
        document.body.addEventListener("keyup", this.onKeyUp);
        document.body.addEventListener("blur", this.clearCtrl);
        document.body.addEventListener("mouseout", this.clearCtrl);

        for (const route in routes) {
            const args: ParsedRoute["args"] = [];
            for (const part of route.split("&")) {
                const [key, value] = part.split("=");
                const isOptional = key.endsWith("?");
                args.push({key: isOptional ? key.slice(0, -1) : key, value, isOptional});
                this.seenVariables.add(isOptional ? key.slice(0, -1) : key);
            }
            this.routes.push({args, display: routes[route]});
        }

        if (defaultRoute) {
            const [k, v] = defaultRoute.split("=");
            this.defaultRoute = {[k]: v};
        }

        const initial: RouteArgs = {};
        new URL(window.location.href).searchParams.forEach((value, key) => {
            if (this.seenVariables.has(key)) initial[key] = value;
        });
        this.updateRoutes(initial);
    }

    destroy() {
        window.removeEventListener("popstate", this.onPopState);
        document.body.removeEventListener("keydown", this.onKeyDown);
        document.body.removeEventListener("keyup", this.onKeyUp);
        document.body.removeEventListener("blur", this.clearCtrl);
        document.body.removeEventListener("mouseout", this.clearCtrl);
        this._callback = undefined;
    }

    getElements(): ReactNode[] { return this.elements; }
    getOpenKeys(): string[] { return this.openKeys; }
    setCallback(callback?: RouterCallback) { this._callback = callback; }

    get(key: string): any { return this.routeArgs[key]; }
    set(params: RouteArgs) { this.updateRoutes(params); }
    add(params: RouteArgs) {
        const copy = {...this.routeArgs};
        for (const k in params) delete copy[k];
        this.updateRoutes(Object.assign(copy, params));
    }
    remove(...keys: string[]) {
        const next = {...this.routeArgs};
        keys.forEach((k) => delete next[k]);
        this.updateRoutes(next);
    }
    reset() { this.updateRoutes({}); }
    reload() { window.location.reload(); }

    considerOpeningNewWindow(newRoutes: RouteArgs): boolean {
        if (!this.isCtrlDown) return false;
        const a = document.createElement("a");
        a.href = this.makeNewUrl(this.routeArgs, newRoutes);
        a.target = "_blank";
        a.click();
        return true;
    }

    private updateRoutes(newRoutes: RouteArgs, pushState = true) {
        if (this.considerOpeningNewWindow(newRoutes)) return;

        if (this.defaultRoute && Object.keys(newRoutes).length === 0) {
            newRoutes = this.defaultRoute;
        }

        Object.freeze(newRoutes);
        const url = this.makeNewUrl(this.routeArgs, newRoutes);
        this.routeArgs = newRoutes;
        if (pushState) window.history.pushState({path: url}, "", url);

        this.elements = [];
        this.openKeys = [];
        for (const k in this.routeArgs) {
            for (let i = 0; i < this.routes.length; i++) {
                const route = this.routes[i];
                if (route.args[0].key !== k) continue;
                const node = this.matchRoute(this.routeArgs, route);
                if (node) {
                    this.openKeys.push(k);
                    this.elements.push(
                        <RouteKeyContext.Provider key={i} value={k}>{node}</RouteKeyContext.Provider>,
                    );
                    break;
                }
            }
        }

        this._callback?.(this.elements, this.openKeys);
        window.dispatchEvent(new Event("urlChanged"));
    }

    private matchRoute(args: RouteArgs, route: ParsedRoute): ReactNode | undefined {
        const callArgs: any[] = [];
        for (const arg of route.args) {
            if (!arg.isOptional && args[arg.key] === undefined) return undefined;
            if (arg.value === "?" || args[arg.key] === arg.value) {
                callArgs.push(args[arg.key]);
            } else {
                return undefined;
            }
        }
        return route.display(...callArgs);
    }

    private makeNewUrl(oldRoutes: RouteArgs, newRoutes: RouteArgs): string {
        const url = new URL(window.location.href);
        for (const k in oldRoutes) url.searchParams.delete(k);
        for (const k in newRoutes) url.searchParams.set(k, String(newRoutes[k]));
        return url.toString();
    }
}
