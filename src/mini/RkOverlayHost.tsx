import {ToastLayer, ToastPosition} from "./Toast";
import {RkDialogLayer} from "./Dialog";

/** Single root-mounted host for all imperative overlays (toasts + dialogs).
 *  Mount once near the app root; `RkToast` / `RkAlert` / `RkConfirm` then work
 *  from anywhere. */
export function RkOverlayHost({position}: { position?: ToastPosition } = {}) {
    return <>
        <ToastLayer position={position}/>
        <RkDialogLayer/>
    </>;
}
