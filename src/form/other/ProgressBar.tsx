import "./ProgressBar.css"

export interface ProgressBarProps {
    current: number;
    total: number;
    width?: number | string;
}

export function ProgressBar(props: ProgressBarProps) {
    const width = props.width || "100%";
    const pct = Math.max(0, Math.min(100, props.current / props.total * 100));

    return <div className="progressBar" style={{width: width}}>
        <div className="progressBarBar" style={{width: pct + "%"}}></div>
        <div className="progressBarText progressBarTextTrack">{props.current} / {props.total}</div>
        <div className="progressBarText progressBarTextFill" style={{clipPath: `inset(0 ${100 - pct}% 0 0)`}}>
            {props.current} / {props.total}
        </div>
    </div>
}
