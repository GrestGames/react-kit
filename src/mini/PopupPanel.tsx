import {Panel} from "./Panel";
import {Modal} from "./Modal";
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

    const registerGuard = useCallback((fn: CloseGuardFn) => {
        guardsRef.current.add(fn);
        return () => { guardsRef.current.delete(fn); };
    }, []);

    const tryClose = useCallback(() => {
        for (const guard of guardsRef.current) {
            if (guard()) {
                setShowConfirm(true);
                return;
            }
        }
        onClose();
    }, [onClose]);

    const order = useOverlayOrder();

    return <Modal band="panel" order={order} onDismiss={tryClose}>
        <CloseGuardContext.Provider value={{register: registerGuard}}>
            <Panel title={title} subTitle={subTitle} style={style} width={width} onClickTitle={onClickTitle} onClose={tryClose}>
                {children}
            </Panel>
        </CloseGuardContext.Provider>

        {showConfirm && <>
            <div className="darkBackground" onClick={() => setShowConfirm(false)}/>
            <div className="confirmDialog">
                <button className="confirmDialogBtn confirmDialogCancel" onClick={() => setShowConfirm(false)}>Keep editing</button>
                <button className="confirmDialogBtn confirmDialogClose" onClick={onClose}>Close and lose changes</button>
            </div>
        </>}
    </Modal>;
}
