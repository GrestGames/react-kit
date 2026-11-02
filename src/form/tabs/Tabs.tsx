import {Fragment, ReactNode, useEffect, useState} from "react";
import {useRouter, useRouteKey} from "../../router";
import "./Tabs.css"

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
    const tabItem = (val: Tab) => <div key={"tab-" + val.urlKey}
                                       className={"tab" + (val.urlKey === current ? " tabSelected" : "") + (val.danger ? " tabDanger" : "")}
                                       onClick={() => selectTab(val.urlKey)}>{val.title}</div>
    const body = <div className={(ready ? "tabsContentLoaded" : "tabsContentInit") + " tabsContent"}>
        {layout === "side" && <h2 className="tabsTitle">{tabsMap.get(current)?.title}</h2>}
        {getTabBody()}
    </div>

    if (layout === "side") {
        const main = visible.filter(t => !t.danger)
        const danger = visible.filter(t => t.danger)
        return <div className="tabsArea tabsSide">
            <nav className="tabsMenu">
                {main.map((t, i) => <Fragment key={"tab-" + t.urlKey}>
                    {t.group && t.group !== main[i - 1]?.group && <div className="tabsGroup">{t.group}</div>}
                    {tabItem(t)}
                </Fragment>)}
                {danger.length > 0 && <div className="tabsSpacer"/>}
                {danger.map(tabItem)}
            </nav>
            {body}
        </div>
    }

    return <div className="tabsArea">
        <div className="tabsMenu">
            {visible.map(tabItem)}
        </div>
        {body}
    </div>

}
