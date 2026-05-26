import {CSSProperties} from "react";
import {FormObject} from "../useAsyncForm";
import {FormValidationErrors as ValidationErrors} from "../../ApiError";

export type AnyFormElement = {
    name?: string;
    readOnly?: boolean;
    disabled?: boolean;
    style?: CSSProperties,
    className?: string
    /** Focus the input on mount (forwarded to the native element). */
    autoFocus?: boolean;
    /** Stretch the input to fill its container instead of the fixed default width. */
    fullWidth?: boolean;
    /** When true, renders as plain text and switches to input on click. */
    inlineEdit?: boolean;
    /** Placeholder shown when inlineEdit is true and value is empty. Default: "Click to edit" */
    inlineEditPlaceholder?: string;
    /** Called when inlineEdit saves (blur/Enter). For direct mode (value+onChange), fires after onChange. */
    onInlineEditSave?: () => void;
    /** Called when inlineEdit is cancelled (Escape). Use to revert value in direct mode. */
    onInlineEditCancel?: () => void;
    /** When true and inlineEdit is active, saving an empty value triggers cancel instead. */
    required?: boolean;
}

export type AnyInputElement<T> = AnyInputElementWithProp<T> | AnyInputElementWithValue<T>

export type AnyInputElementWithProp<T> = AnyFormElement & {
    prop: FormObject<T>
    onChange?: (newVal: T) => void
}

export type AnyInputElementWithValue<T> = AnyFormElement & {
    value: T
    validationError?: ValidationErrors<T>
    onChange?: (newVal: T) => void
}

// ---------------------------------------

// ---------------------------------------

export function useInputData<T>(input: AnyInputElement<T>): InputData<T> {
    if (isWithProp(input)) {
        return {
            name: input.prop.name(),
            value: input.prop.val(),
            validationError: input.prop.validationErrors(),
            readOnly: input.prop.getForm().isReadOnly() || input.prop.getForm().isSaving() || input.prop.getForm().isLoading(),
            isChanged: input.prop.isChanged(),
            onChange: (e: any) => {
                input.prop.set(e);
                input.onChange?.(e);
            }
        }
    } else {
        return {
            name: input.name,
            value: input.value,
            validationError: input.validationError,
            readOnly: false,
            onChange: input.onChange
        }
    }
}

export interface InputData<T> {
    name?: string;
    value: T
    validationError?: ValidationErrors<T>
    onChange: (newVal: T) => void
    readOnly?: boolean
    isChanged?: boolean
}

export function isWithProp<T>(input: AnyInputElement<T>): input is AnyInputElementWithProp<T> {
    return !!(input as any).prop
}
