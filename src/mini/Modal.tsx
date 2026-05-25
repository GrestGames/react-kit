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
    onDismiss?: () => void;
    lockScroll?: boolean;
    focusTrap?: boolean;
    children: ReactNode;
}

export function Modal({band, order, onDismiss, lockScroll = true, focusTrap = true, children}: ModalProps) {
    const id = useId();
    const {offset, isTop} = useOverlaySlot(id, band, order ?? 0);
    const z = overlayZ(offset);

    const {refs, context} = useFloating({open: true, onOpenChange: (open) => { if (!open) onDismiss?.(); }});
    const dismiss = useDismiss(context, {enabled: isTop && !!onDismiss, outsidePress: !!onDismiss, escapeKey: !!onDismiss});
    const role = useRole(context, {role: "dialog"});
    const {getFloatingProps} = useInteractions([dismiss, role]);

    return <FloatingPortal>
        <FloatingOverlay lockScroll={lockScroll && isTop} style={{zIndex: z, background: "var(--rk-scrim)"}}/>
        <FloatingFocusManager context={context} modal disabled={!isTop || !focusTrap}>
            <div ref={refs.setFloating} {...getFloatingProps()} style={{position: "relative", zIndex: z}}>
                {children}
            </div>
        </FloatingFocusManager>
    </FloatingPortal>;
}
