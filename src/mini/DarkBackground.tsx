import "./DarkBackground.css"

export function DarkBackground({onClick, zIndex}: { onClick?: () => void, zIndex?: number }) {
    return <div className="darkBackground" style={{zIndex: zIndex || 100}} onClick={onClick}/>;
}
