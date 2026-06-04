import {ReactNode} from "react";

export class EnumHelper<T, R extends EnumEntry<T>> {

    private readonly _list: R[]
    private readonly _map: Map<T, R>
    private readonly _getElement?: (item: R) => ReactNode

    constructor(list: R[], getElement?: (item: R) => ReactNode) {
        this._list = list;
        this._map = new Map(list.map((e) => [e.id, e]));
        this._getElement = getElement;
    }

    public getList(): EnumEntry<T>[] {
        return this._list;
    }

    public getFilteredList(f: (f: EnumEntry<T>) => boolean): EnumEntry<T>[] {
        const list: EnumEntry<T>[] = [];
        for (let i = 0; i < this._list.length; i++) {
            if (f(this._list[i])) {
                list.push(this._list[i]);
            }
        }
        return list;
    }

    public get(id: T): R | undefined {
        return this._map.get(id)
    }

    public getTitle(id: T): string {
        return this._map.get(id)?.name || ""
    }

    public getElement(id: T): ReactNode {
        const item = this.get(id);
        if (item) {
            if (this._getElement) {
                return this._getElement(item);
            } else {
                return <>{item.name}</>
            }
        } else {
            return <></>
        }
    }
}

export interface EnumEntry<T> {
    id: T,
    name: string
}
