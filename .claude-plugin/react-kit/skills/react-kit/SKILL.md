---
name: react-kit
description: Use whenever a project depends on grest-react-kit (the grest-ts React UI library). Trigger signals: package.json contains "grest-react-kit"; imports from "grest-react-kit" or "grest-react-kit/router"; mentions of react-kit, useAsyncForm, FormRoot, Grid, TipBox, RkToast/RkConfirm/RkOverlayHost, Button/PillButton/IconButton, ToolTip/ContextMenu/Popover, the --rk-* tokens or the Intent vocabulary; the user asks to build a form, input, modal, overlay, table/grid, or any UI element in such a project.
---

# grest-react-kit

`grest-react-kit` is a source-distributed React UI library built on grest-ts schemas: forms, inputs, overlays, grid, feedback, layout, and async hooks, all drawing from one `--rk-*` token theme and a shared `Intent` vocabulary. The library source (`/workspace/react-kit` when present) and its `example/` gallery are the live reference; this skill is the decision layer.

## The one rule

**In a project that uses react-kit, every piece of UI comes from react-kit.** Before you write any UI, find the react-kit component for it and use that. Never silently hand-roll something the library already owns (a button, modal, tooltip, dropdown, toast, tabs, grid…).

When there is **no good react-kit match**, do **not** quietly build something custom. Stop and tell the user, then pick a path together:

1. **Compose** — assemble the thing from existing react-kit primitives + `--rk-*` tokens / `intent` props / inline CSS-var overrides. Try this first; most "I'll just build a small X" cases are already a composition.
2. **Extend react-kit** — add or adjust the library itself. This is **encouraged**, not a last resort: react-kit is the team's own library and good, reusable ideas belong *in* it so every project benefits. Propose this whenever the need is general rather than one-off.
3. **Custom in-app** — build it locally, **explicitly flagged as custom**. Only after the user agrees it isn't worth standardizing.

Say it plainly: *"react-kit has no good match for X. I can (a) compose it from `<…>`, (b) add it to react-kit since it's reusable, or (c) build it custom here. Which do you want?"* — never assume (c).

## Setup & imports

```tsx
import {Button, useAsyncForm, Form, TextInput, RkToast} from "grest-react-kit"
import "grest-react-kit/css/base.css"   // once, at app entry
```

- Canonical specifier is **`grest-react-kit`** (routing helpers live under `grest-react-kit/router`). Some checkouts alias it (the in-repo `example/` app imports `@grest-ts/react`); follow whatever name the consumer's `package.json` uses, but `grest-react-kit` is the real one.
- `@grest-ts/schema` and `@grest-ts/schema-file` are **peer** deps supplied by the host app. There must be **exactly one** copy in the bundle or grest-ts `instanceof` checks fail (`GGFileUpload … used on a route with no non-JSON data`). For Vite: `resolve: { dedupe: ['@grest-ts/schema', '@grest-ts/schema-file'] }`.
- Imperative overlays (`RkToast`, `RkConfirm`, `RkAlert`, `RkContextMenu`) need `<RkOverlayHost/>` mounted **once** near the app root.

## Component catalog — what exists

Reach for these before hand-rolling. Exact props live in the source files / `example/` gallery; this is the map of what's available.

**Buttons** — one `ButtonPrimitive` behind the family. Shared props: `intent` (the Intent vocab), `size` (`micro`/`small`/`normal`), `loading`, `active`, `disabled`, `confirmDouble` (arm-then-confirm — use instead of hand-rolled double-click), tooltip, async `onClick` (auto spinner).
- `Button` (+ `appearance` `gradient`/`outline`), `PillButton`, `TagButton`, `IconButton`, static `Tag` label.
- Intent presets: `DangerButton`, `WarningButton`. Form presets: `SubmitButton`/`FormSubmitButton` (auto-disabled until changed), `SecondaryButton`, `FormCancelButton`. Array helpers: `AddNewButton`, `ArrayPushButton`, `ArrayRemoveButton`.

**Form inputs** — each works value+`onChange` or bound to a form field via `prop={F.field}`.
- Text: `TextInput`, `TextArea`, `PasswordInput`, `EmailInput`, `PhoneInput`.
- Number: `NumberInput`, `IntegerInput`/`PositiveIntegerInput`, `DecimalInput`/`PositiveDecimalInput`, `InputRange`.
- Date: `DateInput`, `YearMonthSelect`.
- Choice: `Select`, `RadioSelect`, `AutoComplete` (sync + async).
- Boolean: `Checkbox`, `Checkbox01`, `CheckboxGroup` (`disabled`/`readOnly` are group-wide — to disable one option, filter it out), `Toggle`, `Toggle01`.
- File: `FileUpload` (single), `FileMultiUpload`.
- Inline editing: `InlineEditWrap` + `useInlineEdit`.

**Forms** — `useAsyncForm` + `<Form prop={F}>` bind a grest-ts schema; validation surfaces automatically per field. `DeleteObjectSection` for delete flows. **Read `form-README.md` (this skill dir) before writing any create/edit form** — it covers the schema-first pattern and the traps (`orUndefined` vs required, `IsUnion` vs `IsDiscriminated`, file uploads, multi-tab forms).

**Overlays** — declarative wrappers and imperative singletons; all positioned UI uses `@floating-ui/react`, never hand-rolled rect math.
- `ToolTip` (`anchor="cursor"` default or `anchor="target"` — use instead of native `title`), `ContextMenu` (right-click) + `ActionMenu`, `Popover`, `PopupPanel`, `Panel`, `Dialog`, `Modal`.
- Click popups: `useAnchoredPopup` / `wrapWithPopup` (`placement` incl. `"over"` the trigger), `usePillPopup`.
- Imperative (via `RkOverlayHost`): `RkToast`, `RkConfirm`, `RkAlert`, `RkContextMenu`.
- Overlay z-index must be `var(--rk-z-overlay)` — never a hardcoded value.

**Feedback** — `TipBox` (+ `SuccessBox`/`WarningBox`/`ErrorBox`/`NeutralTipBox`), `Alert`, `Toast`, `ProgressBar`, `LoadingPopup`, `BatchProgressPopup`.

**Layout & nav** — `Cards`/`Card` (`variant="add"` for a "+" tile), `Tabs` (`urlKey` persists active tab; lazy `body` factories), `TopMenu`, `MainArea`, `Separator`, `MiniTip`, `StepBar`, `SlideDeck`, `AutoHeight`. Routing: `grest-react-kit/router` (`Router`, `RouterProvider`, `RouterOutlet`, `useRouter`, `useRouteKey`).

**Data display** — `Grid` (server-driven sort/page/query; pass `reloadKey` to refetch), `GridCards`, `FileGrid`/`FileGridMini`, `LazyDataSet`, `FileViewer`/`FileIframe`. Trackers: `EntityTracker`, `ErrorTracker`. Page scaffold: `MyPage`.

**Formatted text** — `Currency`, `Percent`, `Sq`, `FileSize`, `RelativeDate`, `DatePast`.

**Hooks & utils** — async state: `useAsyncState`, `useAsyncEffect`, `useOnlyLatestResult`; DOM: `useOutsideClick`, `AddToBody`; utils: `ArrayUtils`, `DateUtils`, `StringUtils`, `EnumHelper`, `deepClone`, `download`, `isPromise`, `Decimal2`, `ImageUtil`.

## Theming & intents

- **Intent vocabulary** (status meaning, not raw color): `default · neutral · info · cool · success · warning · danger · critical`. Pass as `intent="…"` to buttons, `TipBox`, etc.
- **Tokens**: everything draws from `--rk-*` in `src/css/theme.css` (colors, sizes, shadows). Style with tokens, not hardcoded hex. For a one-off button color keep `<Button>` and override `--btn-bg`/`--btn-bg-hover` inline (e.g. `var(--rk-purple)`) rather than dropping to a raw `<button>`.
- **Dark mode**: add the `.rk-dark` class to a subtree.

## Anti-patterns — never generate these

```tsx
// ❌ Raw element when react-kit owns the category
<button onClick={…}>Save</button>           // ✅ <Button onClick={…}>Save</Button>
<div title="…">                               // ✅ <ToolTip message="…">…</ToolTip>
// ❌ Hand-rolled modal / dropdown / toast / tabs
// ✅ Dialog/Panel · Select/useAnchoredPopup · RkToast · Tabs
// ❌ Hand-rolled getBoundingClientRect positioning
// ✅ @floating-ui via ToolTip/ContextMenu/useAnchoredPopup
// ❌ Hardcoded overlay z-index (e.g. 10001)        ✅ var(--rk-z-overlay)
// ❌ Hardcoded hex colors                            ✅ --rk-* tokens / intent
// ❌ Per-field "required" via .refine on orUndefined ✅ see form-README.md
// ❌ Silently building a custom component when no match — ✅ ask: compose / extend react-kit / custom?
```

## Deep detail

- **`form-README.md`** (this skill dir) — the full forms guide (`useAsyncForm`, validation flow, gotchas, larger forms).
- **`example/` gallery** in the react-kit checkout (`cd example && npm run dev`) — a live page per group (Buttons, Inputs, Overlays, Feedback, Layout, Data display, Forms, Wizard…).
- **`src/` of the react-kit checkout** — exact prop signatures; read the component file rather than guessing.
