import {ToastLayer, ToastPosition} from "./Toast";
import {RkDialogLayer} from "./Dialog";
import {RkContextMenuHost} from "../menu/ContextMenu";

export function RkOverlayHost({position}: { position?: ToastPosition } = {}) {
    return <>
        <ToastLayer position={position}/>
        <RkDialogLayer/>
        <RkContextMenuHost/>
    </>;
}
