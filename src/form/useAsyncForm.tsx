import {DependencyList, useMemo, useState} from "react";
import {FormRoot} from "./FormRoot";
import {useAsyncEffect} from "../helpers/useAsyncEffect";
import {FormValidationErrors as ValidationErrors} from "../ApiError";

export interface Props<T> {
    readOnly?: boolean;
    init: T | (() => Promise<T>),
    reloadOnSubmit?: boolean;
    onSubmit: (obj: T) => Promise<boolean | void>
    onChange?: (obj: T, original: T) => void
}

export function useAsyncForm<T>(props: Props<T>, dependencies: DependencyList): [FormObject<T>, T] {
    const [_, setVer] = useState<number>(0);

    const reactRefresh = () => {
        setVer((v) => v + 1);
    };

    const root = useMemo(() => {
        return new FormRoot<T>(reactRefresh, {
            init: props.init,
            onSubmit: async (value) => {
                const res = await props.onSubmit(value);
                if ((props.reloadOnSubmit || props.reloadOnSubmit === undefined) && res !== false) {
                    await root.reload();
                }
            },
            onChange: props.onChange
        }).setReadOnly(props.readOnly || false);
    }, dependencies);

    useAsyncEffect(async () => {
        return root.load();
    }, [root]);

    return [
        root.proxyHandler.proxy as any,
        root.data.getPropertyValue([])
    ]
}

export type FormObject<T> = Access<T> & ([T] extends [(infer R)[]] ? FormArray<R> : { [P in keyof T]: FormObject<T[P]> });

type FormArray<Element> = Access<Element[]> & {
    forEach: (call: (element: FormObject<Element>, index: number, arr: FormArray<Element>) => void) => void;
    map: <X>(call: (element: FormObject<Element>, index: number, arr: FormArray<Element>) => X) => X[]
    push: (value: Element) => number;
    splice: (start: number, deleteCount?: number) => Element[],
    getValue: () => Element[],
    getInitialValue: () => Element[],
    [key: number]: FormObject<Element>
}

type Access<T> = {
    name(): string;
    val(): T;
    getInitialValue: () => T,
    toString(): T;
    isChanged(): boolean;
    validationErrors(): ValidationErrors<T>,
    setValidationError(error: ValidationErrors<T>): true
    set(value: T, error?: ValidationErrors<T>): void
    getForm: () => FormRoot<T>
    removeFromParentArray: () => void;
    when<K extends keyof T, V extends T[K], R>(field: K, value: V, render: (form: FormObject<Extract<T, Record<K, V>>>) => R): R | null;
}