import {CSSProperties, MouseEvent, ReactNode} from "react";
import {wrapToolTip, type ToolTipSupported} from "./ToolTip";
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

export interface CardProps extends ToolTipSupported {
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
    className?: string;
    style?: CSSProperties;
}

/** A single tile in a {@link Cards} grid. Centered column layout by default; */
export function Card({children, onClick, onContextMenu, variant = "default", selected, disabled, title, titleProps, className, style}: CardProps) {
    const cls = [
        "rkCard",
        variant === "add" ? "rkCard-add" : "",
        onClick && !disabled ? "rkCard-clickable" : "",
        selected ? "rkCard-selected" : "",
        disabled ? "rkCard-disabled" : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    if (onClick) {
        return wrapToolTip({title, titleProps}, <button type="button" className={cls} disabled={disabled} onClick={onClick} onContextMenu={onContextMenu} style={style}>
            {children}
        </button>);
    }
    return wrapToolTip({title, titleProps}, <div className={cls} onContextMenu={onContextMenu} style={style}>{children}</div>);
}
