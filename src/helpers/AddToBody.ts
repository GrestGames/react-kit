import {ReactNode, ReactPortal} from "react";
import ReactDOM from "react-dom";

export function AddToBody({id, children}: { id: string, children: ReactNode }): ReactPortal {
    let element = document.getElementById(id);
    if (!element) {
        element = document.createElement("div");
        element.id = id;
        document.body.appendChild(element);
    }
    return ReactDOM.createPortal(children, element);
}
