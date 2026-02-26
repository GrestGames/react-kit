import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import "./toggle.css";

type ExtraProps = { id?: string, color?: string, isChanged?: boolean };

export function Toggle01(props: AnyInputElement<0 | 1> & ExtraProps) {
    return InternalToggle(props as AnyInputElement<boolean | 0 | 1> & ExtraProps, true);
}

export function Toggle(props: AnyInputElement<boolean> & ExtraProps) {
    return InternalToggle(props as AnyInputElement<boolean | 0 | 1> & ExtraProps, false);
}

function InternalToggle(props: AnyInputElement<boolean | 0 | 1> & ExtraProps, use01: boolean) {
    const data = useInputData(props);
    const isDisabled = props.disabled || props.readOnly || data.readOnly;
    const style = props.color ? {"--toggle-color": props.color} as React.CSSProperties : undefined;
    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <label className={"toggle" + (data.isChanged || props.isChanged ? " changed" : "") + (isDisabled ? " disabled" : "")} style={style}>
            <input
                id={props.id}
                type="checkbox"
                name={data.name}
                checked={!!data.value}
                disabled={isDisabled}
                onChange={(e) => {
                    data.onChange(!!e.target.checked ? (use01 ? 1 : true) : (use01 ? 0 : false));
                }}
            />
            <span className="toggleTrack"><span className="toggleThumb"/></span>
        </label>
    </div>
}
