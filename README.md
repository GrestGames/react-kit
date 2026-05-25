# grest-react-kit

A React UI library (forms, grid, inputs, modals, async-state hooks) built on
grest-ts schemas. Source-distributed: consumers import `.ts`/`.tsx` directly
and bundle it themselves (`exports` points at `src/`).

## Capabilities — what's in the box

Batteries-included UI + form toolkit; reach for these before hand-rolling. Everything draws from
the `--rk-*` design-token palette (`src/css/theme.css`) and a shared `Intent` vocabulary
(`default · neutral · info · cool · success · warning · danger · critical`). The `example/` app is a
live gallery of all of it (`cd example && npm run dev`).

- **Schema-driven forms** — `useAsyncForm` + `FormRoot`/`Form` bind a grest-ts schema and surface
  validation automatically (see [`src/form/README.md`](src/form/README.md)); `DeleteObjectSection`
  for delete flows.
- **Form inputs** — `TextInput` (+ TextArea/Email/Phone/Password), `NumberInput`
  (Integer/Decimal/Positive/`InputRange`), `DateInput`/`YearMonthSelect`, `Select`/`RadioSelect`,
  `AutoComplete` (sync + async), `Checkbox`/`Checkbox01`/`CheckboxGroup`, `Toggle`/`Toggle01`,
  `FileUpload`/`FileMultiUpload`, inline edit (`InlineEditWrap`/`useInlineEdit`). Each works in a
  `value`+`onChange` mode or bound to a form `prop`.
- **Buttons** — one shared `ButtonPrimitive` behind the family: `Button` (intents,
  `gradient`/`outline` appearance, async-`onClick` spinner, `confirmDouble` arm-to-confirm, form
  presets `SubmitButton`/`SecondaryButton`/…), `PillButton`, `TagButton`, `IconButton`, and the
  static `Tag` label. Shared props: `intent`, `size` (`micro`/`small`/`normal`), `loading`,
  `active`, `disabled`, `confirmDouble`, tooltip.
- **Overlays** — `ToolTip` (hover / anchored), `ContextMenu` (right-click) + `ActionMenu`,
  `useAnchoredPopup`/`wrapWithPopup` (click popups; `placement` incl. `"over"` the trigger),
  `Popover`, `PopupPanel`, `Panel`, `Dialog`, and imperative singletons mounted once via
  `RkOverlayHost`: `RkToast`, `RkContextMenu`, `RkConfirm`/`RkAlert`. All positioned UI uses
  `@floating-ui/react`.
- **Feedback** — `TipBox` (+ `SuccessBox`/`WarningBox`/`ErrorBox`/`NeutralTipBox`), `Alert`,
  `Toast`, `ProgressBar`, `LoadingPopup`, `BatchProgressPopup`.
- **Layout & nav** — `Cards`/`Card`, `Tabs`, `TopMenu`, `MainArea`, `Separator`, `MiniTip`.
- **Data display** — `Grid` (server-driven sort / page / query), `GridCards`,
  `FileGrid`/`FileGridMini`, `LazyDataSet`, `FileViewer`/`FileIframe`. Formatted text: `Currency`,
  `Percent`, `Sq`, `FileSize`, `RelativeDate`, `DatePast`.
- **Hooks & utils** — async state (`useAsyncState`, `useAsyncEffect`, `useOnlyLatestResult`),
  positioning (`useDropDownPositioning`, `useOutsideClick`), and utilities (`ArrayUtils`,
  `DateUtils`, `StringUtils`, `EnumHelper`, `deepClone`, `download`, `isPromise`, `Decimal2`).

## Building forms

Read **[`src/form/README.md`](src/form/README.md)** before writing a create/edit
form. It covers the schema-driven pattern (`useAsyncForm`), how validation
surfaces automatically, and the traps that waste time (`orUndefined` vs
required, `IsUnion` vs `IsDiscriminated`, file uploads).

## grest-ts is a peer dependency

`@grest-ts/schema` and `@grest-ts/schema-file` are **peer** dependencies — the
**consuming app provides them**, react-kit ships none of its own. This is
required for correctness, not just hygiene: grest-ts schema classes are
identity-sensitive (`GGFileUpload` registration does `instanceof` checks
against `GGSchema`/`FileSchema`). If two copies of `@grest-ts/schema` end up in
one bundle, those checks fail across the copies and client construction throws
`GGFileUpload.POST(...) is used on a route with no non-JSON data`. So a build
must contain **exactly one** copy, and it must be the host app's.

They're also listed under `devDependencies` (pinned to the same version) purely
so react-kit's own `npm run typecheck` and `npm test` resolve in isolation.
npm never installs a dependency's devDependencies, so a normal consumer gets
zero grest-ts from react-kit and resolves the peer against its own tree.

Keep the peer version aligned with what the main consumer ships (currently
`0.0.42`).

## Local development as a symlinked checkout

When you symlink this checkout into a consumer (e.g.
`consumer/node_modules/grest-react-kit -> /path/to/react-kit`), react-kit's
**devDependency** copy of grest-ts lives in `react-kit/node_modules/@grest-ts/*`,
and the bundler — following the symlink to the real path — resolves react-kit's
imports to that nested copy. That reintroduces the two-copies crash above, even
though grest-ts is "only" a peer dep. Dependency *type* can't prevent this; it's
a property of symlinking an already-installed package.

The fix is consumer-side: tell the bundler to always resolve grest-ts from the
app's own root. For Vite:

```ts
// vite.config.ts
resolve: { dedupe: ['@grest-ts/schema', '@grest-ts/schema-file'] }
```

(See kratt's `packages/hub-client/vite.config.ts`.) This is normal consumption —
no change needed in react-kit.

## Component cheat-sheet & gotchas

Reach for the existing primitive before hand-rolling — most "I'll just build a
small X" cases are already solved. (Form-specific inputs/lifecycle live in
[`src/form/README.md`](src/form/README.md); this is everything else.)

- **`Button`** — has built-in `confirmDouble` (arm, then confirm within ~2s, with a
  label flip): use it instead of a hand-rolled `onDoubleClick`. For a non-accent
  fill, keep `<Button>` and override `--btn-bg` / `--btn-bg-hover` inline (e.g.
  `--rk-hue-purple`) rather than dropping to a raw `<button>` — both fall back to
  `--rk-accent`.
- **`ToolTip`** — `<ToolTip message={…} anchor="target">{child}</ToolTip>` instead of
  the native `title` attribute (`anchor="cursor"` is the default, cursor-following).
- **Overlays** — two idioms, both fine for new primitives: a declarative wrapper
  (`<ContextMenu>`, `<ToolTip>`) and an imperative singleton mounted once via
  `RkOverlayHost` (`RkToast`, `RkContextMenu`, `RkConfirm`/`RkAlert`). Build any new
  positioned component on `@floating-ui/react` (as `ToolTip` and `ContextMenu` do) —
  don't hand-roll `getBoundingClientRect` math like the older `ActionMenu`.
- **Overlay z-index** — overlay-tier elements must use `var(--rk-z-overlay)`
  (`2147483000`, `theme.css`), never a hardcoded value. Apps push popups well past
  the `10000` range, so `ActionMenu`'s old `10001` renders *behind* them.
- **`CheckboxGroup`** — `readOnly` / `disabled` are group-wide only; there's no
  per-option disabling. To disable a single choice, filter it out of the options.
- **`Cards` / `Card`** — `.rkCards` is a CSS grid (rows stretch by default). A `Card`
  nested inside a wrapper `<div>` grid item won't inherit that stretch — give the
  wrapper `display:flex` so the row height passes through to the `Card`.
- **`table.form` label alignment** — `td:nth-child(odd)` is right-aligned, counting
  *physical* `<td>`s per row. A `rowSpan` cell shifts the odd/even parity of its
  sibling rows, so labels there mis-align — set an explicit `textAlign` on the
  affected cells.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```
