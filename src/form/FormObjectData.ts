import {FormValidationErrors as ValidationErrors} from "../ApiError";
import {FormRoot} from "./FormRoot";

export type PropertyPath = (string | number)[];

export class FormObjectData<T> {

    private readonly root: FormRoot<T>;
    private readonly _onChange?: (newValue: T, oldValue: T) => void;

    private initialValue!: T;
    private currentValue!: T;
    private validationErrors: ValidationErrors<T> | undefined
    private hasChanges: boolean = false;

    constructor(root: FormRoot<T>, onChange?: (newValue: T, oldValue: T) => void) {
        this.root = root;
        this._onChange = onChange;
    }

    public setValue(value: T) {
        this.initialValue = value;
        this.currentValue = cloneObj(value);
        this.validationErrors = undefined;
        this.root.forceRender();
    }

    public setCurrentValue(value: T) {
        this.currentValue = cloneObj(value);
        this.hasChanges = true;
        this.validationErrors = undefined;
        this._onChange?.(this.currentValue, this.initialValue);
        this.root.resetSubmitError();
    }

    public setInitialValue(path: PropertyPath, value: any): void {
        if (path.length === 0) {
            this.setValue(value);
            return;
        }
        const assign = (node: any) => {
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                if (node[key] === undefined) {
                    node[key] = typeof path[i + 1] === "number" ? [] : {};
                }
                node = node[key];
            }
            node[path[path.length - 1]] = cloneObj(value);
        };
        assign(this.initialValue);
        assign(this.currentValue);
        this.validationErrors = undefined;
        this.root.forceRender();
    }

    public setValidationErrors(errors: ValidationErrors<T> | undefined) {
        this.validationErrors = errors;
        this.root.forceRender();
    }

    public setPropertyValidationError(path: PropertyPath, errors: ValidationErrors<any> | undefined): void {
        if (!this.validationErrors && !errors) {
            return;
        }
        if (!this.validationErrors) {
            this.validationErrors = {msg: ""}
        }
        let validationError: any = this.validationErrors;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            if (i === path.length - 1) {
                if (validationError.errors === undefined) {
                    validationError.errors = typeof key === "number" ? [] : {};
                }
                validationError.errors[key] = errors;
            } else {
                if (validationError.errors === undefined) {
                    validationError.errors = typeof key === "number" ? [] : {};
                }
                if (validationError.errors[key] === undefined) {
                    validationError.errors[key] = {msg: undefined}
                }
                validationError = validationError?.errors?.[key];
            }
        }
        this.root.forceRender();
    }

    public isPropertyChanged(path: PropertyPath): boolean {
        let element: any = this.currentValue;
        let originalElement: any = this.initialValue;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            element = element?.[key];
            originalElement = originalElement?.[key];
            if (originalElement === undefined && element !== undefined) {
                return true;
            }
        }
        return !compare(element, originalElement);
    }

    public setPropertyValue(path: PropertyPath, value: any): void {
        if (path.length === 0) {
            // A whole-object set is an edit like a field set: replace current, keep the initial
            // snapshot so the form reads as changed. Use setInitialValue to (re)define the baseline.
            this.setCurrentValue(value);

        } else {
            let didChange = false;
            let originalValue: any = this.initialValue;
            let currentValue: any = this.currentValue;
            let validationError: any = this.validationErrors;
            for (let i = 0; i < path.length; i++) {
                const key = path[i];
                if (i === path.length - 1) {
                    if (currentValue[key] !== value) {
                        currentValue[key] = value;
                        didChange = true;
                        this.hasChanges = this.hasChanges || originalValue?.[key] !== value
                    }
                    if (validationError?.errors) {
                        validationError.errors[key] = undefined;
                    }
                } else {
                    if (currentValue[key] === undefined) {
                        currentValue[key] = typeof key === "number" ? [] : {};
                    }
                    currentValue = currentValue[key]
                    originalValue = originalValue?.[key];
                    validationError = validationError?.errors?.[key];
                }
            }
            if (didChange) {
                this._onChange?.(this.currentValue, this.initialValue);
                this.root.resetSubmitError();
            }
        }
    }

    public getPropertyValidationError(path: PropertyPath): ValidationErrors<any> | undefined {
        let element: any = this.validationErrors;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            element = element?.errors?.[key];
        }
        return element;
    }

    public getPropertyValue(path: PropertyPath): any {
        let element: any = this.currentValue;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            element = element?.[key];
        }
        return element;
    }

    public getPropertyInitialValue(path: PropertyPath): any {
        let element: any = this.initialValue;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            element = element?.[key];
        }
        return element;
    }

}

function cloneObj<T>(obj: T): T {
    if (obj === undefined) {
        return undefined as T;
    } else if (obj === null) {
        return null as T;
    } else if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
        return obj;
    } else if (obj instanceof File) {
        return obj;
    } else if (Array.isArray(obj)) {
        const copy: any = [];
        for (let i = 0; i < obj.length; i++) {
            copy[i] = cloneObj(obj[i]);
        }
        return copy;
    } else if (typeof obj === "object") {
        const copy: any = {};
        for (const k in obj) {
            copy[k] = cloneObj(obj[k])
        }
        return copy;
    } else {
        console.error(obj);
        throw new Error("Can't clone object")
    }
}

function compare<T>(a: T, b: T): boolean {
    if (a === b) {
        return true;
    } else if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
        if (Array.isArray(a) !== Array.isArray(b)) {
            return false;
        } else if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }
        }
        for (const k in a) {
            if (!compare(a[k], b[k])) {
                return false;
            }
        }
        return true;
    }
    return false;
}
