import {AnyInputElement, isWithProp, useInputData} from "./StandardFormElementProps";
import {useEffect} from "react";

export type AnySelectFormElement<T> = AnyInputElement<T> & {
    addEmpty?: boolean;
    options: ValueType<T>[]
}

export interface ValueType<T> {
    id: T,
    name: string
}

function isEmptyOptionId(id: unknown): boolean {
    return id === null || id === undefined || id === "";
}

export function RadioSelect<T extends string | number>(props: AnySelectFormElement<T>) {
    const data = useInputData<T>(props);
    useEffect(() => {
        if (!props.addEmpty && isWithProp(props) && !props.prop.val() && !isEmptyOptionId(props.options[0]?.id) && !props.options.find((e) => e.id == data.value)) {
            props.prop.set(props.options[0].id);
        }
    }, []);

    const originaValue = data.isChanged && isWithProp(props) ? props.prop.getInitialValue() : undefined;

    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <div style={props.style} className={props.className}>
            {props.options.map((item, i) => {
                const isChanged = data.isChanged && (item.id == originaValue || data.value == item.id);
                return <label key={String(item.id)}
                              style={{display: "inline-block", padding: "2px 2px 2px 2px"}}
                              className={(isChanged ? "changedForArea" : "") + " " + (data.validationError ? "errorForArea" : "")}>
                    <input
                        type="radio"
                        name={data.name}
                        disabled={props.disabled || props.readOnly || data.readOnly}
                        checked={data.value == item.id}
                        value={SelectParser.toInput(item.id)}
                        key={item.id}
                        onChange={(e) => {
                            data.onChange(SelectParser.toOutput<T>(e.target.value, props.options))
                        }}
                        className={(data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}
                    />
                    {item.name}
                </label>
            })}
        </div>
    </div>
}

export function Select<T extends string | number>(props: AnySelectFormElement<T>) {
    const data = useInputData<T>(props);
    useEffect(() => {
        if (!props.addEmpty && isWithProp(props) && !props.prop.val() && !isEmptyOptionId(props.options[0]?.id) && !props.options.find((e) => e.id == data.value)) {
            props.prop.set(props.options[0].id);
        }
    }, []);

    const originaValue = data.isChanged && isWithProp(props) ? props.prop.getInitialValue() : undefined;
    const selectedName = props.options.find(o => o.id == data.value)?.name;
    const inlineClass = props.inlineEdit ? " inlineEditSelect" + (!selectedName ? " inlineEditEmpty" : "") : "";

    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <select
            name={data.name}
            value={SelectParser.toInput(data.value)}
            disabled={props.disabled || props.readOnly || data.readOnly}
            onChange={(e) => {
                data.onChange(SelectParser.toOutput<T>(e.target.value, [...(props.addEmpty ? [{id: null, name: ""}] as unknown as ValueType<T>[] : []), ...props.options]));
                if (props.inlineEdit) e.target.blur();
            }}
            className={"rkSelect " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + inlineClass}
            style={props.style}
        >
            {props.addEmpty && <option value="" key={0}></option>}
            {props.options.map((item, i) => {
                const isChanged = data.isChanged && (item.id == originaValue || data.value == item.id);
                return <option className={isChanged ? "changed" : ""} value={SelectParser.toInput(item.id)} key={i + 1}>{item.name}</option>
            })}
        </select>
    </div>
}

class SelectParser {

    public static toInput(val: unknown): string {
        return val === null ? "" : String(val)
    }

    public static toOutput<T>(val: string, options: ValueType<T>[]): T {
        const search: string | null = val === "" ? null : val;
        const item = options.find((opt) => {
            if (search === null) {
                return opt.id === null;
            } else {
                return opt.id == search;
            }
        });
        return item!.id;
    }


}
