import {ReactNode, useEffect, useState} from "react";
import "./Tabs.css"

export interface Props {
    urlKey: string;
    tabs: Tab[]
    defaultTab?: string;
}

export interface Tab {
    urlKey: string;
    title: string;
    isVisible?: boolean
    body: () => ReactNode | ReactNode[];
}

let clearUrl: any = undefined;

export function Tabs({urlKey, tabs, defaultTab = ""}: Props) {
    const [selectedTab, setSelectedTab] = useState(undefined);
    const [ready, setReady] = useState(false);

    const tabsMap = new Map();
    tabs.forEach((tab) => {
        if (tab) {
            if (tab.isVisible === undefined) {
                tab.isVisible = true;
            }
            tabsMap.set(tab.urlKey, tab);
        }
    })

    const checkTab = () => {
        const url = new URL(window.location.href);
        const selectedTab = url.searchParams.get(urlKey);
        if (selectedTab) {
            setSelectedTab(selectedTab)
        } else {
            setSelectedTab(defaultTab)
        }
    }

    useEffect(() => {
        window.addEventListener("urlChanged", checkTab)
        return () => {
            window.removeEventListener("urlChanged", checkTab);
        }
    })
    useEffect(() => {
        setReady(true)
    }, [selectedTab]);

    useEffect(() => {
        checkTab();
        if (clearUrl) {
            clearTimeout(clearUrl);
            clearUrl = undefined;
        }
        return () => {
            clearUrl = setTimeout(() => {
                const url = new URL(window.location.href);
                url.searchParams.delete(urlKey);
                window.history.replaceState({path: url.toString()}, '', url.toString());
            }, 1)
        }
    }, [])

    const selectTab = (key: string) => {
        if (selectedTab === key) {
            return;
        }
        setReady(false);
        setSelectedTab(key);
        const url = new URL(window.location.href);
        if (key) {
            url.searchParams.set(urlKey, key)
        } else {
            url.searchParams.delete(urlKey);
        }
        window.history.pushState({path: url.toString()}, '', url.toString());
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

    return <div className="tabsArea">
        <div className="tabsMenu">
            {tabs.map((val) => {
                if (val && val.isVisible) {
                    return <div key={"tab-" + val.urlKey} className={"tab " + (val.urlKey === selectedTab ? "tabSelected" : "")} onClick={() => selectTab(val.urlKey)}>{val.title}</div>
                } else {
                    return undefined
                }
            })}
        </div>
        <div className={(ready ? "tabsContentLoaded" : "tabsContentInit") + " tabsContent"}>
            {getTabBody()}
        </div>
    </div>

}

