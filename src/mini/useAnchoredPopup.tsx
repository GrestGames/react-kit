import React, {ReactNode, useCallback, useState} from "react";
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
    useRole,
    useTransitionStyles,
} from "@floating-ui/react";
import "./useAnchoredPopup.css";

export const ANIM_DURATION = 150;

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

    const click = useClick(context);
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

    const popupBaseStyle: React.CSSProperties = {
        position: "fixed",
        zIndex: 10000,
        background: "var(--rk-bg-surface)",
        border: "1px solid var(--rk-border)",
        borderRadius: 8,
        boxShadow: "var(--rk-shadow)",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    };

    const Portal = useCallback(({children, style}: {children: ReactNode; style?: React.CSSProperties}) => {
        if (!isMounted) return null;
        return (
            <FloatingPortal>
                <div
                    ref={refs.setFloating}
                    style={{...popupBaseStyle, ...floatingStyles, ...style, ...transitionStyles}}
                    className="rkAnchoredPopup"
                    {...getFloatingProps()}
                >
                    {children}
                </div>
            </FloatingPortal>
        );
    }, [isMounted, refs.setFloating, floatingStyles, getFloatingProps, transitionStyles]);

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
    const {refs, close, getReferenceProps, Portal} = useAnchoredPopup();

    const refCallback = (node: HTMLElement | null) => {
        refs.setReference(node);
        const origRef = (children.props as any).ref;
        if (typeof origRef === "function") origRef(node);
        else if (origRef) origRef.current = node;
    };

    const child = React.cloneElement(children, {
        ...getReferenceProps(children.props),
        ref: refCallback,
    });

    return <>
        {child}
        <Portal style={config.style}>{config.content(close)}</Portal>
    </>;
}
