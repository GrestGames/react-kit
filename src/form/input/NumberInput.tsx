import {ReactNode, useEffect, useState} from "react";
import {useInputData} from "./StandardFormElementProps";
import {InputProps, inlineSaveOrCancel} from "./TextInput";
import {InlineEditWrap} from "./InlineEditWrap";

export type IntegerInputProps<T> = InputProps<T> & { min?: number, max?: number, step?: number }

export type DecimalInputProps<T> = IntegerInputProps<T> & { fractionDigits?: number, min?: number, max?: number, step?: number }

export function IntegerInput<T extends number>(props: IntegerInputProps<T>) {
    return InternalNumberInput({step: 1, min: -2147483648, max: 2147483647, ...props, fractionDigits: 0});
}

export function PositiveIntegerInput<T extends number>(props: IntegerInputProps<T>) {
    if (props.min !== undefined && props.min < 0) {
        throw new Error("Min must be positive or zero for positive number!")
    }
    return InternalNumberInput({step: 1, min: 0, max: 2147483647, ...props, fractionDigits: 0});
}

export function DecimalInput<T extends number>(props: DecimalInputProps<T>) {
    return InternalNumberInput(props);
}

export function PositiveDecimalInput<T extends number>(props: DecimalInputProps<T>) {
    if (props.min !== undefined && props.min < 0) {
        throw new Error("Min must be positive or zero for positive number!")
    }
    return InternalNumberInput({min: 0, ...props});
}

function InternalNumberInput<T extends number>(props: DecimalInputProps<T>) {
    const data = useInputData(props);
    const fractionalDigits = props.fractionDigits === undefined ? 2 : props.fractionDigits;

    const expectedValue = NumberParser.toInput(data.value, fractionalDigits);
    const [value, setValue] = useState<string>(expectedValue);

    useEffect(() => {
        if (Number(value) !== Number(expectedValue)) {
            setValue(expectedValue)
        }
    }, [expectedValue]);

    return <InlineEditWrap
        inlineEdit={!!props.inlineEdit}
        displayValue={expectedValue || null}
        placeholder={props.inlineEditPlaceholder}
        style={props.style}
        className={props.className}
        readOnly={props.readOnly || data.readOnly}
        suffix={props.suffix}
        changed={data.isChanged}
        renderInput={(opts) =>
            <div className={"formItem" + (props.suffix ? " formItemWithSuffix" : "")}>
                {!opts && data.validationError && <div className="validationErrorMsg">{data.validationError.msg}</div>}
                <input
                    ref={opts?.inputRef}
                    type="number"
                    name={data.name}
                    value={value}
                    min={props.min}
                    max={props.max}
                    step={props.step || Math.pow(10, -fractionalDigits)}
                    readOnly={opts ? undefined : (props.readOnly || data.readOnly)}
                    disabled={opts ? undefined : props.disabled}
                    onChange={(e) => {
                        const val = NumberParser.checkInput(e.target.value, props.min, props.max, fractionalDigits);
                        setValue(val);
                        data.onChange(NumberParser.toOutput(val, fractionalDigits) as T)
                    }}
                    onBlur={opts ? () => inlineSaveOrCancel(opts, props, data) : undefined}
                    onKeyDown={opts ? e => {
                        if (e.key === "Enter") { e.preventDefault(); inlineSaveOrCancel(opts, props, data); }
                        if (e.key === "Escape") { opts.onCancel(); props.onInlineEditCancel?.(); }
                    } : undefined}
                    className={"rkInput " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + " " + (props.suffix ? "inputWithSuffix" : "")}
                    style={props.style}
                />
                {props.suffix && <div className={"inputSuffix " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}>{props.suffix}</div>}
            </div>
        }
    />;
}

export function InputRange(props: { children: [ReactNode, ReactNode] }) {
    return <div className="formItem formItemRange">{props.children[0]}<span> - </span>{props.children[1]}</div>
}

export class NumberParser {

    public static checkInput(value: unknown, min: number | undefined, max: number | undefined, fractionalDigits: number): string {
        // We are not using fractionalDigits on purpose to avoid changing the input value and user would not notice.
        if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
            return "";
        }

        const num = Number(value);
        if (min !== undefined && num < min) {
            return String(min);
        }
        if (max !== undefined && num > max) {
            return String(max);
        }

        if (fractionalDigits !== undefined) {
            if (fractionalDigits === 0) {
                return String(Math.floor(num));
            } else if (fractionalDigits > 0) {
                const str = String(num);
                const parts = str.split(".");
                if (parts[1]?.length > fractionalDigits) {
                    return parts[0] + "." + parts[1].substring(0, fractionalDigits);
                }
            }
        }

        return String(value);
    }

    public static toInput(value: unknown, fractionalDigits: number): string {
        // We are not using fractionalDigits on purpose to avoid changing the input value and user would not notice.
        if (value === null || value === undefined || value === "") {
            return "";
        }
        return String(value);
    }

    public static toOutput(value: unknown, fractionalDigits: number): number | null {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const num = value = Number(Number(value).toFixed(fractionalDigits));
        if (isNaN(num)) {
            return null;
        }
        return num;
    }
}
