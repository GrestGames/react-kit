import "./ProgressBar.css"

export interface ProgressBarProps {
    current: number;
    total: number;
    width?: number | string;
}

export function ProgressBar(props: ProgressBarProps) {

    const width = props.width || "100%";
    const barWidth = (props.current / props.total * 100) + "%"

    return <div className="progressBar" style={{width: width}}>
        <div className="progressBarText">
            {props.current} / {props.total}
        </div>
        <div className="progressBarBar" style={{width: barWidth}}></div>
    </div>
}