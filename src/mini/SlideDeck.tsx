import React, {useEffect, useRef} from "react"
import "./SlideDeck.css"

interface SlideDeckProps {
    /** Index of the slide to show. */
    index: number
    /** The slides; only `slides[index]` is mounted. */
    slides: React.ReactNode[]
}

/** Shows one slide at a time and animates the swap left/right based on whether
 *  the index moved forward or back. Stateless about *which* index — the parent
 *  owns that (e.g. a StepBar), so this can be driven by anything or alone. */
export function SlideDeck({index, slides}: SlideDeckProps) {
    const prev = useRef(index)
    const forward = index >= prev.current
    useEffect(() => { prev.current = index })

    return <div className="rk-slidedeck">
        {/* keyed on index so each change remounts the slide and replays the animation */}
        <div key={index} className={`rk-slidedeck-slide ${forward ? "rk-slidedeck-fwd" : "rk-slidedeck-back"}`}>
            {slides[index]}
        </div>
    </div>
}
