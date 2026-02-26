import {useState} from "react";
import {ApiErrors} from "../ApiError";

/**
 * Only passes Promise result if it is "the latest call".
 */
export function useOnlyLatestResult<S>(): ((promise: Promise<S>) => Promise<S>) {
    const [_, setVer] = useState(1);
    return async (promise: Promise<S>): Promise<S> => {
        return new Promise<S>((resolve, reject) => {
            setVer((startVer) => {
                const makeVer = startVer + 1;
                promise
                    .then((resp) => {
                        setVer((endVer) => {
                            if (endVer === makeVer) {
                                resolve(resp);
                            } else {
                                reject(ApiErrors.frontendError("CallExpired", "CallExpired"))
                            }
                            return endVer;
                        })
                    })
                    .catch((err) => {
                        setVer((endVer) => {
                            if (endVer === makeVer) {
                                reject(err);
                            } else {
                                reject(ApiErrors.frontendError("CallExpired", "CallExpired"))
                            }
                            return endVer;
                        })
                    });
                return makeVer
            })
        });
    }
}
