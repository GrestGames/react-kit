import type {ReactElement} from "react";
import type {LoaderViewState} from "./useStepLoader";

// The contract every loader variant implements. A variant is purely presentational:
// it receives the shared LoaderViewState and renders it however it likes (animations,
// the Jarvis orb, step-name transitions). It must NOT own timing or progress logic —
// that lives in useStepLoader so all variants behave identically and compare fairly.

export interface LoaderVariantProps {
    state: LoaderViewState;
    className?: string;
}

export type LoaderVariant = (props: LoaderVariantProps) => ReactElement;
