import React, {PropsWithChildren, useContext, useEffect, useRef} from "react";
import {FormObject} from "./useAsyncForm";
import {TipBox} from "./other/TipBox";
import {Alert} from "../mini/Alert";
import {ApiErrorMessage} from "../ErrorTracker";
import {FormRoot} from "./FormRoot";
import {AddToBody} from "../helpers/AddToBody";
import {CloseGuardContext} from "../mini/PopupPanel";

const FormContext = React.createContext<any>(undefined);

export function Form<T>(props: PropsWithChildren<{ prop: FormObject<T> }>) {
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
                    {f.getSubmitError() && <Alert intent="danger" width={500} onClick={() => f.resetSubmitError()}>
                        <ApiErrorMessage error={f.getSubmitError()}/>
                    </Alert>}
                    {props.children}
                </FormContext.Provider>
            </form>
        </div>
    }
}

export function FormLoader({f, containerRef: containerRef}: { f: FormRoot<any>, containerRef: React.MutableRefObject<HTMLElement> }) {
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