import {ReactElement, ReactNode, createContext, useContext, useEffect, useState} from "react";
import {Router} from "./Router";
import {OverlayOrderContext} from "../mini/OverlayStack";

interface RouterContextValue {
    router: Router;
    openKeys: string[];
    elements: ReactNode[];
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({router, children}: {router: Router; children?: ReactNode}) {
    const [snap, setSnap] = useState(() => ({elements: router.getElements(), openKeys: router.getOpenKeys()}));
    useEffect(() => {
        router.setCallback((elements, openKeys) => setSnap({elements, openKeys}));
        setSnap({elements: router.getElements(), openKeys: router.getOpenKeys()});
        return () => router.setCallback(undefined);
    }, [router]);
    return <RouterContext.Provider value={{router, ...snap}}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
    const ctx = useContext(RouterContext);
    if (!ctx) throw new Error("useRouter must be used within <RouterProvider>");
    return ctx;
}

export function useRouterOptional(): RouterContextValue | undefined {
    return useContext(RouterContext);
}

export function RouterOutlet() {
    const {elements} = useRouter();
    return <>{elements.map((el, i) =>
        <OverlayOrderContext.Provider key={(el as ReactElement).key ?? i} value={i}>
            {el}
        </OverlayOrderContext.Provider>,
    )}</>;
}
