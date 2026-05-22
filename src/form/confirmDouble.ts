export const DEFAULT_CONFIRM_DOUBLE_TEXT = "Click again to confirm";
export const CONFIRM_DOUBLE_WINDOW_MS = 2000;

const CONFIRM_DOUBLE_FALLBACKS = ["Sure?", "?"];

const measureCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;

/** Longest of [full, "Sure?", "?"] that fits the element's current content width. */
export function pickConfirmText(el: HTMLElement, full: string): string {
    const candidates = [full, ...CONFIRM_DOUBLE_FALLBACKS];
    const shortest = candidates[candidates.length - 1];

    const cs = getComputedStyle(el);
    const avail = el.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0") - 1;
    if (avail <= 0) return shortest;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
        ctx = measureCanvas?.getContext("2d") ?? null;
    } catch {
        ctx = null;
    }
    if (!ctx) return shortest;

    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    for (const c of candidates) {
        if (ctx.measureText(c).width <= avail) return c;
    }
    return shortest;
}
