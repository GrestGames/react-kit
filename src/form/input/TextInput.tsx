import "../css/form.css";
import "../css/input.css";
import "../buttons/button.css";
import "../css/loader.css";
import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import 'react-datepicker/dist/react-datepicker.css'
import {ReactNode, useCallback, useEffect, useRef} from "react";
import {InlineEditWrap} from "./InlineEditWrap";

export type InputProps<T> = AnyInputElement<T> & {
    suffix?: string | ReactNode;
    placeholder?: string;
}

type BasicInputProps2<T> = InputProps<T> & {
    type: "text" | "date" | "email" | "tel" | "password"
}

export function TextArea<T>(props: InputProps<T> & { autoResize?: boolean, rows?: number }) {
    const data = useInputData(props);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el || !props.autoResize) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [props.autoResize]);

    useEffect(() => {
        adjustHeight();
    }, [data.value, adjustHeight]);

    return <InlineEditWrap
        inlineEdit={!!props.inlineEdit}
        displayValue={TextParser.toInput(data.value)}
        multiline
        placeholder={props.inlineEditPlaceholder}
        style={props.style}
        className={props.className}
        readOnly={props.readOnly || data.readOnly}
        changed={data.isChanged}
        renderInput={(opts) =>
            <div className="formItem">
                {!opts && data.validationError && <div className="validationErrorMsg">{data.validationError.msg}</div>}
                <textarea
                    ref={opts ? (el) => { (textareaRef as any).current = el; opts.inputRef(el); } : textareaRef}
                    name={data.name}
                    value={TextParser.toInput(data.value)}
                    readOnly={opts ? undefined : (props.readOnly || data.readOnly)}
                    disabled={opts ? undefined : props.disabled}
                    onChange={(e) => {
                        data.onChange(TextParser.toOutput(e.target.value) as T);
                        if (opts) {
                            e.target.style.height = "0";
                            e.target.style.height = Math.max(e.target.scrollHeight + 2, 88) + "px";
                        } else {
                            adjustHeight();
                        }
                    }}
                    onBlur={opts ? () => inlineSaveOrCancel(opts, props, data) : undefined}
                    onKeyDown={opts ? e => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); inlineSaveOrCancel(opts, props, data); }
                        if (e.key === "Escape") { opts.onCancel(); props.onInlineEditCancel?.(); }
                    } : undefined}
                    className={"rkTextarea " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}
                    style={opts ? {...props.style, overflow: "hidden", resize: "none"} : props.style}
                    rows={opts ? 1 : props.rows}
                />
            </div>
        }
    />;
}

export function inlineSaveOrCancel<T>(opts: import("./InlineEditWrap").InlineEditOpts, props: AnyInputElement<T> & { required?: boolean }, data: import("./StandardFormElementProps").InputData<T>) {
    if (props.required && !data.value) {
        opts.onCancel();
        props.onInlineEditCancel?.();
    } else {
        opts.onSave();
        props.onInlineEditSave?.();
    }
}

function InternalTextInput<T>(props: BasicInputProps2<T>) {
    const data = useInputData(props);
    // fullWidth: the .formItem wrapper is inline-block by default, so an input's width:100% can't
    // fill a flex/block parent. Make the wrapper block and zero the input's side margins so it
    // truly spans the container.
    const inputStyle = props.fullWidth
        ? {width: "100%", marginLeft: 0, marginRight: 0, ...props.style}
        : props.style;

    return <InlineEditWrap
        inlineEdit={!!props.inlineEdit}
        displayValue={TextParser.toInput(data.value)}
        placeholder={props.inlineEditPlaceholder}
        style={props.style}
        className={props.className}
        readOnly={props.readOnly || data.readOnly}
        suffix={props.suffix}
        changed={data.isChanged}
        renderInput={(opts) =>
            <div className={"formItem" + (props.suffix ? " formItemWithSuffix" : "")}
                 style={props.fullWidth ? {display: "block", width: "100%"} : undefined}>
                {!opts && data.validationError && <div className="validationErrorMsg">{data.validationError.msg}</div>}
                <input
                    ref={opts?.inputRef}
                    type={props.type}
                    autoFocus={props.autoFocus}
                    name={data.name}
                    value={TextParser.toInput(data.value)}
                    readOnly={opts ? undefined : (props.readOnly || data.readOnly)}
                    disabled={opts ? undefined : props.disabled}
                    onChange={(e) => data.onChange(TextParser.toOutput(e.target.value) as T)}
                    onBlur={opts ? () => inlineSaveOrCancel(opts, props, data) : undefined}
                    onKeyDown={opts ? e => {
                        if (e.key === "Enter") { e.preventDefault(); inlineSaveOrCancel(opts, props, data); }
                        if (e.key === "Escape") { opts.onCancel(); props.onInlineEditCancel?.(); }
                    } : undefined}
                    placeholder={props.placeholder}
                    className={"rkInput " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + " " + (props.suffix ? "inputWithSuffix" : "")}
                    style={inputStyle}
                />
                {props.suffix && <div className={"inputSuffix " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}>{props.suffix}</div>}
            </div>
        }
    />;
}

export function TextInput<T extends string>(props: InputProps<T>) {
    return <InternalTextInput type="text" {...props} />
}

export function PhoneInput(props: InputProps<string>) {
    return <InternalTextInput type="tel" {...props} />
}

export function EmailInput<T extends string>(props: InputProps<T>) {
    return <InternalTextInput type="email" {...props} />
}

export function PasswordInput(props: InputProps<string>) {
    return <InternalTextInput type="password" {...props} />
}

export class TextParser {
    public static toInput(value: unknown): string | null {
        if (value === null || value === undefined || value === "") {
            return "";
        } else {
            return String(value);
        }
    }

    public static toOutput(value: unknown): string | null {
        if (value === null || value === undefined || value === "") {
            return null;
        } else {
            return String(value);
        }
    }

}


