import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import "./checkbox.css";

type ExtraProps = { id?: string, isChanged?: boolean };

export function Checkbox01(props: AnyInputElement<0 | 1> & ExtraProps) {
    return InternalCheckbox(props as AnyInputElement<boolean | 0 | 1> & ExtraProps, true);
}

export function Checkbox(props: AnyInputElement<boolean> & ExtraProps) {
    return InternalCheckbox(props as AnyInputElement<boolean | 0 | 1> & ExtraProps, false);
}

function InternalCheckbox(props: AnyInputElement<boolean | 0 | 1> & ExtraProps, use01: boolean) {
    const data = useInputData(props);
    const isDisabled = props.disabled || props.readOnly || data.readOnly;
    const changed = data.isChanged || props.isChanged;
    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <label className={"cb" + (changed ? " changed" : "") + (isDisabled ? " disabled" : "")}>
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
            <span className="cbBox">
                <svg className="cbCheck" viewBox="0 0 12 12" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 6l2.5 2.5 4.5-5"/>
                </svg>
            </span>
        </label>
    </div>
}
