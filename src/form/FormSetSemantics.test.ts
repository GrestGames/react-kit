import {describe, it, expect} from "vitest";
import {FormRoot} from "./FormRoot";

type T = {a?: number; b?: string; rows?: {x: number}[]};

function make(init: T) {
    const root = new FormRoot<T>(() => {}, {init: init as any, onSubmit: async () => {}});
    root.load();
    return root.proxyHandler.proxy as any;
}

describe("form .set vs .setInitial semantics", () => {
    it("root .set replaces current, keeps initial -> isChanged() true", () => {
        const F = make({a: 1, b: "x"});
        expect(F.isChanged()).toBe(false);
        F.set({a: 2, b: "y"});
        expect(F.isChanged()).toBe(true);
        expect(F.a.val()).toBe(2);
        expect(F.a.getInitialValue()).toBe(1);
    });

    it("root .setInitial redefines baseline -> isChanged() false", () => {
        const F = make({a: 1});
        F.setInitial({a: 9, b: "z"});
        expect(F.isChanged()).toBe(false);
        expect(F.a.val()).toBe(9);
        expect(F.a.getInitialValue()).toBe(9);
    });

    it("field .set still marks changed and leaves initial", () => {
        const F = make({a: 1});
        F.a.set(5);
        expect(F.isChanged()).toBe(true);
        expect(F.a.getInitialValue()).toBe(1);
    });

    it("current and initial are independent after .set (no shared refs)", () => {
        const F = make({rows: [{x: 1}]});
        F.set({rows: [{x: 2}]});
        F.rows[0].x.set(3);
        expect(F.rows[0].x.val()).toBe(3);
        expect(F.getInitialValue().rows[0].x).toBe(1);
    });

    it("onChange fires on root .set", () => {
        let fired = 0;
        const root = new FormRoot<T>(() => {}, {init: {a: 1} as any, onSubmit: async () => {}, onChange: () => { fired++; }});
        root.load();
        (root.proxyHandler.proxy as any).set({a: 2});
        expect(fired).toBeGreaterThan(0);
    });
});
