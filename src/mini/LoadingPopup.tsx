import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";

export function LoadingPopup({title}: { title?: string }) {
    return <AddToBody id="loader">
        <DarkBackground zIndex={200}/>
        <Panel zIndex={201} width={160} style={{marginTop: "200px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "18px 0"}}>
                <div className="loader"></div>
                <div style={{color: "var(--rk-text-secondary)"}}>{title || "Loading..."}</div>
            </div>
        </Panel>
    </AddToBody>
}