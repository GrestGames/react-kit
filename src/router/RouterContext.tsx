import {ReactElement, ReactNode, createContext, useContext, useEffect, useState} from "react";
import {Router} from "./Router";
import {OverlayOrderContext} from "../mini/OverlayStack";

interface RouterContextValue {
    router: Router;
    /** Open route keys in URL order — last is topmost. */
    openKeys: string[];
    elements: ReactNode[];
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

/** Subscribes to a `Router` and republishes its matched elements + ordered open keys to
 *  descendants. The overlay stack reads `openKeys` to assign z-index by URL order. */
export function RouterProvider({router, children}: {router: Router; children?: ReactNode}) {
    const [snap, setSnap] = useState(() => ({elements: router.getElements(), openKeys: router.getOpenKeys()}));
    useEffect(() => {
        router.setCallback((elements, openKeys) => setSnap({elements, openKeys}));
        // The router may have navigated between construction and this effect.
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

/** Like `useRouter` but returns `undefined` when there's no `RouterProvider` above —
 *  for primitives (e.g. PopupPanel) that work both inside and outside a router. */
export function useRouterOptional(): RouterContextValue | undefined {
    return useContext(RouterContext);
}

/** Renders the currently-matched routed views in URL order. Each view is tagged with its
 *  position via `OverlayOrderContext`, so any `PopupPanel` inside stacks by URL order (and a
 *  reopened panel — moved to the end of the URL — raises) without the panel knowing about routing.
 *  The wrapper key is the element's stable route key, so reordering preserves instances. */
export function RouterOutlet() {
    const {elements} = useRouter();
    return <>{elements.map((el, i) =>
        <OverlayOrderContext.Provider key={(el as ReactElement).key ?? i} value={i}>
            {el}
        </OverlayOrderContext.Provider>,
    )}</>;
}
