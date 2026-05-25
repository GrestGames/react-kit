import {ReactNode, useLayoutEffect, useRef, useState} from "react"

/** Animates its own height to fit its content and clips overflow during the
 *  change. Smooths the "wiggle" when inner content loads asynchronously and
 *  changes size — we can't know from outside when a child is done, so instead we
 *  observe its size and ease the container to it. Width is left to the content. */
export function AutoHeight({children, duration = 250}: {children: ReactNode; duration?: number}) {
    const inner = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number | undefined>(undefined)

    useLayoutEffect(() => {
        const el = inner.current
        if (!el) return undefined
        const measure = () => setHeight(el.offsetHeight)
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return <div style={{
        height,
        overflow: "hidden",
        transition: `height ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
    }}>
        <div ref={inner}>{children}</div>
    </div>
}
