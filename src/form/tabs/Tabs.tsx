import {Fragment, KeyboardEvent, ReactNode, useEffect, useId, useState} from "react";
import {useRouter, useRouteKey} from "../../router";
import "./Tabs.css"

/** The side layout gets a filter box above this many visible tabs. */
const SEARCH_FROM = 15;

export interface Props {
    urlKey: string;
    tabs: Tab[]
    defaultTab?: string;
    /** "side": a compact left nav with `group` headings and the selected tab's title above its body. */
    layout?: "top" | "side";
}

export interface Tab {
    urlKey: string;
    title: string;
    isVisible?: boolean
    /** Side layout: heading over consecutive tabs with the same group. */
    group?: string;
    /** Red title; in the side layout it is pinned to the bottom of the nav. */
    danger?: boolean;
    body: () => ReactNode | ReactNode[];
}

export function Tabs({urlKey, tabs, defaultTab = "", layout = "top"}: Props) {
    const {router} = useRouter();
    const routeKey = useRouteKey();
    const [ready, setReady] = useState(false);
    const [filter, setFilter] = useState("");
    const baseId = useId();

    // Scope this tab's url param to the route it lives under (e.g. a popup), so
    // closing that route also clears the tab param instead of orphaning it.
    useEffect(() => {
        if (!routeKey) return undefined;
        router.registerChildParam(routeKey, urlKey);
        return () => router.unregisterChildParam(routeKey, urlKey);
    }, [router, routeKey, urlKey]);

    const tabsMap = new Map<string, Tab>();
    tabs.forEach((tab) => {
        if (tab) {
            if (tab.isVisible === undefined) {
                tab.isVisible = true;
            }
            tabsMap.set(tab.urlKey, tab);
        }
    })

    const selectedTab = (router.get(urlKey) as string) || defaultTab;

    useEffect(() => {
        setReady(true)
    }, [selectedTab]);

    const selectTab = (key: string) => {
        if (selectedTab === key) {
            return;
        }
        setReady(false);
        if (key) router.add({[urlKey]: key});
        else router.remove(urlKey);
    }

    function getTabBody() {
        try {
            let tab = tabsMap.get(defaultTab);
            if (tabsMap.has(selectedTab)) {
                tab = tabsMap.get(selectedTab);
            }
            return tab?.body()
        } catch (e) {
            console.error(e);
            return <></>
        }
    }

    const current = tabsMap.has(selectedTab) ? selectedTab : defaultTab
    const visible = tabs.filter(t => t && t.isVisible)
    const side = layout === "side"
    const needle = side && visible.length > SEARCH_FROM ? filter.trim().toLowerCase() : ""
    const shown = needle ? visible.filter(t => t.title.toLowerCase().includes(needle) || t.group?.toLowerCase().includes(needle)) : visible
    const main = side ? shown.filter(t => !t.danger) : shown
    const danger = side ? shown.filter(t => t.danger) : []
    const order = [...main, ...danger]
    const tabId = (key: string) => `${baseId}-tab-${key}`
    const focusKey = order.some(t => t.urlKey === current) ? current : order[0]?.urlKey

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        const i = order.findIndex(t => t.urlKey === current)
        const prev = side ? "ArrowUp" : "ArrowLeft", next = side ? "ArrowDown" : "ArrowRight"
        const to = e.key === prev ? order[(i - 1 + order.length) % order.length]
            : e.key === next ? order[(i + 1) % order.length]
            : e.key === "Home" ? order[0]
            : e.key === "End" ? order[order.length - 1]
            : undefined
        if (!to || !(e.target as HTMLElement).matches("[role=tab]")) return
        e.preventDefault()
        selectTab(to.urlKey)
        document.getElementById(tabId(to.urlKey))?.focus()
    }

    const tabItem = (val: Tab) => {
        const selected = val.urlKey === current
        return <button key={"tab-" + val.urlKey} type="button" role="tab" id={tabId(val.urlKey)}
                       aria-selected={selected} aria-controls={`${baseId}-panel`} tabIndex={val.urlKey === focusKey ? 0 : -1}
                       className={"tab" + (selected ? " tabSelected" : "") + (val.danger ? " tabDanger" : "")}
                       onClick={() => selectTab(val.urlKey)}>{val.title}</button>
    }
    const body = <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={tabId(current)}
                      className={(ready ? "tabsContentLoaded" : "tabsContentInit") + " tabsContent"}>
        {side && <h2 className="tabsTitle">{tabsMap.get(current)?.title}</h2>}
        {getTabBody()}
    </div>

    if (side) {
        return <div className="tabsArea tabsSide">
            <nav className="tabsMenu">
                {visible.length > SEARCH_FROM && <input className="tabsFilter" type="search" placeholder="Filter" aria-label="Filter sections"
                                                        value={filter} onChange={e => setFilter(e.target.value)}
                                                        onKeyDown={e => { if (e.key === "Enter" && order[0]) { e.preventDefault(); selectTab(order[0].urlKey) } }}/>}
                <div role="tablist" aria-orientation="vertical" className="tabsList" onKeyDown={onKeyDown}>
                    {main.map((t, i) => <Fragment key={"tab-" + t.urlKey}>
                        {t.group && t.group !== main[i - 1]?.group && <div className="tabsGroup" role="presentation">{t.group}</div>}
                        {tabItem(t)}
                    </Fragment>)}
                    {danger.length > 0 && <div className="tabsSpacer" role="presentation"/>}
                    {danger.map(tabItem)}
                </div>
            </nav>
            {body}
        </div>
    }

    return <div className="tabsArea">
        <div className="tabsMenu" role="tablist" onKeyDown={onKeyDown}>
            {visible.map(tabItem)}
        </div>
        {body}
    </div>

}
