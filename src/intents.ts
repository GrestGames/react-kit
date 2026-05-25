export type Intent =
    | "default"
    | "neutral"
    | "info"
    | "cool"
    | "success"
    | "warning"
    | "danger"
    | "critical";

/** Resolves intent / hue to a CSS color value.
 *  - intent → `var(--rk-<intent>)`
 *  - hue    → `var(--rk-<hue>)` (caller defines the token; silently no-ops if absent)
 *  - neither → `var(--rk-accent)` */
export function resolveColorVar(intent?: Intent, hue?: string): string {
    if (intent) return `var(--rk-${intent})`;
    if (hue) return `var(--rk-${hue})`;
    return "var(--rk-accent)";
}
