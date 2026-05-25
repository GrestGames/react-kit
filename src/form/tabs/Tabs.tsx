import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "../../router";
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

export function Tabs({urlKey, tabs, defaultTab = ""}: Props) {
    const {router} = useRouter();
    const [ready, setReady] = useState(false);

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
