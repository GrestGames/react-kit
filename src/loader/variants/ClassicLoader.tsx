import {useEffect, useRef, useState} from "react";
import {JarvisOrb} from "../../jarvis";
import type {JarvisStateName} from "../../jarvis";
import type {LoaderVariantProps} from "../LoaderVariant";
import "./ClassicLoader.css";

// Reference loader variant — proves the LoaderVariant contract end to end:
// orb reacts to phase, the active step name crossfades out/in on change, the bar
// renders the shared eased displayProgress, and each finished step flashes.
// Variant agents should treat this as a baseline to beat, not a template to copy.

const SUCCESS_FLASH_MS = 700;
const TEXT_SWAP_MS = 420;

export function ClassicLoader({state, className}: LoaderVariantProps) {
    const [flashing, setFlashing] = useState(false);
    const firstPulse = useRef(state.successPulse);

    useEffect(() => {
        if (state.successPulse === firstPulse.current) return;
        setFlashing(true);
        const t = setTimeout(() => setFlashing(false), SUCCESS_FLASH_MS);
        return () => clearTimeout(t);
    }, [state.successPulse]);

    // crossfade the active step label: keep the outgoing name around briefly
    const [shown, setShown] = useState(state.activeStepName);
    const [leaving, setLeaving] = useState<string | null>(null);
    useEffect(() => {
        if (state.activeStepName === shown) return;
        setLeaving(shown);
        setShown(state.activeStepName);
        const t = setTimeout(() => setLeaving(null), TEXT_SWAP_MS);
        return () => clearTimeout(t);
    }, [state.activeStepName, shown]);

    let orbState: JarvisStateName = "idle";
    if (state.phase === "error") orbState = "alert";
    else if (state.phase === "done") orbState = "success";
    else if (flashing) orbState = "success";
    else if (state.phase === "running" || state.phase === "finishing") orbState = "thinking";

    const pct = Math.round(state.displayProgress * 100);
    const caption =
        state.phase === "done" ? "Done" :
        state.phase === "error" ? "Failed" :
        state.activeStepName ?? (state.phase === "idle" ? "Idle" : "Working…");

    return (
        <div className={"classicLoader" + (className ? " " + className : "")} data-phase={state.phase}>
            <div className="classicLoaderOrb">
                <JarvisOrb size="avatar" palette="cyan" state={orbState}/>
            </div>

            <div className="classicLoaderLabel">
                {leaving && <span key={"out-" + leaving} className="classicLoaderText out">{leaving}</span>}
                <span key={"in-" + shown} className="classicLoaderText in">{caption}</span>
            </div>

            <div className={"classicLoaderBar" + (flashing ? " flash" : "")}>
                <div className="classicLoaderBarFill" style={{width: pct + "%"}}/>
            </div>
            <div className="classicLoaderMeta">
                <span>{pct}%</span>
                <span>{state.doneCount} / {state.totalKnown} steps</span>
            </div>

            <div className="classicLoaderSteps">
                {state.steps.map((s, i) => (
                    <span key={i} className="classicLoaderStep" data-status={s.status}>{s.name}</span>
                ))}
            </div>
        </div>
    );
}
