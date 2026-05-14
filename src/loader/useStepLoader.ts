import {useCallback, useEffect, useRef, useState} from "react";

// Step loader model — shared by every loader variant so they all behave identically
// and only differ visually. The variant renders LoaderViewState; it never owns timing.
//
// Loader semantics:
//  - we start with a known number of steps, but more can be discovered mid-flow
//  - each finished step arrives as an explicit event (finishStep)
//  - between events the bar keeps creeping forward, but asymptotically — it fills ~90%
//    of the active step's slice and waits. With no steps left to run it parks at ~92%.
//  - only the real completion event (complete) unlocks 100%.

export type LoaderStepStatus = "pending" | "active" | "done" | "error";
export type LoaderPhase = "idle" | "running" | "finishing" | "done" | "error";

export interface LoaderStep {
    name: string;
    status: LoaderStepStatus;
}

export interface LoaderViewState {
    steps: LoaderStep[];
    totalKnown: number;
    doneCount: number;
    activeIndex: number | null;
    activeStepName: string | null;
    /** 0..1 eased value the UI should render — already creep/ease-smoothed */
    displayProgress: number;
    phase: LoaderPhase;
    /** increments every time a step transitions to done — variants flash on change */
    successPulse: number;
    /** most recently completed step name — for "animate the text away" transitions */
    lastDoneStepName: string | null;
}

export interface StepLoaderController {
    /** begin a flow with an initial known step count (or explicit names) */
    start(steps: string[] | number): void;
    /** the active step finished — advances to the next known step */
    finishStep(): void;
    /** reveal extra steps discovered mid-flow (appended after known ones) */
    discoverSteps(steps: string[] | number): void;
    /** the active step errored — flow halts in the error phase */
    failStep(): void;
    /** the real completion event — the only thing that unlocks 100% */
    complete(): void;
    /** back to idle */
    reset(): void;
}

const CREEP_RATE = 0.045;   // asymptotic ease toward the active slice's cap
const FINISH_RATE = 0.12;   // faster ease once the real completion event lands
const BACKWARD_RATE = 0.025; // gentle drift back when discovered steps lower the target
const SLICE_FILL = 0.6;     // how far into the active step's slice the creep reaches
const RUNNING_CAP = 0.9;    // ceiling until complete() — the "parked near 90%" state
const EPS = 0.0005;

interface Model {
    names: string[];
    statuses: LoaderStepStatus[];
    phase: LoaderPhase;
    successPulse: number;
    lastDoneStepName: string | null;
}

function idleModel(): Model {
    return {names: [], statuses: [], phase: "idle", successPulse: 0, lastDoneStepName: null};
}

function toNames(steps: string[] | number, offset: number): string[] {
    if (typeof steps === "number") {
        return Array.from({length: steps}, (_, i) => `Step ${offset + i + 1}`);
    }
    return steps;
}

function doneCountOf(m: Model): number {
    return m.statuses.filter(s => s === "done").length;
}

function computeTarget(m: Model): number {
    const total = m.names.length;
    if (total === 0) return 0;
    if (m.phase === "finishing" || m.phase === "done") return 1;
    const done = doneCountOf(m);
    if (m.phase === "error") return done / total;
    const activeIndex = m.statuses.indexOf("active");
    // no active step left but no completion event yet — park near the cap
    if (activeIndex === -1) return RUNNING_CAP;
    // creep SLICE_FILL of the way into the active step's slice, never reaching its
    // boundary (that needs the finishStep event); clamped so we never look "done"
    return Math.min((activeIndex + SLICE_FILL) / total, RUNNING_CAP);
}

function buildView(m: Model, displayProgress: number): LoaderViewState {
    const activeIndex = m.statuses.indexOf("active");
    return {
        steps: m.names.map((name, i) => ({name, status: m.statuses[i]})),
        totalKnown: m.names.length,
        doneCount: doneCountOf(m),
        activeIndex: activeIndex === -1 ? null : activeIndex,
        activeStepName: activeIndex === -1 ? null : m.names[activeIndex],
        displayProgress,
        phase: m.phase,
        successPulse: m.successPulse,
        lastDoneStepName: m.lastDoneStepName,
    };
}

export function useStepLoader(): {state: LoaderViewState; controller: StepLoaderController} {
    const modelRef = useRef<Model>(idleModel());
    const displayRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const [state, setState] = useState<LoaderViewState>(() => buildView(modelRef.current, 0));

    const tick = useCallback(() => {
        const m = modelRef.current;
        const target = computeTarget(m);
        const rate = m.phase === "finishing" ? FINISH_RATE : CREEP_RATE;
        let display = displayRef.current;

        if (target > display) {
            display += (target - display) * rate;
            if (target - display < EPS) display = target;
        } else if (target < display - EPS) {
            // discovering steps lowers the target — drift back gently rather than snap,
            // so the bar reads as "more work was found" instead of glitching
            display += (target - display) * BACKWARD_RATE;
        }

        if (m.phase === "finishing" && display >= 1 - EPS) {
            display = 1;
            m.phase = "done";
        }

        displayRef.current = display;
        setState(buildView(m, display));

        const settled = m.phase !== "finishing" && Math.abs(target - display) < EPS;
        rafRef.current = settled ? null : requestAnimationFrame(tick);
    }, []);

    const wake = useCallback(() => {
        if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    useEffect(() => () => {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    }, []);

    const controllerRef = useRef<StepLoaderController | null>(null);
    if (controllerRef.current == null) {
        const sync = () => setState(buildView(modelRef.current, displayRef.current));
        controllerRef.current = {
            start(steps) {
                const names = toNames(steps, 0);
                modelRef.current = {
                    names,
                    statuses: names.map((_, i) => (i === 0 ? "active" : "pending")),
                    phase: names.length ? "running" : "idle",
                    successPulse: 0,
                    lastDoneStepName: null,
                };
                displayRef.current = 0;
                sync();
                wake();
            },
            finishStep() {
                const m = modelRef.current;
                if (m.phase !== "running") return;
                const i = m.statuses.indexOf("active");
                if (i === -1) return;
                m.statuses[i] = "done";
                m.lastDoneStepName = m.names[i];
                m.successPulse += 1;
                const next = m.statuses.indexOf("pending");
                if (next !== -1) m.statuses[next] = "active";
                sync();
                wake();
            },
            discoverSteps(steps) {
                const m = modelRef.current;
                if (m.phase !== "running") return;
                const added = toNames(steps, m.names.length);
                const hadActive = m.statuses.includes("active");
                m.names = [...m.names, ...added];
                m.statuses = [...m.statuses, ...added.map((): LoaderStepStatus => "pending")];
                if (!hadActive) {
                    const next = m.statuses.indexOf("pending");
                    if (next !== -1) m.statuses[next] = "active";
                }
                sync();
                wake();
            },
            failStep() {
                const m = modelRef.current;
                const i = m.statuses.indexOf("active");
                if (i !== -1) m.statuses[i] = "error";
                m.phase = "error";
                sync();
                wake();
            },
            complete() {
                const m = modelRef.current;
                if (m.phase === "finishing" || m.phase === "done") return;
                const hadUnfinished = m.statuses.some(s => s === "active" || s === "pending");
                m.statuses = m.statuses.map(s => (s === "error" ? "error" : "done"));
                if (hadUnfinished) {
                    m.successPulse += 1;
                    m.lastDoneStepName = m.names[m.names.length - 1] ?? null;
                }
                m.phase = "finishing";
                sync();
                wake();
            },
            reset() {
                modelRef.current = idleModel();
                displayRef.current = 0;
                sync();
            },
        };
    }

    return {state, controller: controllerRef.current};
}
