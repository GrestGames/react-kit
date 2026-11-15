import { useState, useEffect, useRef, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useResponsive() {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return { width, isMobile: width < MOBILE_BREAKPOINT };
}

export function useIsMobile(): boolean {
    return useResponsive().isMobile;
}

/** Whether the element given to the returned ref is narrower than `px`, decided before paint and kept current
 *  as it resizes. `undefined` until it has a width — also while it is laid out at 0 (`display: none`, jsdom).
 *  Once narrow it stays so until 40px wider: a layout switch can toggle a scrollbar and flip it straight back. */
export function useNarrowerThan<E extends HTMLElement>(px: number): [(el: E | null) => void, boolean | undefined] {
    const [narrow, setNarrow] = useState<boolean>();
    const observer = useRef<ResizeObserver | undefined>(undefined);
    const ref = useCallback((el: E | null) => {
        observer.current?.disconnect();
        observer.current = undefined;
        if (!el) return;
        const measure = () => {
            const width = el.getBoundingClientRect().width;
            if (width > 0) setNarrow(was => width < (was ? px + 40 : px));
        };
        measure();
        if (typeof ResizeObserver !== "undefined") {
            observer.current = new ResizeObserver(measure);
            observer.current.observe(el);
        }
    }, [px]);
    return [ref, narrow];
}
