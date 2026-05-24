import {ToastLayer, ToastPosition} from "./Toast";
import {RkDialogLayer} from "./Dialog";
import {RkContextMenuHost} from "../menu/ContextMenu";

/** Single root-mounted host for all imperative overlays (toasts + dialogs + context menus).
 *  Mount once near the app root; `RkToast` / `RkAlert` / `RkConfirm` / `RkContextMenu`
 *  then work from anywhere. */
export function RkOverlayHost({position}: { position?: ToastPosition } = {}) {
    return <>
        <ToastLayer position={position}/>
        <RkDialogLayer/>
        <RkContextMenuHost/>
    </>;
}
