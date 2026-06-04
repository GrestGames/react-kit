import React, {PropsWithChildren, useEffect, useState} from "react";
import {Tracker} from "../EntityTracker";
import {ERROR} from "@grest-ts/schema";

export interface LazyDataSetData<X> {
    ver: number;
    getRows: () => Promise<X[]>
    clear: () => void;
}

export interface LazyDataSetProviderProps<X> {
    context: React.Context<LazyDataSetData<X>>,
    trackers: Tracker<any>[],
    load: () => Promise<X[]>,
    /** When this value changes, the dataset resets and reloads. Useful for e.g. company/tenant switching. */
    reloadKey?: any;
}

export function LazyDataSetProvider<X>(props: PropsWithChildren<LazyDataSetProviderProps<X>>) {
    const [ver, setVer] = useState(0);
    const [rows, setRows] = useState<X[] | undefined>(undefined);
    const [error, setError] = useState<ERROR<string, any> | undefined>(undefined)
    const [loadState, setLoadState] = useState<"load" | "loading" | "loaded" | "init">("init");

    useEffect(() => {
        const unregisterCalls: any[] = [];
        for (let i = 0; i < props.trackers.length; i++) {
            unregisterCalls.push(props.trackers[i].listen(() => {
                setRows(undefined)
                setLoadState("init")
            }))
        }
        return () => {
            for (let i = 0; i < unregisterCalls.length; i++) {
                unregisterCalls[i]?.();
            }
        }
    }, []);

    useEffect(() => {
        if (props.reloadKey === undefined) return;
        setRows(undefined)
        setLoadState("init")
    }, [props.reloadKey])

    useEffect(() => {
        setLoadState((currentState) => {
            if (currentState === "load") {
                props.load()
                    .then((e) => {
                        setVer((e) => e + 1);
                        setRows(e)
                        setLoadState((currentState) => currentState === "loading" ? "loaded" : currentState);
                    })
                    .catch((e) => {
                        setError(e);
                        setLoadState((currentState) => currentState === "loading" ? "loaded" : currentState);
                    });
                return "loading";
            } else {
                return currentState;
            }
        });
    }, [loadState])

    return <props.context.Provider value={{
        ver: ver,
        clear: () => {
            setRows(undefined)
        },
        getRows: async () => {
            if (error) {
                throw error;
            } else {
                if (loadState === "init") {
                    // Trigger lazy load, but need to do it next frame otherwise conflicts with React rendering.
                    setTimeout(() => setLoadState("load"));
                }
                return rows ?? []
            }
        }
    }}>{props.children}</props.context.Provider>
}
