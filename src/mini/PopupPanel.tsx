import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import {overlayZ, useOverlayStack} from "./OverlayStack";
import {useRouteKey, useRouterOptional} from "../router";
import {createContext, CSSProperties, ReactNode, useCallback, useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";

type CloseGuardFn = () => boolean;

export const CloseGuardContext = createContext<{
    register: (fn: CloseGuardFn) => () => void;
}>({
    register: () => () => {},
});

export interface Props2 {
    title?: string;
    subTitle?: string;
    width: string;
    onClickTitle?: () => void;
    onClose: () => void
    children: ReactNode | ReactNode[]
    style?: CSSProperties;
}

export function PopupPanel({title, subTitle, width, onClickTitle, onClose, style, children}: Props2) {
    const guardsRef = useRef<Set<CloseGuardFn>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [clickPos, setClickPos] = useState<{x: number, y: number}>({x: 0, y: 0});

    const registerGuard = useCallback((fn: CloseGuardFn) => {
        guardsRef.current.add(fn);
        return () => { guardsRef.current.delete(fn); };
    }, []);

    const tryClose = useCallback((e?: React.MouseEvent) => {
        const pos = e ? {x: e.clientX, y: e.clientY} : {x: window.innerWidth / 2, y: window.innerHeight / 2};
        for (const guard of guardsRef.current) {
            if (guard()) {
                setClickPos(pos);
                setShowConfirm(true);
                return;
            }
        }
        onClose();
    }, [onClose]);

    // Stacking position comes from the router's URL order (last key = topmost), so reopening
    // an already-open panel raises it. Outside a RouterProvider it sorts after routed panels
    // by registration order; outside an OverlayStackProvider it falls back to legacy behavior.
    const stack = useOverlayStack();
    const routeKey = useRouteKey();
    const router = useRouterOptional();
    const id = useId();
    const idx = router && routeKey ? router.openKeys.indexOf(routeKey) : -1;
    const order = idx < 0 ? Number.MAX_SAFE_INTEGER : idx;

    const register = stack?.register;
    const unregister = stack?.unregister;
    useEffect(() => {
        if (!register || !unregister) return;
        register(id, order);
        return () => unregister(id);
    }, [register, unregister, id, order]);

    const panel = (zIndex?: number | string) => (
        <CloseGuardContext.Provider value={{register: registerGuard}}>
            <Panel title={title} subTitle={subTitle} style={style} width={width} zIndex={zIndex} onClickTitle={onClickTitle} onClose={tryClose}>
                {children}
            </Panel>
        </CloseGuardContext.Provider>
    );

    const confirm = (scrimZ?: number | string, dialogZ?: number | string) => showConfirm && (<>
        <DarkBackground zIndex={scrimZ ?? 400} onClick={() => setShowConfirm(false)}/>
        <div className="confirmDialog" style={dialogZ ? {...confirmPosition(clickPos), zIndex: dialogZ} : confirmPosition(clickPos)}>
            <button className="confirmDialogBtn confirmDialogCancel" onClick={() => setShowConfirm(false)}>Keep editing</button>
            <button className="confirmDialogBtn confirmDialogClose" onClick={onClose}>Close and lose changes</button>
        </div>
    </>);

    // Portal to <body>: the panel is a fixed-position, viewport-level overlay, so it must
    // escape any ancestor that establishes a containing block for fixed positioning. Dark mode
    // and theme tokens still apply, and React context is preserved across the portal.
    if (stack) {
        const offset = stack.offsetOf(id);
        return createPortal(<>
            {stack.isTop(id) && <DarkBackground zIndex={overlayZ(offset - 1)} onClick={tryClose}/>}
            {panel(overlayZ(offset))}
            {confirm(overlayZ(offset + 1), overlayZ(offset + 2))}
        </>, document.body);
    }

    return createPortal(<>
        <DarkBackground onClick={tryClose}/>
        {panel()}
        {confirm()}
    </>, document.body);
}

function confirmPosition(pos: {x: number, y: number}): CSSProperties {
    const pad = 16, btnH = 38, gap = 20;
    const w = pad * 2 + 210;   // padding + button width
    const h = pad * 2 + btnH * 2 + gap;
    const gapCenter = pad + btnH + gap / 2; // distance from top to middle of gap
    let x = pos.x - w / 2;
    let y = pos.y - gapCenter;
    x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - h - 8));
    return {left: x, top: y};
}
