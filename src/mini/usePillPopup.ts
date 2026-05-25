import {useAnchoredPopup, ANIM_DURATION as _ANIM_DURATION} from "./useAnchoredPopup";
import React, {useRef} from "react";

/** @deprecated Use `useAnchoredPopup` instead. */
export const ANIM_DURATION = _ANIM_DURATION;

/** @deprecated Use `useAnchoredPopup` instead. The `btnRef` is now an `HTMLButtonElement` ref
 *  (chips are real `<button>`s). Attach it via `ref` on the trigger element, or switch to
 *  `useAnchoredPopup` for full floating-ui control. */
export function usePillPopup(opts?: { deps?: any[], onOutsideClick?: () => void, excludeIds?: string[] }) {
    const {refs, isOpen, open, close, toggle, getReferenceProps, Portal} = useAnchoredPopup(opts);

    // Provide a ref-object shim that tracks the reference element for callers
    // that still read btnRef.current. The real anchor is via refs.setReference.
    const btnRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const combinedSetReference = (node: HTMLButtonElement | null) => {
        (btnRef as React.RefObject<HTMLButtonElement | null>).current = node;
        refs.setReference(node);
    };

    return {
        btnRef: {current: btnRef.current, setReference: combinedSetReference} as any,
        popupRef,
        isOpen,
        open,
        close,
        toggle,
        Portal,
        getReferenceProps,
    };
}
