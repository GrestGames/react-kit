import {AnyInputElement, isWithProp, useInputData} from "./StandardFormElementProps";
import {Checkbox} from "./Checkbox01";

import {ValueType} from "./Select";

export type CheckboxGroupProps = AnyInputElement<string[]> & {
    options: ValueType<string>[]
}

export function CheckboxGroup(props: CheckboxGroupProps) {
    const data = useInputData<string[]>(props);

    const initialCheckedKeys: Set<any> = new Set();
    if (isWithProp(props)) {
        const originalValues = props.prop.getInitialValue()
        for (let i = 0; i < originalValues?.length; i++) {
            initialCheckedKeys.add(originalValues[i])
        }
    }
    return <div>
        <table>
            <tbody>
            {props.options.map((item, index) => {
                const label = "box-" + data.name + "-" + item.id;
                const checked = Boolean(data.value?.indexOf(item.id) >= 0);
                const thisChanged = data.isChanged && (!checked && initialCheckedKeys.has(item.id) || checked && !initialCheckedKeys.has(item.id));
                return <tr key={index} className={(data.validationError ? "errorForArea" : "")}>
                    <td width={10}>
                        <Checkbox
                            id={label}
                            value={checked}
                            disabled={props.readOnly || data.readOnly}
                            isChanged={thisChanged}
                            onChange={() => {
                                const copy = [...(data.value || [])]
                                const index = copy.indexOf(item.id);
                                if (!checked && index === -1) {
                                    copy.push(item.id);
                                } else if (checked && index !== -1) {
                                    copy.splice(index, 1);
                                }
                                data.onChange(copy)
                            }}
                        />
                    </td>
                    <td align="left">
                        <label htmlFor={label}>
                            {item.name}
                        </label>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
    </div>
}
