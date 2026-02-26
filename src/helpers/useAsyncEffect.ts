import {DependencyList, useEffect} from "react";
import {useErrorTracker} from "../ErrorTracker";

export function useAsyncEffect(callback: () => Promise<void | (() => void)>, dependencies?: DependencyList) {
    const errorTracker = useErrorTracker();
    useEffect(() => {
        callback()
            .then(() => {
            })
            .catch((e) => {
                errorTracker.addError(e)
            })
        return undefined;
    }, dependencies);
}