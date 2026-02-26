import {useState, useRef, useCallback, ReactNode, CSSProperties} from "react";
import "./InlineEdit.css";

export interface InlineEditOpts {
    onSave: () => void;
    onCancel: () => void;
    inputRef: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}

interface Props {
    /** When false, just renders renderInput(null) as a passthrough. */
    inlineEdit?: boolean;
    /** Current display value */
    displayValue: string | null;
    /** Render the actual input element. opts is null when inlineEdit is off. */
    renderInput: (opts: InlineEditOpts | null) => ReactNode;
    /** Is this a multiline (textarea) field? */
    multiline?: boolean;
    placeholder?: string;
    style?: CSSProperties;
    className?: string;
    readOnly?: boolean;
    /** Suffix content (icon/label) shown after the value */
    suffix?: string | ReactNode;
    /** Whether the value has been changed (yellow border/background) */
    changed?: boolean;
}

export function InlineEditWrap({inlineEdit = false, displayValue, renderInput, multiline, placeholder, style, className, readOnly, suffix, changed}: Props) {
    const [editing, setEditing] = useState(false);
    const readRef = useRef<HTMLDivElement>(null);
    const prevHeightRef = useRef(0);
    const focusedRef = useRef(false);

    if (!inlineEdit) {
        return <>{renderInput(null)}</>;
    }

    const startEdit = () => {
        if (readOnly) return;
        prevHeightRef.current = readRef.current?.offsetHeight ?? 0;
        focusedRef.current = false;
        setEditing(true);
    };

    const save = () => setEditing(false);
    const cancel = () => setEditing(false);

    // Memoized so the ref callback isn't re-invoked on every render,
    // which would reset the cursor position via setSelectionRange.
    const setInputRef = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (!el || focusedRef.current) return;
        focusedRef.current = true;
        requestAnimationFrame(() => {
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
            // For textareas, match the previous display height
            if (el instanceof HTMLTextAreaElement && prevHeightRef.current > 0) {
                el.style.height = "0";
                el.style.height = Math.max(el.scrollHeight + 2, prevHeightRef.current) + "px";
            }
        });
    }, []);

    if (editing) {
        return <>{renderInput({onSave: save, onCancel: cancel, inputRef: setInputRef})}</>;
    }

    const text = displayValue || "";
    const hasValue = text.length > 0;

    if (suffix) {
        const displayCls = "inlineEditDisplay inputWithSuffix"
            + (multiline ? " inlineEditMultiline" : "")
            + (className ? " " + className : "");
        const wrapCls = "inlineEditSuffixWrap"
            + (readOnly ? "" : " inlineEditClickable")
            + (!hasValue ? " inlineEditEmpty" : "")
            + (changed ? " inlineEditChanged" : "");

        return <div className="formItem">
            <div className={wrapCls} onClick={readOnly ? undefined : startEdit}>
                <div ref={readRef} className={displayCls} style={style}>
                    {hasValue ? <>{text} <span className="inlineEditSuffixText">{suffix}</span></> : (placeholder || "\u00A0")}
                </div>
                <div className="inputSuffix" style={{visibility: "hidden"}}>{suffix}</div>
            </div>
        </div>;
    }

    const cls = "inlineEditDisplay"
        + (multiline ? " inlineEditMultiline" : "")
        + (!hasValue ? " inlineEditEmpty" : "")
        + (changed ? " changed" : "")
        + (readOnly ? "" : " inlineEditClickable")
        + (className ? " " + className : "");

    return <div className="formItem">
        <div ref={readRef} className={cls} style={style} onClick={readOnly ? undefined : startEdit}>
            {hasValue ? text : (placeholder || "\u00A0")}
        </div>
    </div>;
}
