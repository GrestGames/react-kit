/**
 * Helper to assert unreachable code paths (exhaustive checks).
 * Throws at runtime if reached, and produces a compile-time error if a case is unhandled.
 */
export function UnreachableCode(value: never): never {
    throw new Error(`Unreachable code reached with value: ${value}`);
}
