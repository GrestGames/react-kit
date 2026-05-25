import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import {ProgressBar} from "../form/other/ProgressBar";
import {Button} from "../form/buttons/Button";

export interface BatchProgressFailure {
    id: string | number;
    reason: string;
}

export interface BatchProgress {
    sent: number;
    errors: number;
    handled: number;
    total: number;
    failures: BatchProgressFailure[];
}

export function BatchProgressPopup({title, progress, onDone}: { title?: string, progress: BatchProgress, onDone: () => void }) {
    const isDone = progress.handled === progress.total;
    return <AddToBody id="batchProgress">
        <DarkBackground zIndex={200}/>
        <Panel zIndex={201} width={400} style={{marginTop: "200px"}}>
            {title && <div style={{marginBottom: 10}}><b>{title}</b></div>}
            {!isDone && <ProgressBar total={progress.total} current={progress.handled}/>}
            {isDone && <div>
                {progress.sent > 0 && <span style={{color: "var(--rk-success)", fontWeight: 600}}>Sent: {progress.sent}</span>}
                {progress.sent > 0 && progress.errors > 0 && <span>. </span>}
                {progress.errors > 0 && <span style={{color: "var(--rk-danger)", fontWeight: 600}}>Failed: {progress.errors}</span>}
                {progress.failures.length > 0 && <div style={{marginTop: 8, maxHeight: 200, overflowY: "auto", fontSize: "var(--rk-font-size-small)"}}>
                    {progress.failures.map((f, i) => <div key={i}>
                        <span style={{fontWeight: 600}}>#{f.id}</span>{" "}
                        <span style={{color: "var(--rk-text-muted)"}}>{f.reason}</span>
                    </div>)}
                </div>}
                <div style={{marginTop: 10, textAlign: "right"}}>
                    <Button onClick={onDone}>Done</Button>
                </div>
            </div>}
        </Panel>
    </AddToBody>
}
