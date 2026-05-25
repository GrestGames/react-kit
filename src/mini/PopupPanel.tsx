import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import {createContext, CSSProperties, ReactNode, useCallback, useRef, useState} from "react";
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

export function PopupPanel<T>({title, subTitle, width, onClickTitle, onClose, style, children}: Props2) {
    const guardsRef = useRef<Set<CloseGuardFn>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [clickPos, setClickPos] = useState<{x: number, y: number}>({x: 0, y: 0});

    const register = useCallback((fn: CloseGuardFn) => {
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

    // Portal to <body>: the panel is a fixed-position, viewport-level overlay, so
    // it must escape any ancestor that establishes a containing block for fixed
    // positioning (a transform/filter/contain — e.g. an animated slide), which
    // would otherwise trap it inside that box. Dark mode (rk-dark on <html>) and
    // theme tokens (:root) still apply, and React context is preserved across portals.
    return createPortal(<>
        <DarkBackground onClick={tryClose}/>
        <CloseGuardContext.Provider value={{register}}>
            <Panel title={title} subTitle={subTitle} style={style} width={width} onClickTitle={onClickTitle} onClose={tryClose}>
                {children}
            </Panel>
        </CloseGuardContext.Provider>

        {showConfirm && <>
            <DarkBackground zIndex={400} onClick={() => setShowConfirm(false)}/>
            <div className="confirmDialog" style={confirmPosition(clickPos)}>
                <button className="confirmDialogBtn confirmDialogCancel" onClick={() => setShowConfirm(false)}>Keep editing</button>
                <button className="confirmDialogBtn confirmDialogClose" onClick={onClose}>Close and lose changes</button>
            </div>
        </>}
    </>, document.body)
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
