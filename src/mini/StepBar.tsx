import React from "react"
import {type Intent, resolveColorVar} from "../intents"

interface StepBarProps {
    steps: readonly string[]
    current: number
    /** Fires when a navigable step is clicked. */
    onStepClick?: (index: number) => void
    /** Which steps are clickable. Default: any earlier step (`i < current`) —
     *  going back is free, forward jumps must use the flow's own Next control. */
    canNavigate?: (index: number) => boolean
    /** Active/done color via intent token (e.g. "cool", "success"). */
    intent?: Intent
    /** Active/done color via hue token — resolves to `var(--rk-<hue>)`.
     *  No-ops silently if the token is not defined. */
    hue?: string
}

/** Numbered progress bar that doubles as a back-navigation controller. Purely
 *  presentational + a click callback — it owns no step state, so it can drive a
 *  SlideDeck (or anything) the parent wires up, or stand alone as an indicator. */
export function StepBar({steps, current, onStepClick, canNavigate, intent, hue}: StepBarProps) {
    const color = resolveColorVar(intent, hue)
    const clickableAt = (i: number) =>
        i !== current && !!onStepClick && (canNavigate ? canNavigate(i) : i < current)

    return <div style={{display: "flex", alignItems: "flex-start", width: "100%"}}>
        {steps.map((label, i) => {
            const done = i < current
            const active = i === current
            const clickable = clickableAt(i)
            return <React.Fragment key={i}>
                <div
                    onClick={clickable ? () => onStepClick!(i) : undefined}
                    title={clickable ? `Go to ${label}` : undefined}
                    style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        cursor: clickable ? "pointer" : "default",
                    }}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13, flexShrink: 0,
                        background: done || active ? color : "var(--rk-bg-raised)",
                        color: done || active ? "#fff" : "var(--rk-text-muted)",
                        border: active ? `2px solid ${color}` : done ? "none" : "2px solid var(--rk-border)",
                        boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)` : "none",
                        transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    }}>
                        {done ? "✓" : i + 1}
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
                        color: active ? color : done ? "var(--rk-text-secondary)" : "var(--rk-text-muted)",
                    }}>{label}</div>
                </div>
                {i < steps.length - 1 && <div style={{
                    flex: 1, height: 2, marginTop: 16, marginLeft: 4, marginRight: 4,
                    background: done ? color : "var(--rk-border)",
                    transition: "background 0.2s",
                }}/>}
            </React.Fragment>
        })}
    </div>
}
