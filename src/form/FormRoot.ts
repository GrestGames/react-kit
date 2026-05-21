import {ERROR, VALIDATION_ERROR} from "@grest-ts/schema";
import {ApiErrors, FormValidationErrors} from "../ApiError";
import {FormObjectProxyHandler} from "./FormObjectProxyHandler";
import {FormObjectData} from "./FormObjectData";

export interface FormRootListeners<T> {
    init: T | (() => Promise<T>),
    onSubmit: (obj: T) => Promise<void>
    onChange?: (obj: T, old: T) => void
}

export class FormRoot<T> {

    private readonly reactRefresh: () => void;
    private readonly listeners: FormRootListeners<T>;

    public readonly data: FormObjectData<T>;
    public readonly proxyHandler: FormObjectProxyHandler

    private _isReadOnly: boolean = false;

    private _isLoading: boolean = true;
    private loadError: ERROR<string, any>;
    private _isReloading: boolean = false;

    private _isSaving: boolean = false;
    private submitError: ERROR<string, any>;

    constructor(reactRefresh: () => void, listeners: FormRootListeners<T>) {
        this.reactRefresh = reactRefresh;
        this.listeners = listeners;
        this.proxyHandler = new FormObjectProxyHandler(this, null, null);
        this.data = new FormObjectData<T>(this, this.listeners.onChange);
    }

    /**
     * Reloads form using init method (like page would be reloaded). All current state will be lost.
     */
    public load = async (): Promise<void> => {
        return this._reload(false);
    }

    public reload = async (): Promise<void> => {
        return this._reload(true);
    }

    private _reload = async (isReload: boolean): Promise<void> => {
        if (isReload) {
            this._isReloading = true;
        }
        this._isLoading = true;
        this.forceRender()
        if (typeof this.listeners.init === "function") {
            try {
                const res = await (this.listeners.init as any)();
                this.data.setValue(res || {} as any);
            } catch (err) {
                this.loadError = ApiErrors.is(err) ? err : ERROR.fromUnknown(err);
            } finally {
                if (isReload) {
                    this._isReloading = false;
                }
                this._isLoading = false;
                this.forceRender()
            }
        } else {
            this.data.setValue(this.listeners.init);
            if (isReload) {
                this._isReloading = false;
            }
            this._isLoading = false;
            this.forceRender()
        }
    }


    /**
     * Submits form.
     * Notice that this method will throw exceptions in case there is any kind of error (network, not okay returned etc). You have to catch it, but usually can ignore as it is handled.
     */
    public submit = async (): Promise<void> => {
        const value = this.data.getPropertyValue([]);
        if (value && typeof value === "object" && !Array.isArray(value)) {
            for (const key of this.proxyHandler.getFieldNames()) {
                if (value[key] === undefined) {
                    value[key] = null;
                }
            }
        }
        const promise = this.listeners.onSubmit(value);
        if (promise) {
            this._isSaving = true;
            this.forceRender()
            try {
                await promise;
                this.submitError = undefined;
            } catch (err) {
                const error = ApiErrors.is(err) ? err : ERROR.fromUnknown(err);
                if (error?.type === VALIDATION_ERROR.TYPE) {
                    const formErrors = ApiErrors.issuesToFormErrors(
                        ApiErrors.getValidationErrors(error as typeof VALIDATION_ERROR.infer)
                    );
                    this.data.setValidationErrors(formErrors);
                    this.submitError = error;
                } else {
                    this.data.setValidationErrors(undefined)
                    this.submitError = error
                }
            } finally {
                this._isSaving = false;
                this.forceRender()
            }
        }
    }

    public forceRender(): this {
        this.reactRefresh()
        return this;
    }

    public isReadOnly(): boolean {
        return this._isReadOnly;
    }

    public setReadOnly(value: boolean): this {
        this._isReadOnly = value;
        this.forceRender()
        return this;
    }

    public isLoading(): boolean {
        return this._isLoading;
    }

    public isReloading(): boolean {
        return this._isReloading;
    }

    public isSaving(): boolean {
        return this._isSaving;
    }

    public getLoadError(): ERROR<string, any> {
        return this.loadError;
    }

    public getValidationErrors(): FormValidationErrors<T> {
        return this.data.getPropertyValidationError([]);
    }

    /**
     * Set validation errors on the form. Forces refresh.
     */
    public setValidationErrors(errors: FormValidationErrors<T>): this {
        this.data.setValidationErrors(errors);
        this.forceRender()
        return this;
    }

    /**
     * Returns error that happened that is now validation error.
     */
    public getSubmitError(): ERROR<string, any> {
        return this.submitError;
    }

    /**
     * Removes last submit error (including validation errors) and redraws everything.
     */
    public resetSubmitError(): this {
        this.submitError = undefined;
        this.forceRender()
        return this;
    }
}
