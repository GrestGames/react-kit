import {Dispatch, useState} from "react";
import {useErrorTracker} from "../ErrorTracker";
import {ApiErrors} from "../ApiError";
import {useOnlyLatestResult} from "./useOnlyLatestResult";
import {isPromise} from "../util/isPromise";
import {ERROR} from "@grest-ts/schema";

export type SetStateType<S> = ((prevState: S) => Promise<S> | S) | Promise<S> | S;

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
export function useAsyncState<S = undefined>(initialState: S | undefined = undefined, options?: UseAsyncStateOptions): [S | undefined, Dispatch<SetStateType<S>>, useAsyncStateState] {

    const [data, setData] = useState<S>(initialState);
    const [state, setState] = useState<useAsyncStateState>({state: AsyncState.INIT})
    const errors = useErrorTracker();
    const onlyLatest = useOnlyLatestResult<S>();
    const autoHandleErrors = !options?.disableErrorAutoHandling;

    const asyncSetState = async (input: SetStateType<S>) => {
        if (typeof input === "function") {
            setData((data) => {
                const funcResult = (input as any)(data);
                if (isPromise(funcResult)) {
                    handlePromise(funcResult)
                    return data;
                } else {
                    return funcResult;
                }
            });
        } else {
            if (isPromise(input)) {
                handlePromise(input)
            } else {
                setData(input as any);
                setState({state: AsyncState.OK});
            }
        }
    };

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

    return [data, asyncSetState, state];
}
