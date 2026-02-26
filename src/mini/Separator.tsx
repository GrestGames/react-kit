export function Separator({label}: { label?: string }) {
    return <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "16px 0 14px",
        color: "#999",
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        userSelect: "none",
    }}>
        <div style={{width: 20, height: 1, background: "#ddd"}}/>
        {label && <span style={{whiteSpace: "nowrap"}}>{label}</span>}
        <div style={{flex: 1, height: 1, background: "#ddd"}}/>
    </div>;
}
