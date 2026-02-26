import {useState, useCallback} from "react";

export interface InlineEditState {
    editing: boolean;
    start: () => void;
    save: () => void;
    cancel: () => void;
}

/**
 * Hook for inline-edit mode on form inputs.
 * Manages the editing toggle state and provides auto-focus on start.
 */
export function useInlineEdit(opts: {
    onSave?: () => void;
}): InlineEditState {
    const [editing, setEditing] = useState(false);

    const start = useCallback(() => setEditing(true), []);

    const save = useCallback(() => {
        setEditing(false);
        opts.onSave?.();
    }, [opts.onSave]);

    const cancel = useCallback(() => setEditing(false), []);

    return {editing, start, save, cancel};
}

/**
 * Auto-focuses an input/textarea element after inline edit starts.
 * Call this in a requestAnimationFrame after setting editing=true.
 */
export function autoFocusInlineEdit(el: HTMLInputElement | HTMLTextAreaElement | null) {
    if (!el) return;
    el.focus();
    if (el instanceof HTMLInputElement) {
        el.select();
    }
}
