import {useEffect, RefObject} from "react";

export function useOutsideClick(
    refs: RefObject<Element | null>[],
    callback: () => void,
    opts?: { active?: boolean; excludeIds?: string[] }
) {
    const active = opts?.active ?? true;
    useEffect(() => {
        if (!active) return () => {};
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            for (const ref of refs) {
                if (ref.current && ref.current.contains(target)) return;
            }
            if (opts?.excludeIds) {
                for (const id of opts.excludeIds) {
                    const el = document.getElementById(id);
                    if (el && el.contains(target)) return;
                }
            }
            callback();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [active]);
}
