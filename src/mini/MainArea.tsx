import {CSSProperties, PropsWithChildren} from "react";
import {JarvisOrb} from "../jarvis";
import type {JarvisStateName} from "../jarvis";
import {useErrorTracker} from "../ErrorTracker";
import "./MainArea.css";

export function MainArea({children, style, showJarvis}: PropsWithChildren<{ style?: CSSProperties; showJarvis?: boolean }>) {
    return <div className={"main" + (showJarvis ? " mainWithJarvis" : "")} style={style}>
        {children}
        {showJarvis && <JarvisDesktopOrb/>}
    </div>
}

function JarvisDesktopOrb() {
    // ambient orb that reacts to app notifications: while errors are present it sits
    // in the "alert" mood, otherwise it idles. useErrorTracker has no value when
    // MainArea is rendered outside an ErrorTrackerProvider, hence the guard.
    const tracker = useErrorTracker();
    const state: JarvisStateName = tracker?.errors?.length ? "alert" : "idle";

    return <div className="jarvisDesktopOrb">
        <JarvisOrb size="avatar" palette="cyan" state={state}/>
    </div>
}
