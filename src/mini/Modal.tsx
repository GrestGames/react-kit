import {ReactNode, useEffect, useId} from "react";
import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import {OverlayBand, overlayZ, useOverlayStack} from "./OverlayStack";

interface ModalProps {
    band: OverlayBand;
    order?: number;
    onDismiss?: () => void;
    lockScroll?: boolean;
    focusTrap?: boolean;
    fallbackZ: number | string;
    children: ReactNode;
}

export function Modal({band, order, onDismiss, lockScroll = true, focusTrap = true, fallbackZ, children}: ModalProps) {
    const stack = useOverlayStack();
    const id = useId();
    const register = stack?.register;
    const unregister = stack?.unregister;
    useEffect(() => {
        if (!register || !unregister) return;
        register(id, band, order ?? 0);
        return () => unregister(id);
    }, [register, unregister, id, band, order]);

    const z = stack ? overlayZ(stack.offsetOf(id)) : fallbackZ;
    const isTop = stack ? stack.isTop(id) : true;

    const {refs, context} = useFloating({open: true, onOpenChange: (open) => { if (!open) onDismiss?.(); }});
    const dismiss = useDismiss(context, {enabled: isTop && !!onDismiss, outsidePress: !!onDismiss, escapeKey: !!onDismiss});
    const role = useRole(context, {role: "dialog"});
    const {getFloatingProps} = useInteractions([dismiss, role]);

    return <FloatingPortal>
        {isTop && <FloatingOverlay lockScroll={lockScroll} style={{zIndex: z, background: "var(--rk-scrim)"}}/>}
        <FloatingFocusManager context={context} modal disabled={!isTop || !focusTrap}>
            <div ref={refs.setFloating} {...getFloatingProps()} style={{position: "relative", zIndex: z}}>
                {children}
            </div>
        </FloatingFocusManager>
    </FloatingPortal>;
}
