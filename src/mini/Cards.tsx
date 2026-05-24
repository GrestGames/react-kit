import {CSSProperties, MouseEvent, ReactNode} from "react";
import "./Cards.css";

export interface CardsProps {
    children: ReactNode;
    /** Minimum width of a card before the grid wraps to a new column. */
    minCardWidth?: number;
    gap?: number;
    className?: string;
    style?: CSSProperties;
}

/** Responsive auto-wrapping grid of {@link Card}s. */
export function Cards({children, minCardWidth = 150, gap = 12, className, style}: CardsProps) {
    return <div
        className={"rkCards" + (className ? " " + className : "")}
        style={{gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`, gap, ...style}}
    >
        {children}
    </div>;
}

export interface CardProps {
    children: ReactNode;
    /** When set, the card is a clickable button. Omit for a static card that
     *  hosts its own interactive controls (e.g. action buttons). */
    onClick?: () => void;
    /** Right-click handler — pair with `RkContextMenu.open(e, items)` for a menu. */
    onContextMenu?: (e: MouseEvent) => void;
    /** "add" renders a dashed placeholder tile (e.g. a "+ New" card). */
    variant?: "default" | "add";
    selected?: boolean;
    disabled?: boolean;
    title?: string;
    className?: string;
    style?: CSSProperties;
}

/** A single tile in a {@link Cards} grid. Centered column layout by default;
 *  put a logo/icon, title and subtitle as children. */
export function Card({children, onClick, onContextMenu, variant = "default", selected, disabled, title, className, style}: CardProps) {
    const cls = [
        "rkCard",
        variant === "add" ? "rkCard-add" : "",
        onClick && !disabled ? "rkCard-clickable" : "",
        selected ? "rkCard-selected" : "",
        disabled ? "rkCard-disabled" : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    if (onClick) {
        return <button type="button" className={cls} title={title} disabled={disabled} onClick={onClick} onContextMenu={onContextMenu} style={style}>
            {children}
        </button>;
    }
    return <div className={cls} title={title} onContextMenu={onContextMenu} style={style}>{children}</div>;
}
