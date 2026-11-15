import {Fragment, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState} from "react";
import {useRouter, useRouteKey} from "../../router";
import {useIsMobile} from "../../responsive/useResponsive";
import "./Tabs.css"

/** The side layout gets a filter box above this many visible tabs. */
const SEARCH_FROM = 15;

export interface Props {
    urlKey: string;
    tabs: Tab[]
    defaultTab?: string;
    /** "side": a compact left nav with `group` headings and the selected tab's title above its body.
     *  On mobile it drills down instead: the nav full-width until a tab is picked, then that tab with a back row. */
    layout?: "top" | "side";
}

export interface Tab {
    urlKey: string;
    title: string;
    /** Shown before the title; sized by the caller (16px suits the side layout). */
    icon?: ReactNode;
    isVisible?: boolean
    /** Side layout: heading over consecutive tabs with the same group. */
    group?: string;
    /** Red title; in the side layout it is pinned to the bottom of the nav. */
    danger?: boolean;
    /** Side layout: shown at the right end of the selected tab's title line. */
    actions?: () => ReactNode;
    body: () => ReactNode | ReactNode[];
}

export function Tabs({urlKey, tabs, defaultTab = "", layout = "top"}: Props) {
    const {router} = useRouter();
    const routeKey = useRouteKey();
    const [ready, setReady] = useState(false);
    const [filter, setFilter] = useState("");
    const baseId = useId();
    const isMobile = useIsMobile();
    const areaRef = useRef<HTMLDivElement>(null);
    // The section opened from the mobile list: Back pops its history entry and refocuses its row.
    const openedFrom = useRef<string | undefined>(undefined);

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

    const urlTab: string | undefined = router.get(urlKey);
    const selectedTab = urlTab || defaultTab;
    const side = layout === "side"
    const drill = side && isMobile
    // The url param, not `selectedTab`: on mobile the default tab must not hide the section list.
    const drilled = drill && !!urlTab && tabsMap.has(urlTab)

    useEffect(() => {
        setReady(true)
    }, [selectedTab]);

    useEffect(() => {
        if (!openedFrom.current) return;
        if (drilled) {
            areaRef.current?.scrollIntoView({block: "start"});
        } else {
            document.getElementById(tabId(openedFrom.current))?.focus();
            openedFrom.current = undefined;
        }
    }, [drilled]);

    const selectTab = (key: string) => {
        if (selectedTab === key) {
            return;
        }
        setReady(false);
        if (key) router.add({[urlKey]: key});
        else router.remove(urlKey);
    }
    const openSection = (key: string) => {
        openedFrom.current = key;
        router.add({[urlKey]: key});
    }
    const back = () => {
        if (openedFrom.current) window.history.back();
        else router.remove(urlKey);
    }
    const pick = drill ? openSection : selectTab

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
        const selected = val.urlKey === current && !drill
        const tabProps = drill ? {} : {role: "tab", "aria-selected": selected, "aria-controls": `${baseId}-panel`, tabIndex: val.urlKey === focusKey ? 0 : -1}
        return <button key={"tab-" + val.urlKey} type="button" id={tabId(val.urlKey)} {...tabProps}
                       className={"tab" + (selected ? " tabSelected" : "") + (val.danger ? " tabDanger" : "")}
                       onClick={() => pick(val.urlKey)}>
            {val.icon && <span className="tabIcon" aria-hidden>{val.icon}</span>}
            <span className="tabLabel">{val.title}</span>
        </button>
    }
    const body = <div id={`${baseId}-panel`} role={drilled ? "region" : "tabpanel"} aria-labelledby={drilled ? `${baseId}-title` : tabId(current)}
                      className={(ready ? "tabsContentLoaded" : "tabsContentInit") + " tabsContent"}>
        {side && <div className="tabsTitleRow">
            {drilled && <button type="button" className="tabsBack" aria-label="Back" onClick={back}>‹</button>}
            <h2 id={`${baseId}-title`} className="tabsTitle">{tabsMap.get(current)?.title}</h2>
            <div className="tabsTitleActions">{tabsMap.get(current)?.actions?.()}</div>
        </div>}
        {getTabBody()}
    </div>

    if (side) {
        if (drilled) {
            return <div ref={areaRef} className="tabsArea tabsSide tabsDrill">{body}</div>
        }
        return <div className={"tabsArea tabsSide" + (drill ? " tabsDrill" : "")}>
            <nav className="tabsMenu">
                {visible.length > SEARCH_FROM && <input className="tabsFilter" type="search" placeholder="Filter" aria-label="Filter sections"
                                                        value={filter} onChange={e => setFilter(e.target.value)}
                                                        onKeyDown={e => { if (e.key === "Enter" && order[0]) { e.preventDefault(); pick(order[0].urlKey) } }}/>}
                <div role={drill ? undefined : "tablist"} aria-orientation={drill ? undefined : "vertical"} className="tabsList" onKeyDown={drill ? undefined : onKeyDown}>
                    {main.map((t, i) => <Fragment key={"tab-" + t.urlKey}>
                        {t.group && t.group !== main[i - 1]?.group && <div className="tabsGroup" role="presentation">{t.group}</div>}
                        {tabItem(t)}
                    </Fragment>)}
                    {danger.length > 0 && <div className="tabsSpacer" role="presentation"/>}
                    {danger.map(tabItem)}
                </div>
            </nav>
            {!drill && body}
        </div>
    }

    return <div className="tabsArea">
        <div className="tabsMenu" role="tablist" onKeyDown={onKeyDown}>
            {visible.map(tabItem)}
        </div>
        {body}
    </div>

}
