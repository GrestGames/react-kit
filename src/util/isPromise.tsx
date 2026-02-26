export function isPromise(value: any): value is Promise<any> {
    return value != null && typeof value.then === "function";
}