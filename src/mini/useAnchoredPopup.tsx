import React, {ReactNode, useCallback, useRef, useState} from "react";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole,
    useTransitionStyles,
} from "@floating-ui/react";
import "./useAnchoredPopup.css";

export const ANIM_DURATION = 150;

const POPUP_PANEL_STYLE: React.CSSProperties = {
    background: "var(--rk-bg-surface)",
    border: "1px solid var(--rk-border)",
    borderRadius: 8,
    boxShadow: "var(--rk-shadow)",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

export interface AnchoredPopupConfig {
    deps?: any[];
    onOutsideClick?: () => void;
    excludeIds?: string[];
}

export interface AnchoredPopupResult {
    refs: ReturnType<typeof useFloating>["refs"];
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    Portal: (props: {children: ReactNode; style?: React.CSSProperties}) => ReactNode;
}

export function useAnchoredPopup(opts?: AnchoredPopupConfig): AnchoredPopupResult {
    const [isOpen, setIsOpen] = useState(false);

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        onOpenChange: (next) => {
            if (!next && opts?.onOutsideClick) {
                opts.onOutsideClick();
            } else {
                setIsOpen(next);
            }
        },
        strategy: "fixed",
        placement: "bottom",
        middleware: [offset(6), flip({padding: 8}), shift({padding: 8})],
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context, {keyboardHandlers: false});
    const dismiss = useDismiss(context);
    const role = useRole(context, {role: "dialog"});

    const {getReferenceProps, getFloatingProps} = useInteractions([click, dismiss, role]);

    const {isMounted, styles: transitionStyles} = useTransitionStyles(context, {
        duration: ANIM_DURATION,
        initial: {opacity: 0, transform: "scale(0.85)"},
    });

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);

    // A stable Portal identity is critical: floatingStyles/transitionStyles change every render
    // (autoUpdate), so a deps-driven useCallback would give <Portal> a new identity each render →
    // remount → setFloating(null) → infinite update loop. Keep deps empty; read live values from a ref.
    const live = useRef({isMounted, setFloating: refs.setFloating, floatingStyles, transitionStyles, getFloatingProps});
    live.current = {isMounted, setFloating: refs.setFloating, floatingStyles, transitionStyles, getFloatingProps};

    const Portal = useCallback(({children, style}: {children: ReactNode; style?: React.CSSProperties}) => {
        const l = live.current;
        if (!l.isMounted) return null;
        return (
            <FloatingPortal>
                {/* Outer div carries floating-ui's positioning (transform=translate); inner div
                    carries the panel look + the enter/exit transform=scale — separated so the two
                    transforms don't clash (a single element can't both translate and scale here). */}
                <div ref={l.setFloating} style={{...l.floatingStyles, zIndex: 10000}} {...l.getFloatingProps()}>
                    <div className="rkAnchoredPopup" style={{...POPUP_PANEL_STYLE, ...l.transitionStyles, ...style}}>
                        {children}
                    </div>
                </div>
            </FloatingPortal>
        );
    }, []);

    return {refs, isOpen, open, close, toggle, getReferenceProps, Portal};
}

export interface WrapWithPopupConfig {
    content: (close: () => void) => ReactNode;
    style?: React.CSSProperties;
}

/** Wrap an element with an anchored popup trigger, ToolTip-style ergonomic helper. */
export function wrapWithPopup(config: WrapWithPopupConfig, element: React.ReactElement): ReactNode {
    return <PopupWrapper config={config}>{element}</PopupWrapper>;
}

function PopupWrapper({config, children}: {config: WrapWithPopupConfig; children: React.ReactElement<Record<string, any>>}) {
    const {refs, close, toggle, getReferenceProps, Portal} = useAnchoredPopup();

    // Stable merged ref — an inline ref callback re-attaches every render, making floating-ui
    // thrash setReference into an infinite update loop once the popup mounts.
    const ref = useMergeRefs([refs.setReference, (children.props as any).ref]);

    // The button family calls onClick with no event, but floating-ui's reference onClick needs
    // one — so drive open/close with the event-less `toggle` (still running the trigger's own
    // onClick if it had one). getReferenceProps still supplies the aria/role wiring.
    const origOnClick = (children.props as any).onClick as (() => void) | undefined;
    const child = React.cloneElement(children, {
        ...getReferenceProps(children.props),
        onClick: () => { origOnClick?.(); toggle(); },
        ref,
    });

    return <>
        {child}
        <Portal style={config.style}>{config.content(close)}</Portal>
    </>;
}
