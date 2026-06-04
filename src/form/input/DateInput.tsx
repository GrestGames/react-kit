import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import DatePicker from "react-datepicker";
import {DateUtils} from "../../util/DateUtils";
import {FloatingPortal} from "@floating-ui/react";
import type {ReactNode} from "react";

function CalendarPortal({children}: {children?: ReactNode}) {
    return <FloatingPortal>
        <div style={{position: "relative", zIndex: "var(--rk-z-popover)"}}>
            {children}
        </div>
    </FloatingPortal>;
}

export function DateInput<T extends string>(props: AnyInputElement<T>) {
    const data = useInputData(props);
    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <DatePicker
            name={data.name}
            autoComplete={"off"}
            dateFormat="yyyy/MM/dd"
            placeholderText="YYYY/MM/DD"
            selected={DateParser.toInput(data.value)}
            readOnly={props.readOnly || data.readOnly}
            disabled={props.disabled}
            onChange={(date: Date | null) => data.onChange(DateParser.toOutput(date) as T)}
            className={"datePicker rkInput " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}
            popperContainer={CalendarPortal}
            popperProps={{strategy: "fixed"}}
        />
    </div>
}

export function YearMonthSelect<T extends string>(props: AnyInputElement<T> & { addEmpty?: boolean, startYear?: number }) {
    const data = useInputData(props);
    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        <DatePicker
            name={data.name}
            autoComplete={"off"}
            showMonthYearPicker
            dateFormat="yyyy/MM"
            placeholderText="YYYY/MM"
            selected={DateParser.toInput(data.value)}
            readOnly={props.readOnly || data.readOnly}
            disabled={props.disabled}
            onChange={(date: Date | null) => data.onChange(DateParser.toYearMonthOutput(date) as T)}
            className={"datePicker rkInput " + (props.className ? props.className : "") + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "")}
            popperContainer={CalendarPortal}
            popperProps={{strategy: "fixed"}}
        />
    </div>
}

class DateParser {
    public static toInput(value: unknown): Date | undefined {
        if (typeof value === "string" && value !== DateUtils.ZERO_DATE) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return undefined;
    }

    public static toOutput(date: Date | null): string | null {
        if (!date || isNaN(date.getTime())) {
            return null;
        }
        const str = DateUtils.date(date);
        if (str === DateUtils.ZERO_DATE) {
            return null;
        }
        return str
    }

    public static toYearMonthOutput(date: Date | null): string | null {
        if (!date || isNaN(date.getTime())) {
            return null;
        }
        const str = DateUtils.yearMonth(date);
        if (str === "0000-00") {
            return null;
        }
        return str
    }

}