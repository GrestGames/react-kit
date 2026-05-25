# Spec: shared `ButtonPrimitive` behind Button / PillButton / TagButton

Companion to `SPEC-variant-components.md`. That spec collapses *named color presets*
onto a prop ("component for behavior/defaults, prop for appearance"). This spec is the
deeper structural move it didn't cover: a **shared behavioral core** under the three
interactive `*Button` families, so they share one control layer and differ only in design.

## Problem

`Button` (`AnyButton`), `PillButton`, and `TagButton` (the latter two via the just-added
`ChipPrimitive`) independently re-implement the same concerns:

- click handling (sync + async `onClick`)
- a loading state + spinner + a no-reflow trick (coded 3 different ways)
- `disabled` gating, `aria-*`
- intent → `--rk-*` token resolution
- `wrapToolTip`

`AnyButton` additionally owns `confirmDouble` (arm/fire + adaptive confirm-text sizing),
`appearance` (gradient/outline), async-error → `<Alert>`, and mobile handling. None of that
is reachable from `PillButton`/`TagButton` — so e.g. a pill can't be a submit button, and the
loading/spinner behavior drifts between the three.

Today `PillButton`/`TagButton` also render a clickable **`<span>`** — an a11y anti-pattern
(no focus, no keyboard, no role) for things literally named `*Button`.

## Principle (inherited)

> A component exists for behavior/defaults; a prop exists for appearance.

Extended here: **control is shared; design is owned by each preset.** The primitive owns the
state machine + element + a11y; each preset owns its looks via CSS.

## Target

`ButtonPrimitive` — the behavioral core, extracted from `AnyButton` (the richest existing
implementation). Renders a real `<button>`. Its prop surface is **behavioral only**:

```ts
interface ButtonPrimitiveProps extends ToolTipSupported {
    children: ReactNode;
    onClick?: () => void | Promise<unknown>;   // async → derives loading
    loading?: boolean;                          // controlled; merged with async (see rule)
    disabled?: boolean;
    intent?: Intent;
    active?: boolean;                           // a.k.a. selected → solid fill state
    confirmDouble?: boolean;
    confirmDoubleText?: string;
    type?: "button" | "submit" | "reset";
    className?: string;
    style?: CSSProperties;
    // ref forwarded to the <button> (usePillPopup etc. depend on it)
}
```

**Design knobs are NOT primitive props.** `appearance` (gradient/outline), `dotted` (pill),
`size` (tag), and the idle **tone** (chip = `soft`, button = `fill`) live in the thin preset
wrappers, expressed as className + CSS vars. The primitive sets *state* —
`data-active` / `data-loading` / `aria-disabled` / armed — and each preset's CSS maps those
states to its tokens. This is what prevents a `variant`-prop god-component.

**Loading precedence rule:** effective loading = `loading` prop `||` async-derived loading.
Controlled forces it on; an async `onClick` adds to it. One standardized spinner + no-reflow
treatment (replace the existing 3).

**Anchored popup — compose, don't absorb.** `usePillPopup` (a portal popup anchored to a
ref'd element, with open/close/toggle + enter/leave anim + outside-click) is already generic —
it imports nothing from `PillButton`; the only coupling is its name and `btnRef:
HTMLSpanElement`. An anchored popup is a *composition* (trigger + floating panel), orthogonal
to "being a button," so it stays a standalone hook that composes with the primitive's
forwarded ref — it does **not** move inside `ButtonPrimitive` (which would bloat the core and
couple every button to one popup presentation).

The popup is the same family as `ToolTip` (anchored, portaled, positioned floating panel),
differing only in trigger (click/manual vs hover/auto) and interactive content. So it adopts
ToolTip's ergonomics, **not** raw ref-plumbing: a declarative `popup` config + a
`wrapWithPopup(config, element)` helper (the button owns the trigger; the caller passes content +
config) as the easy path, with the `useAnchoredPopup` hook kept as the power-user escape hatch
for fully-controlled cases. Because popup content is interactive (unlike a tooltip), the content
is a **render-prop `(close) => ReactNode`** so it can dismiss itself. Reject the
`<Popup><Button/></Popup>` context-wrapper form — it reintroduces an implicit "must be inside +
call the context trigger" contract.

`ToolTip` already delegates **all** positioning to `@floating-ui/react` (a direct dep,
`^0.27.0`) and is thin — its own code is trigger interactions, the arrow, and looks.
`usePillPopup` is the odd one out: it hand-rolls positioning (`getBoundingClientRect` + manual
viewport clamp). So in step 2, rebuild the popup on the **same library** — `useFloating` +
`useClick`/`useDismiss`/`useRole` + `FloatingPortal`, mirroring ToolTip's structure but
click-triggered with interactive content — and drop the bespoke positioning. They share the real
engine (the library); each owns only its trigger + looks. Low risk: it's adopting the shared lib,
not merging two hand-written engines.

## Shared prop standard (`PrimitiveButtonProps`)

Components must not re-list the control features. One exported standard interface carries them;
every button extends it and adds only its own design props:

```ts
interface PrimitiveButtonProps extends ToolTipSupported {
    children?: ReactNode;
    onClick?: () => void | Promise<unknown>;
    intent?: Intent;
    loading?: boolean;
    active?: boolean;
    confirmDouble?: boolean;
    confirmDoubleText?: string;
    // generic props declared directly — a button is NOT a form-input element
    disabled?: boolean;
    name?: string;
    className?: string;
    style?: CSSProperties;
}
interface ButtonProps     extends PrimitiveButtonProps { appearance?: ButtonAppearance }
interface PillButtonProps extends PrimitiveButtonProps { dotted?: boolean }
interface TagButtonProps  extends PrimitiveButtonProps { size?: "micro" | "small" | "normal"; bold?: boolean }
```

- **Do NOT extend `AnyFormElement` at all** (`Button` does today — drop it). It's an *input* base:
  `inlineEdit*` is a textarea/input concept, you can't `required` a button, and `readOnly` on a
  button is just `disabled`. The only button-relevant props (`disabled`, `name`, `className`,
  `style`) are plain-generic — declare them directly. **This changes `Button`'s public surface**
  (loses `readOnly` + the inert input-only props); `readOnly`→`disabled` is the one realistic
  caller migration, which kratt's typecheck (it consumes react-kit source) surfaces when this lands.
- **`type` stays internal.** It lives only on the primitive's own prop type
  (`PrimitiveButtonProps & { type?: "button" | "submit" | "reset"; onError?; onErrorCleared? }`),
  never on the standard or the friendly components. Presets (`SubmitButton` → `submit`) set it.
- **Deprecated aliases** (`WarningButton`, `DangerButton`, `ArrayRemoveButtonOLD`) may have their
  prop shapes loosened/broken freely — we're migrating off them.

## Migration (riskiest first, behind frozen public APIs)

1. **Extract `ButtonPrimitive` from `AnyButton`; rewire `Button` + presets onto it.**
   Preserve-list — none of this may regress:
   - `confirmDouble` arm/fire + `pickConfirmText` adaptive sizing
   - `appearance` gradient/outline + `ButtonAppearanceContext`
   - async-error → `<Alert>` (`ApiErrorMessage`, `ERROR.fromUnknown`, intent→warning on error)
   - width/height freeze during loading
   - mobile (`useIsMobile`)
   - every preset export (`SubmitButton`, `FormSubmitButton`, `FormCancelButton`,
     `ArrayPushButton`, `ArrayRemoveButton`, `AddNewButton`, `SecondaryButton`) and the
     deprecated aliases (`WarningButton`, `DangerButton`, `ArrayRemoveButtonOLD`)
2. **Move `PillButton` + `TagButton` onto `ButtonPrimitive`; retire `ChipPrimitive`.**
   They become real `<button>`s. `dotted`/`size` stay as preset props (className/CSS only).
   Public APIs unchanged. The `<span>`→`<button>` switch forces `usePillPopup`'s `btnRef`
   type to change anyway, so generalize the hook here: rename `usePillPopup` →
   `useAnchoredPopup` and **rebuild it on `@floating-ui/react`** (drop the hand-rolled
   positioning; floating-ui owns the ref via `refs.setReference`). Keep
   `usePillPopup` + `ANIM_DURATION` as deprecated re-exports (kratt and others import them).
   It stays a standalone composable hook (see "compose, don't absorb"), now usable by any
   button. Add the ergonomic layer alongside it: a `popup` config + `wrapWithPopup` helper
   (ToolTip-style), content as render-prop `(close) => ReactNode`; hook remains the escape hatch.
3. **(Phase 2, optional) Fold `IconButton` in** as an icon-only render preset (it's already an
   async `<button>` with its own loading spinner).

## Risks

- **`Button` blast radius.** Used across react-kit *and* every consumer (kratt included).
  Step 1 must be isolated and fully exercised before step 2.
- **`<button>` semantics for chips.** UA reset, inline-block→button layout shift, and a
  `<button>` can't contain interactive/block children. Verify existing `PillButton`/`TagButton`
  call sites (and `usePillPopup`, which needs the forwarded ref).
- **Token resolution differs** (chip idle `soft` vs button idle `fill`). Resolve via shared
  state-class CSS, not a primitive prop.
- A non-interactive colored pill is **`Tag`** (the `<span>` label), not a `*Button` — keep
  that distinction; don't render `<button>` with no handler as a "static pill."

## Out of scope (owned by `SPEC-variant-components.md`, naming-gated)

- The public **emphasis vocabulary** (`solid`/`soft`/`ghost`) and the **button color-naming
  decision** (`normal`/`secondary`/`third`/`submit` brand accents). We realize soft-vs-fill
  *implicitly* via preset CSS; we do **not** introduce a public `emphasis`/`design` prop here.
- Any restyle/recolor. This is structural; looks are unchanged.

## Verification

- `npm run typecheck` (lib) + `vite build` (example) clean.
- Exercise the example app: Button (gradient/outline, confirmDouble, async loading, submit in a
  form), PillButton (dotted, popup via `usePillPopup`), TagButton (sizes, controlled loading).
- Keyboard/focus on the migrated chips (the a11y win).

## Note for `SPEC-variant-components.md`

Its audit row "**Tag** — CSS classes only, KEEP" is now outdated: `TagButton` + `ChipPrimitive`
exist. Update that row when this lands (`ChipPrimitive` is retired into `ButtonPrimitive`).
