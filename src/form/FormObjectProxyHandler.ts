import {FormRoot} from "./FormRoot";
import {PropertyPath} from "./FormObjectData";

export class FormObjectProxyHandler {

    private readonly root: FormRoot<any>;

    public readonly parent: FormObjectProxyHandler | null;
    private children: Map<string, FormObjectProxyHandler> = new Map()

    public readonly name: string | number | null;
    public readonly path: PropertyPath;
    public readonly proxy: FormObjectProxyHandler;

    constructor(root: FormRoot<any>, parent: FormObjectProxyHandler | null, name: string | number | null) {
        this.root = root;

        if (parent) {
            this.name = name;
            this.path = [...parent.path, name];
            this.parent = parent;
        } else {
            this.name = null;
            this.path = []
            this.parent = null;
        }

        const target: () => undefined = () => undefined;
        this.proxy = new Proxy(target, this);
    }

    private getPropertyValue(): any {
        return this.root.data.getPropertyValue(this.path)
    }

    private applyFunc(name: string | Symbol, args: any[]): any {
        // Conforms to FormObject and FormArray interfaces
        switch (name) {
            case 'name':
                return this.path.join(".");
            case 'val':
                return this.getPropertyValue();
            case Symbol.toPrimitive:
                return this.getPropertyValue();
            case 'getInitialValue':
                return this.root.data.getPropertyInitialValue(this.path)
            case 'isChanged':
                return this.root.data.isPropertyChanged(this.path);
            case "toString":
                return String(this.getPropertyValue());
            case "validationErrors":
                return this.root.data.getPropertyValidationError(this.path);
            case "setValidationError":
                this.root.data.setPropertyValidationError(this.path, args[0]);
                return;
            case "set":
                this.root.data.setPropertyValue(this.path, args[0])
                return;
            case "getForm":
                return this.root;
            case "forEach":
                const value0 = this.getPropertyValue();
                if (Array.isArray(value0)) {
                    return value0.map((val: any, index: any) => {
                        const p = new FormObjectProxyHandler(this.root, this, index);
                        args[0](p.proxy, index, this.proxy)
                    });
                } else {
                    return [];
                }
            case "map":
                const value1 = this.getPropertyValue()
                if (Array.isArray(value1)) {
                    return value1.map((val: any, index: any) => {
                        const p = new FormObjectProxyHandler(this.root, this, index);
                        return args[0](p.proxy, index, this.proxy)
                    });
                } else {
                    return [];
                }
            case "push":
                const value2 = this.getPropertyValue()
                if (Array.isArray(value2)) {
                    value2.push(args[0])
                    this.root.forceRender();
                    return value2.length;
                } else {
                    return 0;
                }
            case "splice":
                const value3 = this.getPropertyValue()
                if (Array.isArray(value3)) {
                    const res = value3.splice(args[0], args[1]);
                    this.root.forceRender();
                    return res;
                } else {
                    return [];
                }
            case "when":
                const fieldValue = this.root.data.getPropertyValue([...this.path, args[0]]);
                return fieldValue === args[1] ? args[2](this.proxy) : null;
            case "removeFromParentArray":
                const parentValue = this.parent.getPropertyValue();
                if (Array.isArray(parentValue) && typeof this.name === "number") {
                    parentValue.splice(this.name, 1);
                    this.root.forceRender();
                } else {
                    throw new Error("Invalid operation! Can only remove elements, if parent is arrays!");
                }
                return;
            default:
                const err = "Calling undefined function " + name;
                console.log(err, args)
                throw new Error(err);
        }
    }

    public apply(target: any, thisArg: any, args: any[]): any {
        // console.log("APPLY ", this.path, this.name)
        return this.parent.applyFunc(this.name as string | Symbol, args);
    }

    public get(target: any, prop: string) {
        //  console.log("GET ", this.path, prop)
        if (!this.children.has(prop)) {
            this.children.set(prop, new FormObjectProxyHandler(this.root, this, prop))
        }
        return this.children.get(prop).proxy;
    }

    /**
     * Returns field names that were accessed as form fields (not method calls).
     * Field proxies have sub-children (e.g. val(), name()) while method proxies don't.
     */
    public getFieldNames(): string[] {
        const fields: string[] = [];
        for (const [key, child] of this.children) {
            if (child.children.size > 0) {
                fields.push(key);
            }
        }
        return fields;
    }
}

