import {Dispatch, useCallback, useRef, useState} from "react";
import {useErrorTracker} from "../ErrorTracker";
import {ApiErrors} from "../ApiError";
import {useOnlyLatestResult} from "./useOnlyLatestResult";
import {isPromise} from "../util/isPromise";
import {ERROR} from "@grest-ts/schema";

/** A function setter gets the current state, which is `undefined` until the first value lands, and may
 *  return `undefined` to clear it. */
export type SetStateType<S> = ((prevState: S | undefined) => Promise<S> | S | undefined) | Promise<S> | S;

export interface useAsyncStateState {
    state: AsyncState
    error?: ERROR<string, any>;
}

export enum AsyncState {
    OK = "ok",
    INIT = "init",
    ERROR = "error",
    LOADING = "loading"
}

export interface UseAsyncStateOptions {
    disableErrorAutoHandling?: boolean
}

/**
 * Handles state assuming data is loaded from server.
 *
 * In case of multiple ongoing requests, only uses latest response and ignores older ones.
 *
 * Also automatically handles errors.
 *
 * It really is a super method :)
 */
export function useAsyncState<S = undefined>(initialState: S | undefined = undefined, options?: UseAsyncStateOptions): [S | undefined, Dispatch<SetStateType<S> | undefined>, useAsyncStateState] {

    const [data, setData] = useState<S | undefined>(initialState);
    const [state, setState] = useState<useAsyncStateState>({state: AsyncState.INIT})
    const errors = useErrorTracker();
    const onlyLatest = useOnlyLatestResult<S>();
    const autoHandleErrors = !options?.disableErrorAutoHandling;

    // Stable across renders, so callers can list it as an effect/memo dependency; it reads the latest
    // handlePromise (which closes over the error tracker and options) through a ref.
    const handlePromiseRef = useRef<(input: Promise<S>) => void>(() => {});
    const asyncSetState = useCallback((input: SetStateType<S> | undefined) => {
        if (input === undefined) {
            setData(undefined);
            setState({state: AsyncState.OK});
        } else if (typeof input === "function") {
            setData((data) => {
                const funcResult = (input as any)(data);
                if (isPromise(funcResult)) {
                    handlePromiseRef.current(funcResult)
                    return data;
                } else {
                    return funcResult;
                }
            });
        } else {
            if (isPromise(input)) {
                handlePromiseRef.current(input)
            } else {
                setData(input as any);
                setState({state: AsyncState.OK});
            }
        }
    }, []);

    const handlePromise = (input: Promise<S>) => {
        setState({state: AsyncState.LOADING});

        onlyLatest(input)
            .then((resp) => {
                setData(resp)
                setState({state: AsyncState.OK});
            })
            .catch((err) => {
                if (ApiErrors.is(err)) {
                    if (err.type === "FrontendError" && err.getDebugContext()?.debugMessage === "CallExpired") {
                        // We ignore this case.
                    } else {
                        setState({state: AsyncState.ERROR, error: err})
                        autoHandleErrors && errors.addError(err);
                    }
                } else {
                    setState({state: AsyncState.ERROR, error: ERROR.fromUnknown(err)})
                    autoHandleErrors && errors.addError(err);
                }
            })
    }

    handlePromiseRef.current = handlePromise;

    return [data, asyncSetState, state];
}
