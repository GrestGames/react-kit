import {CSSProperties, Fragment, KeyboardEvent, useId} from "react";
import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import {MessageType, wrapToolTip} from "../../mini/ToolTip";
import {Intent} from "../../intents";
import "./segmentedControl.css";

export interface SegmentOption<T> {
    id: T
    name: string
    title?: MessageType
    disabled?: boolean
}

export type SegmentedControlProps<T> = AnyInputElement<T> & {
    options: SegmentOption<T>[]
    size?: "micro" | "small" | "normal"
    /** Fill colour of the selected segment. Default "info". */
    intent?: Intent
    "aria-label"?: string
}

export function SegmentedControl<T extends string | number>(props: SegmentedControlProps<T>) {
    const data = useInputData<T>(props);
    const baseId = useId();

    const groupDisabled = !!(props.disabled || props.readOnly || data.readOnly);
    const enabled = groupDisabled ? [] : props.options.filter(o => !o.disabled);
    const selected = props.options.find(o => o.id == data.value);
    const focusId = selected && enabled.includes(selected) ? selected.id : enabled[0]?.id;
    const segmentId = (i: number) => `${baseId}-${i}`;

    const select = (option: SegmentOption<T>) => {
        if (groupDisabled || option.disabled || option.id == data.value) return;
        data.onChange(option.id);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (!enabled.length) return;
        const i = enabled.findIndex(o => o.id == data.value);
        const to = e.key === "ArrowLeft" || e.key === "ArrowUp" ? enabled[(i - 1 + enabled.length) % enabled.length]
            : e.key === "ArrowRight" || e.key === "ArrowDown" ? enabled[(i + 1) % enabled.length]
            : e.key === "Home" ? enabled[0]
            : e.key === "End" ? enabled[enabled.length - 1]
            : undefined;
        if (!to) return;
        e.preventDefault();
        select(to);
        document.getElementById(segmentId(props.options.indexOf(to)))?.focus();
    };

    const intent = props.intent ?? "info";
    const vars = {
        "--seg-bg": `var(--rk-${intent}-fill)`,
        "--seg-fg": `var(--rk-${intent}-fill-text)`,
    } as CSSProperties;
    const className = ["rkSegmented", `rkSegmented-size-${props.size ?? "normal"}`, props.fullWidth && "fullWidth",
        data.isChanged && "changed", data.validationError && "error", groupDisabled && "disabled", props.className].filter(Boolean).join(" ");

    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <div role="radiogroup" aria-label={props["aria-label"]} aria-disabled={groupDisabled || undefined}
             className={className} style={{...vars, ...props.style}} onKeyDown={onKeyDown}>
            {props.options.map((option, i) => {
                const checked = option.id == data.value;
                const disabled = groupDisabled || option.disabled;
                return <Fragment key={String(option.id)}>
                    {wrapToolTip({title: option.title}, <button
                        type="button" role="radio" id={segmentId(i)} name={data.name}
                        aria-checked={checked} aria-disabled={disabled || undefined}
                        tabIndex={option.id === focusId ? 0 : -1}
                        className={"rkSegment" + (checked ? " selected" : "")}
                        onClick={() => select(option)}>{option.name}</button>)}
                </Fragment>;
            })}
        </div>
    </div>;
}
