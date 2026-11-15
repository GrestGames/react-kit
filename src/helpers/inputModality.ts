let keyboard = false;

if (typeof window !== "undefined") {
    // Android soft keyboards send "Unidentified" keydowns; that is touch input, not keyboard navigation.
    window.addEventListener("keydown", e => { if (e.key !== "Unidentified") keyboard = true; }, true);
    window.addEventListener("pointerdown", () => { keyboard = false; }, true);
}

export function lastInputWasKeyboard(): boolean {
    return keyboard;
}
