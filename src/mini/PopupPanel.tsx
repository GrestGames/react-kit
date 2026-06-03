import {Panel} from "./Panel";
import {Modal} from "./Modal";
import {Button} from "../form/buttons/Button";
import {useOverlayOrder} from "./OverlayStack";
import {createContext, CSSProperties, ReactNode, useCallback, useRef, useState} from "react";

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

    const tryClose = useCallback((e?: Event) => {
        const me = e as MouseEvent | undefined;
        const pos = typeof me?.clientX === "number" && typeof me?.clientY === "number"
            ? {x: me.clientX, y: me.clientY}
            : {x: window.innerWidth / 2, y: window.innerHeight / 2};
        for (const guard of guardsRef.current) {
            if (guard()) {
                setClickPos(pos);
                setShowConfirm(true);
                return;
            }
        }
        onClose();
    }, [onClose]);

    const order = useOverlayOrder();

    // Panel already scroll-locks via useDisableMainPage; FloatingOverlay's lockScroll would
    // double-lock and add a spurious body padding-right (the app forces html overflow-y:scroll,
    // so its scrollbar never disappears), shifting the page left and forcing a horizontal scrollbar.
    return <Modal band="panel" order={order} onDismiss={tryClose} lockScroll={false}>
        <CloseGuardContext.Provider value={{register: registerGuard}}>
            <Panel title={title} subTitle={subTitle} style={style} width={width} onClickTitle={onClickTitle} onClose={tryClose}>
                {children}
            </Panel>
        </CloseGuardContext.Provider>

        {showConfirm && <>
            <div className="darkBackground" onClick={() => setShowConfirm(false)}/>
            <div className="confirmDialog" style={confirmPosition(clickPos)}>
                <Button intent="neutral" onClick={() => setShowConfirm(false)}>Keep editing</Button>
                <Button intent="danger" onClick={onClose}>Close and lose changes</Button>
            </div>
        </>}
    </Modal>;
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
