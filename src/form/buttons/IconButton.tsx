import {useState, type CSSProperties, type MouseEvent, type ReactNode} from "react";
import {ToolTipSupported, wrapToolTip} from "../../mini/ToolTip";
import "./IconButton.css";

interface IconButtonProps extends ToolTipSupported {
    icon: ReactNode;
    onClick: (e: MouseEvent) => void | Promise<unknown>;
    /** Glyph size in px. Sets --rk-icon-size; defaults to --rk-font-size-large. */
    size?: number;
    color?: string;
    disabled?: boolean;
    /** "glyph" drops the hover background and brightens instead — for inline icons. */
    variant?: "button" | "glyph";
    className?: string;
}

export function IconButton({icon, onClick, title, titleProps, size, color, disabled, variant = "button", className}: IconButtonProps) {
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

    return wrapToolTip({title, titleProps},
        <button type="button" onClick={handleClick} disabled={disabled}
                aria-label={typeof title === "string" ? title : undefined}
                className={cls} style={Object.keys(style).length ? style : undefined}
                aria-busy={loading || undefined}>
            {loading ? <span className="rkIconButtonSpinner" aria-hidden>⟳</span> : <span className="rkIconButtonIcon">{icon}</span>}
        </button>);
}
