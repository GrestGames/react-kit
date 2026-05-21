import {useState, type CSSProperties, type MouseEvent, type ReactNode} from "react";
import "./IconButton.css";

interface IconButtonProps {
    icon: ReactNode;
    onClick: (e: MouseEvent) => void | Promise<unknown>;
    title?: string;
    /** Glyph size in px. Sets --rk-icon-size; defaults to --rk-font-size-large. */
    size?: number;
    color?: string;
    disabled?: boolean;
    /** "glyph" drops the hover background and brightens instead — for inline icons. */
    variant?: "button" | "glyph";
    className?: string;
}

export function IconButton({icon, onClick, title, size, color, disabled, variant = "button", className}: IconButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = (e: MouseEvent) => {
        if (loading) return;
        const result = onClick(e);
        if (result && typeof (result as {then?: unknown}).then === "function") {
            setLoading(true);
            (result as Promise<unknown>).then(() => setLoading(false), () => setLoading(false));
        }
    };

    const style: CSSProperties = {};
    if (color) style.color = color;
    if (size) (style as Record<string, string>)["--rk-icon-size"] = `${size}px`;

    const cls = ["rkIconButton",
        variant === "glyph" ? "rkIconButtonGlyph" : "",
        loading ? "rkIconButtonLoading" : "",
        className || "",
    ].filter(Boolean).join(" ");

    return <button type="button" onClick={handleClick} title={title} disabled={disabled}
                   className={cls} style={Object.keys(style).length ? style : undefined}
                   aria-busy={loading || undefined}>
        {loading ? <span className="rkIconButtonSpinner" aria-hidden>⟳</span> : <span className="rkIconButtonIcon">{icon}</span>}
    </button>;
}
