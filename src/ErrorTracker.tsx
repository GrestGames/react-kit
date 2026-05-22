import React, {useState} from "react";
import {ArrayUtils} from "./util/ArrayUtils";
import {ApiErrors} from "./ApiError";
import {TipBox} from "./form/other/TipBox";
import {ERROR, VALIDATION_ERROR} from "@grest-ts/schema";
import "./ErrorTracker.css";

type AnyError = ERROR<string, any> | Error | unknown;

export interface ErrorTracker {
    errors: AnyError[];
    addError: (error: AnyError) => void;
}

const ApiContext = React.createContext<ErrorTracker>(undefined);

export function useErrorTracker(): ErrorTracker {
    return React.useContext(ApiContext);
}

export function ErrorTrackerProvider({children}: { children: React.ReactNode | React.ReactNode[] }) {
    const [errors, setErrors] = useState<AnyError[]>([])
    return <ApiContext.Provider value={{
        errors: errors,
        addError: (error) => {
            setErrors((e) => [...e, error]);
        }
    }}>
        {errors.map((e, i) => {
            return <TipBox intent="danger" iconLetter="!" key={i} onClick={() => {
                const copy = [...errors]
                ArrayUtils.removeElement(copy, e);
                setErrors(copy)
            }}><ApiErrorMessage error={e}/></TipBox>
        })}
        {children}
    </ApiContext.Provider>
}

export function ApiErrorMessage({error}: { error: AnyError }) {
    if (ApiErrors.is(error)) {
        if (error.type === VALIDATION_ERROR.TYPE) {
            const issues = ApiErrors.getValidationErrors(error as typeof VALIDATION_ERROR.infer);
            return <div>
                <div className="errTitle">{error.context?.displayMessage || "Problems!"}</div>
                {issues.map((issue, index) => {
                    return <div key={index}>
                        <span className="errMuted">({issue.path})</span><br/>{issue.message}
                    </div>
                })}
            </div>
        } else {
            const debug = error instanceof ERROR ? error.getDebugContext() : undefined;
            const debugMessage = debug?.debugMessage || (error as any).context?.debugMessage;
            const rawDebugData = debug?.debugData ?? (error as any).context?.debugData;
            const debugIssues = Array.isArray(rawDebugData) ? rawDebugData : undefined;
            return <div>
                <div><span className="errType">{error.type}:</span> {ApiErrors.getDisplayMessage(error)}</div>
                {debugMessage && <div className="errMuted" style={{marginTop: 4}}>{debugMessage}</div>}
                {debugIssues && debugIssues.map((issue: any, index: number) => {
                    return <div key={index}>
                        <span className="errMuted">({issue.path})</span> {issue.message}
                    </div>
                })}
                {rawDebugData && !debugIssues && <div className="errMuted" style={{marginTop: 4}}>{JSON.stringify(rawDebugData)}</div>}
            </div>
        }
    } else {
        return <div>{String(error)}</div>;
    }
}
