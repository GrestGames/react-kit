import {ERROR, VALIDATION_ERROR} from "@grest-ts/schema";
import type {ValidationIssueJson} from "@grest-ts/schema";

/**
 * Client-side error used for frontend-only issues (e.g. expired calls, network errors).
 */
const FRONTEND_ERROR = ERROR.define("FrontendError", 500);

export class ApiErrors {

    public static is(error: any): error is ERROR<string, any> {
        return error instanceof ERROR || (error?.success === false && typeof error?.type === "string");
    }

    public static getDisplayMessage(error: ERROR<string, any>): string {
        if (error.context?.displayMessage) return error.context.displayMessage;
        const debug = error instanceof ERROR ? error.getDebugContext() : undefined;
        const originalError = debug?.originalError;
        if (originalError instanceof Error) return originalError.message;
        if (typeof originalError === "string") return originalError;
        return error.type;
    }

    public static getValidationErrors(error: typeof VALIDATION_ERROR.infer): ValidationIssueJson[] {
        return error.data ?? [];
    }

    /**
     * Ensures any error is an ERROR instance.
     */
    public static ensure(error: unknown): ERROR<string, any> {
        return ERROR.fromUnknown(error);
    }

    /**
     * Creates a frontend-only error (e.g. expired call, unknown client error).
     */
    public static frontendError(tag: string, message: string): ERROR<string, never> {
        return new FRONTEND_ERROR({displayMessage: message, debugMessage: tag});
    }

    /**
     * Converts flat validation issues array [{path: "name", message: "..."}]
     * to nested tree format {msg: "", errors: {name: {msg: "..."}}} used by FormRoot.
     */
    public static issuesToFormErrors(issues: ValidationIssueJson[]): FormValidationErrors<any> {
        const root: FormValidationErrors<any> = {msg: ""};
        for (const issue of issues) {
            const parts = issue.path.split(".");
            let current: any = root;
            for (const part of parts) {
                if (!current.errors) {
                    current.errors = {};
                }
                if (!current.errors[part]) {
                    current.errors[part] = {msg: ""};
                }
                current = current.errors[part];
            }
            current.msg = issue.message;
        }
        return root;
    }
}

export type FormValidationErrors<T> = FormValidationErrorData<T> & {
    errors?: {
        [P in keyof T]?: T[P] extends string | number | boolean | undefined ? FormValidationErrorData<T[P]> : FormValidationErrors<T[P]>
    }
}

export interface FormValidationErrorData<T> {
    msg: string;
}
