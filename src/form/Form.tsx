import React, {PropsWithChildren, useContext, useEffect, useRef} from "react";
import {FormObject} from "./useAsyncForm";
import {TipBox} from "./other/TipBox";
import {ApiErrorMessage} from "../ErrorTracker";
import {FormRoot} from "./FormRoot";
import {AddToBody} from "../helpers/AddToBody";
import {CloseGuardContext} from "../mini/PopupPanel";
import {ERROR, VALIDATION_ERROR} from "@grest-ts/schema";
import {ApiErrors} from "../ApiError";

const FormContext = React.createContext<any>(undefined);

export function Form<T>(props: PropsWithChildren<{ prop: FormObject<T>, hideValidationTip?: boolean }>) {
    const f = props.prop.getForm();
    const ref = useRef<HTMLDivElement>(null);
    const closeGuard = useContext(CloseGuardContext);

    useEffect(() => {
        return closeGuard.register(() => props.prop.isChanged());
    }, [closeGuard, props.prop]);

    if (f.getLoadError()) {
        return <TipBox intent="danger" iconLetter="!"><ApiErrorMessage error={f.getLoadError()}/></TipBox>
    } else if (f.isLoading() && !f.isReloading()) {
        return <div className="formLoading">
            <div className="loader"></div>
        </div>
    } else {

        return <div ref={ref}>
            {(f.isReloading() || f.isSaving()) && <FormLoader f={f} containerRef={ref}/>}
            <form className="rkForm" method="POST" onSubmit={(e) => {
                props.prop.getForm().submit()
                    .then(() => {
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                e.preventDefault();
            }}>
                <FormContext.Provider value={props.prop}>
                    {f.getSubmitError() && !(props.hideValidationTip && f.getSubmitError()?.type === VALIDATION_ERROR.TYPE) && <TipBox intent="danger" iconLetter="!" style={{marginBottom: 16}} onClick={() => f.resetSubmitError()}>
                        <SubmitErrorMessage error={f.getSubmitError()!}/>
                    </TipBox>}
                    {props.children}
                </FormContext.Provider>
            </form>
        </div>
    }
}

// Shown to the form's user: the issues are already on their fields, so no schema paths or error codes.
function SubmitErrorMessage({error}: { error: ERROR<string, any> }) {
    const messages = error.type === VALIDATION_ERROR.TYPE ? [...new Set(ApiErrors.getValidationErrors(error as typeof VALIDATION_ERROR.infer).map(i => i.message))] : []
    if (messages.length === 0) return <div>{ApiErrors.getDisplayMessage(error)}</div>
    return <div>{messages.map(m => <div key={m}>{m}</div>)}</div>
}

export function FormLoader({f, containerRef: containerRef}: { f: FormRoot<any>, containerRef: React.RefObject<HTMLElement | null> }) {
    if (!containerRef.current || "disabled") { // @TODO Disabled it, as I can't find a way to position it correctly to cover whole form in scrolled panels.
        return <></>
    }
    const pos = getVisibleDimensionsAndPosition(containerRef.current);
    const loaderHeight = Math.max(0, Math.min(90, pos.height));
    return <AddToBody id={"formLoader"}>
        {(f.isReloading() || f.isSaving()) && <div className="formSaving" style={{left: pos.x, top: pos.y, width: pos.width, height: pos.height}}>
            <div className="loaderArea" style={{
                marginTop: Math.max(0, Math.min(100, (pos.height) * 0.5 - loaderHeight)),
                height: loaderHeight - 2,
            }}>
                <div className="loader"></div>
            </div>
        </div>}
    </AddToBody>
}

export function useForm<T>(): FormObject<T> {
    return React.useContext(FormContext) as FormObject<T>;
}

function getVisibleDimensionsAndPosition(element: any) {
    let rect = element.getBoundingClientRect();
    let currentElement = element;

    while (currentElement.parentElement) {
        const parent = currentElement.parentElement;
        const parentRect = parent.getBoundingClientRect();
        rect = {
            top: Math.max(rect.top, parentRect.top),
            right: Math.min(rect.right, parentRect.right),
            bottom: Math.min(rect.bottom, parentRect.bottom),
            left: Math.max(rect.left, parentRect.left)
        };
        currentElement = parent;
    }

    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;

    // Return dimensions and the absolute position relative to the viewport
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: Math.max(0, width), // Ensure non-negative values
        height: Math.max(0, height)
    };
}