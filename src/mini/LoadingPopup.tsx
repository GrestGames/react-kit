import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";

export function LoadingPopup({title}: { title?: string }) {
    return <AddToBody id="loader">
        <DarkBackground zIndex={200}/>
        <Panel zIndex={201} width={100} style={{marginTop: "200px"}}>
            <div className="loader">{title || "Loading..."}</div>
        </Panel>
    </AddToBody>
}