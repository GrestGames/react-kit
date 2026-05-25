import {Modal} from "./Modal";
import {Panel} from "./Panel";

export function LoadingPopup({title}: { title?: string }) {
    return <Modal band="top" focusTrap={false}>
        <Panel width={160} style={{marginTop: "200px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "18px 0"}}>
                <div className="loader"></div>
                <div style={{color: "var(--rk-text-secondary)"}}>{title || "Loading..."}</div>
            </div>
        </Panel>
    </Modal>
}
