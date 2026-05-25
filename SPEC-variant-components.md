# Spec: prop-driven variants over style-only wrapper components

## Problem

Several component families expose **one exported component per visual variant**, where
the only difference between them is which CSS class (i.e. which intent color) they apply:

```tsx
export function SuccessBox(props) { return <div className="tipBase infoTip ...">...</div> }
export function WarningBox(props) { return <div className="tipBase warningTip ...">...</div> }
```

This is convenient to *scan* (`<SuccessBox>` reads louder than `<Box intent="success">`)
but has two real costs:

1. **Drift.** Nothing forces the hand-written siblings to stay uniform. We already have
   live proof in `TipBox.tsx`:
   - `SuccessBox` is backed by a class literally named `.infoTip`.
   - `TipBox` / `NeutralTipBox` are missing the icon the other three render.
   - Class names (`hintTip`, `infoTip`) don't match the intent names they represent.
2. **Doesn't scale past one axis.** A component-per-variant works only while variants are a
   single closed dimension (intent). The moment a second axis appears — intent × emphasis
   (`solid` / `soft` / `ghost`), which is already on the table for buttons — named components
   explode combinatorially (`SuccessSoftGhostBox`?) and can't express a runtime-chosen variant
   (`isError ? ErrorBox : SuccessBox`). A prop handles both for free.

## Principle

> **A component should exist when it adds behavior or defaults. A prop should exist when it
> only changes appearance.**

Thin named presets (`SuccessBox = (p) => <Box intent="success" {...p}/>`) are fine to keep —
they preserve scannability and autocomplete — **as long as they delegate to one prop-driven
base** and can't diverge. The anti-pattern is when the dedicated component is the *only*
mechanism and the siblings are independently authored.

## Target pattern (already in the repo)

`src/mini/Alert.tsx` is the exemplar — copy it:

```tsx
type AlertVariant = "neutral" | "info" | "warning" | "error";

function AlertBase({ variant, ... }: Props & { variant: AlertVariant }) { /* single impl */ }

export const Alert        = (p) => <AlertBase {...p} variant="neutral"/>;
export const InfoAlert     = (p) => <AlertBase {...p} variant="info"/>;
export const WarningAlert  = (p) => <AlertBase {...p} variant="warning"/>;
export const ErrorAlert    = (p) => <AlertBase {...p} variant="error"/>;
```

One implementation = single source of truth, no drift, dynamic-friendly, and the friendly
named exports still exist.

## Audit — every variant family

| Family | File | Mechanism today | Verdict |
|---|---|---|---|
| **Box / Tip** | `form/other/TipBox.tsx` | 5 independently-written components (`TipBox`, `NeutralTipBox`, `SuccessBox`, `WarningBox`, `ErrorBox`); no shared base, no variant prop | **REFACTOR — primary target** |
| **Button (color)** | `form/input/Button.tsx` | `WarningButton`, `DangerButton`, `SecondaryButton` — pure color presets over `AnyButton` (`design` prop exists but isn't exported and the union is incomplete) | **REFACTOR — secondary target** (ties into the open button-naming decision) |
| Button (behavioral) | `form/input/Button.tsx` | `SubmitButton`, `FormSubmitButton`, `FormCancelButton`, `ArrayPushButton`, `ArrayRemoveButton`, `AddNewButton` | **KEEP** — bundle real logic/defaults, not just a class |
| Alert | `mini/Alert.tsx` | `AlertBase` + `variant` prop + thin presets | **KEEP — exemplar** |
| Toast | `mini/Toast.tsx` | `toast(msg, {type})` + `toast.info/.success/.warning/.error` over typed `ToastType` | **KEEP** — function form of the pattern |
| ToolTip | `mini/ToolTip.tsx` | single `ToolTip` with `template: "normal" \| "error"` prop | **KEEP** — already prop-driven |
| Tag | `mini/Tag.tsx` | `<span>` label component; purely presentational (no click handler / keyboard semantics). CSS classes only for styling. | **KEEP** — `Tag` is a static label; `TagButton` + `PillButton` cover the interactive chip cases. `ChipPrimitive` was retired — both chips now delegate to `ButtonPrimitive`. |

## Clear targets (detail)

### 1. Box / Tip family — primary target

Current state in `form/other/TipBox.tsx`:

| Component | CSS class | intent | icon |
|---|---|---|---|
| `TipBox` | `.hintTip` | info (blue) | none |
| `NeutralTipBox` | `.neutralTip` | neutral (gray) | none |
| `SuccessBox` | `.infoTip` ⚠️ | success (green) | `i` |
| `WarningBox` | `.warningTip` | warning (orange) | `!` |
| `ErrorBox` | `.errorTip` | danger (red) | `!` |

Proposed shape — one base + thin presets:

```tsx
type BoxIntent = "neutral" | "info" | "success" | "warning" | "danger" | "critical";

export function TipBox({ intent = "info", children, style, className, onClick }: BoxProps) {
    // single impl: maps intent -> --rk-{intent}-soft tokens + per-intent icon
}

export const NeutralTipBox = (p: BoxProps) => <TipBox intent="neutral" {...p}/>;
export const SuccessBox    = (p: BoxProps) => <TipBox intent="success" {...p}/>;
export const WarningBox    = (p: BoxProps) => <TipBox intent="warning" {...p}/>;
export const ErrorBox      = (p: BoxProps) => <TipBox intent="danger"  {...p}/>;
```

Wins: kills the `.infoTip` mismatch, makes the icon a per-intent decision in one place,
adds `critical` (currently missing) for free, and the CSS collapses to a single
`--rk-{intent}-soft` lookup instead of five hand-written class blocks.

### 2. Button color variants — secondary target

`AnyButton` is already prop-driven internally (`design?: "warning" | "secondary" | "danger"`)
but the prop isn't exported and the union is incomplete. `WarningButton` / `DangerButton` /
`SecondaryButton` are pure color presets and belong on the prop. This target is **coupled to
the open button-naming decision** (we chose "brand accents" for `normal`/`secondary`/`third`/
`submit`) and to the possible second axis (emphasis: solid/soft/ghost) — so it should land
*after* the naming is settled, and `AnyButton`'s `design` union should be reconciled with the
final vocabulary. Behavioral buttons stay as components.

## Related cleanups this surfaces (not blocking, worth folding in)

- **Inconsistent intent vocabulary across the system.** Tokens use
  `success/warning/danger/critical/info/neutral`; Alert/Toast/ToolTip use `error` (not
  `danger`); boxes mix `Tip`/`hint` for info. A single shared `Intent` type would let Box,
  Button, Alert, Toast and Tag all speak the same words. Recommend `danger` as canonical
  (matches tokens); keep `ErrorAlert`/`ErrorBox` names as presets if desired.
- **Missing `critical` coverage** in boxes and (depending on naming) buttons.

## Compatibility / migration

- The named exports (`SuccessBox`, `WarningAlert`, …) are **kept as thin presets**, so existing
  consumer JSX and imports keep working — this is sugar, not a breaking removal.
- Behavior is identical; only the implementation collapses behind one component. Low risk.
- If the shared `Intent` vocabulary is adopted, `error → danger` is an internal rename; the
  `Error*` preset names can stay for back-compat.

## Sequencing

1. **Box family** — self-contained, highest drift, no open decisions. Do first.
2. **Shared `Intent` type** — extract once Box defines it; adopt in Alert/Toast/Tag opportunistically.
3. **Button color variants** — after the button-naming decision lands; reconcile `design` union.

## Out of scope

- The emphasis axis (`solid`/`soft`/`ghost`) itself — this spec only makes variants
  prop-driven so that axis *can* be added later without a combinatorial blowup.
- Restyling/recoloring; this is a structural refactor, not a visual change.
