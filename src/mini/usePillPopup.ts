import React, {useState, useRef, useEffect, useLayoutEffect, useCallback} from "react";
import {createPortal} from "react-dom";
import {useOutsideClick} from "../helpers/useOutsideClick";

export const ANIM_DURATION = 150;

const popupStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

export function usePillPopup(opts?: { deps?: any[], onOutsideClick?: () => void, excludeIds?: string[] }) {
    const btnRef = useRef<HTMLSpanElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [animState, setAnimState] = useState<"entering" | "open" | "leaving">("open");
    const [pos, setPos] = useState<{top: number, left: number}>({top: -9999, left: -9999});
    const onOutsideClickRef = useRef(opts?.onOutsideClick);
    onOutsideClickRef.current = opts?.onOutsideClick;
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const open = useCallback(() => {
        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
        setPos({top: -9999, left: -9999});
        setIsOpen(true);
        setVisible(true);
        setAnimState("entering");
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimState("open")));
    }, []);

    const close = useCallback(() => {
        setAnimState("leaving");
        closeTimerRef.current = setTimeout(() => {
            setIsOpen(false);
            setVisible(false);
            setAnimState("open");
            closeTimerRef.current = null;
        }, ANIM_DURATION);
    }, []);

    const toggle = useCallback(() => {
        if (isOpen) close(); else open();
    }, [isOpen, open, close]);

    // Cleanup timer on unmount
    useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

    // Close on outside click
    useOutsideClick([popupRef, btnRef], () => {
        if (onOutsideClickRef.current) {
            onOutsideClickRef.current();
        } else {
            close();
        }
    }, {active: visible, excludeIds: opts?.excludeIds});

    // Position popup centered on button
    useLayoutEffect(() => {
        if (!visible || !popupRef.current || !btnRef.current) return;
        const btn = btnRef.current.getBoundingClientRect();
        const el = popupRef.current;
        const pw = el.offsetWidth;
        const ph = el.offsetHeight;
        const margin = 8;
        let left = btn.left + btn.width / 2 - pw / 2;
        let top = btn.top + btn.height / 2 - ph / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));
        top = Math.max(46, Math.min(top, window.innerHeight - ph - margin));
        setPos({top, left});
    }, [visible, ...(opts?.deps || [])]);

    const transform =
        animState === "entering" ? "scale(0.3)" :
        animState === "leaving" ? "scale(0.3)" :
        "scale(1)";

    const computedStyle: React.CSSProperties = {
        ...popupStyle,
        top: pos.top,
        left: pos.left,
        transform,
        opacity: animState === "open" ? 1 : 0,
        transition: `transform ${ANIM_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${ANIM_DURATION}ms ease`,
    };

    const Portal = useCallback(({children, style}: {children: React.ReactNode, style?: React.CSSProperties}) => {
        return createPortal(
            React.createElement("div", {ref: popupRef, style: style ? {...computedStyle, ...style} : computedStyle}, children),
            document.body
        );
    }, [computedStyle]);

    return {btnRef, popupRef, isOpen: visible, open, close, toggle, Portal};
}
