import {ReactNode, useId} from "react";
import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import {OverlayBand, overlayZ, useOverlaySlot} from "./OverlayStack";

interface ModalProps {
    band: OverlayBand;
    order?: number;
    onDismiss?: (event?: Event) => void;
    lockScroll?: boolean;
    focusTrap?: boolean;
    /** "dialog" focuses the dialog container itself: focus moves in without ringing any control. */
    initialFocus?: number | "dialog";
    labelledBy?: string;
    children: ReactNode;
}

export function Modal({band, order, onDismiss, lockScroll = true, focusTrap = true, initialFocus, labelledBy, children}: ModalProps) {
    const id = useId();
    const {offset, isTop, isTopModal} = useOverlaySlot(id, band, order ?? 0, true);
    const z = overlayZ(band, offset);

    const {refs, context} = useFloating({open: true, onOpenChange: (open, event) => { if (!open) onDismiss?.(event); }});
    const dismiss = useDismiss(context, {enabled: isTop && !!onDismiss});
    const role = useRole(context, {role: "dialog"});
    const {getFloatingProps} = useInteractions([dismiss, role]);

    return <FloatingPortal>
        <FloatingOverlay lockScroll={lockScroll && isTop} style={{zIndex: z, background: "var(--rk-scrim)"}}/>
        <FloatingFocusManager context={context} modal initialFocus={initialFocus === "dialog" ? refs.floating : initialFocus} disabled={!isTopModal || !focusTrap}>
            <div ref={refs.setFloating} {...getFloatingProps()} aria-labelledby={labelledBy} style={{position: "relative", zIndex: z, outline: "none"}}>
                {children}
            </div>
        </FloatingFocusManager>
    </FloatingPortal>;
}
