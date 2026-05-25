# Spec: URL-driven overlay stacking + standardized Router

## Problem

Multiple overlay panels can be open at once. This is a **core feature** — heavily in
realestate, lightly in kratt — and the intended model is:

> **URL param order is the canonical stacking order.** The last route key in the URL is
> the topmost panel; opening/reopening a panel moves it to the top; closing it removes it.

react-kit does **not** actually implement that today. The order is an emergent accident, and
it rots in three concrete ways.

### 1. Stacking follows portal *mount order*, not URL order

Every modal portals to `document.body` and ties at a hardcoded `z-index`:

| Element | z-index | Source |
|---|---|---|
| `Panel` (PopupPanel body) | `100` | `mini/Panel.tsx:27` (`zIndex \|\| 100`) |
| `DarkBackground` (scrim) | `100` inline / `200` class | `mini/DarkBackground.tsx:4`, `DarkBackground.css:9` |
| PopupPanel close-guard confirm scrim | `400` | `mini/PopupPanel.tsx:60`, `DarkBackground.css:15` |
| `Popover` | `9001` | `mini/Popover.tsx:38` |
| `ActionMenu` | `10000 / 10001` | `form/ActionMenu.css:34,39` |
| `useAnchoredPopup` | `10000` | `mini/useAnchoredPopup.tsx:103` |
| `ToolTip` | `13000` | `mini/ToolTip.css:9,41` |
| `Toast` / `Alert` / `Dialog` / `ContextMenu` | `--rk-z-overlay` = `2147483000` | `theme.css:161` |
| drag/resize shields | `2147483647` | `FloatingLayer.tsx:148,193`, `DockPanel.tsx:60` |

Because every `PopupPanel` ties at `100`, the visible order among them is decided by **DOM
order in `<body>`**, i.e. the order portals were *first mounted*. That happens to equal URL
order on load / open / nest — which is why it "feels" URL-ordered — but it is never actually
read from the URL.

### 2. Reopen-without-close does not raise

kratt/realestate share a `Router` whose `routeArgs` insertion order is the open order
(`Router.tsx` builds `elements` via `for (const k in this.routeArgs)`, and `add()` moves a
re-added key to the **end**). But each rendered element is keyed by its **route-definition
index** (`<React.Fragment key={i}>`). So reopening an already-open panel reorders `routeArgs`
**without remounting** the element — its portal node never re-appends to `<body>` — and the
panel **stays where it was** instead of rising. This is the headline bug: the URL says "on
top," the screen says otherwise.

### 3. One backdrop per panel → cumulative dimming

Each `PopupPanel` renders its **own** `DarkBackground` (`mini/PopupPanel.tsx:52`). Nest
panel → panel → panel → confirm and the first panel sits under three or four scrims and goes
nearly black. The nesting depth realestate relies on makes this the most visible defect.

### 4. The Router is duplicated, drifted, and *secretly depended on by react-kit*

The `Router` class is copy-pasted across projects (kratt's `platform/router/Router.tsx` and
realestate's copy) and has already drifted (different `urlChanged` dispatch site, different TS
strictness). More importantly, **react-kit already depends on this Router it does not own**:

- `form/tabs/Tabs.tsx:44` subscribes to the global `window` event `"urlChanged"` — fired
  **only** by the Router.
- `Tabs.tsx:62,80` does its **own** `history.pushState` / `replaceState`.

So react-kit `Tabs` only works in an app that ships *this exact Router*, and there are **two
independent writers to `history`** coordinated by a stringly-typed global event. kratt's
`useWorkspaceId.ts:12` is a second consumer of the same global event.

### 5. (kratt-only) desktop chrome competes with panels in the root stacking context

kratt's `.desktop` establishes no stacking context (`Desktop.css:1-9`), so its taskbar
(`z-index:500`, `Desktop.css:36`), floating windows (`100 + i*2`, `FloatingLayer.tsx:59`),
dock zones (`900`), etc. all resolve at the **root** context — the same one the body-portaled
panels (`100`) land in. Result: the taskbar (and window edges) paint over panels. This is the
symptom that started this investigation.

## Principle

> **The URL is the single source of truth for what overlays are open and in what order.
> z-index is *derived* from that order, never hardcoded per component; the backdrop is owned
> by the stack, not by each panel.**

Two corollaries:

- **Order must flow from where it's known (the Router), not be inferred from mount timing.**
  A mount-time imperative registry (like Toast/Dialog) reproduces bug #2. Panels stay
  *declarative and URL-driven*; we never convert them to imperative `.open()` pushes.
- **react-kit should own the Router**, because it already half-owns routing (`Tabs`) via an
  undocumented global-event contract. Owning it makes the contract explicit and lets the
  overlay layer read order natively.

## Target architecture: three tiers

```
Tier 3  anchored / ephemeral   Popover · ActionMenu · ToolTip · ContextMenu · Toast · Confirm
        always above the modal stack; fixed token band; already centralized in RkOverlayHost
        ────────────────────────────────────────────────────────────────────────────────────
Tier 2  modal stack            PopupPanel & inline modal panels (Alert / LoadingPopup /
        ordered by URL order   BatchProgressPopup / FileViewer) — z-index = base + URLindex,
        ONE shared backdrop     single scrim under the topmost
        ────────────────────────────────────────────────────────────────────────────────────
Tier 1  app chrome             host app's own surface (kratt desktop/windows) — collapsed into
        one isolated layer      a single stacking context strictly below the modal stack
```

`RkOverlayHost` (`mini/RkOverlayHost.tsx`) already nails **Tier 3** correctly (Toast / Dialog
/ ContextMenu, centralized, token-based, always-on-top). The work is to add **Tier 2** and let
the host apps map their chrome into **Tier 1**. Tier 3 is left as-is.

## Design

### A. Router → react-kit (`src/router/`)

Move the class in as the canonical engine; de-dupe kratt + realestate. Keep the route DSL
(`page=work&workspaceId?=?`) and the imperative `set/add/remove/reset` API **byte-identical**
so existing route tables migrate by changing an import, not a rewrite. Fix three latent bugs
in flight:

1. **`window.onpopstate = …` → `addEventListener("popstate", …)`** with teardown. The
   assignment form clobbers any other popstate handler and makes two instances impossible.
2. **Expose a React surface:** `RouterProvider` + `useRouter()` + a context that publishes the
   **ordered open-route keys** (`routeArgs` order). This is the order source for Tier 2.
3. **Single history writer.** Router owns `pushState`/`replaceState`. `Tabs` (and
   `useWorkspaceId`) read the context / call Router methods instead of poking `history` and
   listening to the global event. The `"urlChanged"` event stays during migration (deprecated)
   so nothing breaks mid-flight; new code uses the context.

**Home: `react-kit/router` submodule** (tree-shakeable; `Tabs` and the overlay host import it).

**URL-as-state is a hard invariant.** Every view's state must be reconstructable from the URL,
so a copy-pasted URL restores it — this is a non-negotiable property of the web app, preserved
by the Router owning all URL read/write. The `"urlChanged"` *global event* is only an internal
notification channel; it is replaced by the Router **context** (identical external behavior, no
global `window` event). The one accepted exception is kratt's desktop **window layout**, which
is localStorage-backed rather than URL-encoded because the desktop is too complex to serialize;
**all other kratt views honor the URL.**

### B. OverlayStack (Tier 2) — "make RkOverlayHost proper"

A new `OverlayStackProvider` (composed into / alongside `RkOverlayHost`) that:

- Maintains an **ordered registry** of open modal overlays. Order source = the Router context
  (`routeArgs` order). Non-Router consumers fall back to render/registration order.
- Assigns each entry `z-index = var(--rk-z-modal) + index * step`.
- Renders **one** shared backdrop at `(top entry z-index) − 1`.
- **Backdrop click dispatches to the topmost entry's declared behavior** (each modal declares
  it on register). All three behaviors that exist today must survive (verified in the repo):
  - **close-topmost** (default) — `Alert`, `Dialog` (resolves false).
  - **guarded-close** — `PopupPanel` runs its `CloseGuardContext` guards before closing; a
    `Form` with unsaved changes (`form/Form.tsx:18`) registers one → "lose changes?" confirm.
    **Load-bearing — must not be dropped.**
  - **blocking / non-dismissible** — `LoadingPopup`, `BatchProgressPopup` pass no `onClick`
    today; their scrim must stay inert while topmost.

`PopupPanel` change:

- Stops rendering its own `DarkBackground` and its hardcoded `100`. It **registers** with the
  stack (keyed by its route key when under a `RouterProvider`) and reads its assigned z-index;
  it still `createPortal`s to `<body>`.
- The close-guard confirm becomes a stack entry too, so it lands above its parent panel by the
  same mechanism (replacing the special-cased `400`).
- **Back-compat gate:** with no `OverlayStackProvider` present, `PopupPanel` falls back to
  today's behavior (own backdrop, `z-index:100`). New behavior activates only under the
  provider. This is what protects realestate on a react-kit bump (see Risks).

**Why this fixes reopen (#2):** z-index now comes from the Router's `routeArgs` index. `add()`
moves a reopened key to the end → its index rises → its z-index rises → it comes to the top,
with **no remount required**. Mount order stops mattering.

### C. z-index token scale (kills the magic numbers, #1)

Replace the ad-hoc constants with one ordered scale in `theme.css`, and migrate every overlay
to it:

```
--rk-z-base       0
--rk-z-dropdown   ~1000     Select / AutoComplete menus
--rk-z-modal      ~2000     Tier-2 stack base (room for N stacked panels above this)
--rk-z-popover    ~6000     Popover / ActionMenu / useAnchoredPopup (above any modal)
--rk-z-toast      ~7000
--rk-z-tooltip    ~8000
--rk-z-overlay    ~9000     Dialog / ContextMenu always-on-top trio (was 2147483000)
--rk-z-shield     ~9999     drag/resize capture shields (was 2147483647)
```

**Only `--rk-z-modal` is a base that gets incremented** — the OverlayStack assigns
`--rk-z-modal + index` per stacked panel (`+1` each, no per-panel tokens). Every other token is
a single fixed level. The only thing to size is the **gap between bands**: it must exceed any
realistic stack depth so a tall modal stack can never climb into the popover band (gaps of
`~1000` make collision require 1000 stacked panels — impossible). So this is essentially "fix
one start and increment," exactly as expected; the ladder above just needs breathing room. The
`2147483000` / `2147483647` "max" values disappear — they were "I gave up on ordering"
sentinels.

### D. kratt integration

- **Phase 0 (independent, ship first):** `.desktop { isolation: isolate }` (`Desktop.css:1`).
  Collapses the entire desktop (taskbar `500`, windows `100+`, dock zones `900`, reposition
  overlay `9999`) into one root-level layer below the panels. Fixes symptom #5 on its own,
  decoupled from everything below.
- Wrap the app in `RouterProvider` + `OverlayStackProvider`; swap kratt's `Router` import to
  react-kit. Panels (routed in `App.tsx:57-76`) get ordered stacking automatically.
- Delete the dead `popup()` `zIndex:12000` wrapper (`App.tsx:50-53`) — it's a no-op (the
  portal escapes it) and its premise (taskbar ~10001) is stale.
- **"Panels always win, no window→panel→window interleaving"** (per product owner) means kratt
  windows do **not** join the modal stack — they stay in the isolated Tier-1 desktop. Once
  panels sit at the modal band (well above the body-portaled resize handles at ~`101`,
  `FloatingLayer.tsx:303`), the resize-handle-over-panel edge case resolves for free.

### E. realestate integration (compatibility target)

realestate is the **heaviest** multi-panel user, so it is the **reference oracle**, not an
afterthought. Same import swap + providers. Validate the two intended behavior deltas against
real flows there before shipping (see table). Because react-kit is a **git dependency**
(`grest-react-kit: git+https://github.com/GrestGames/react-kit.git`, no tag pin —
kratt `package.json:18`), a change merged to react-kit's default branch reaches realestate on
its next install. Therefore the back-compat gate (§B) is load-bearing: existing
`PopupPanel`/`DarkBackground`/`Tabs` **defaults stay behavior-identical** until an app
explicitly adds `OverlayStackProvider`.

## Behavior compatibility (what realestate sees)

| Scenario | Today | After (under provider) | Delta |
|---|---|---|---|
| Fresh load with N panels in URL | URL order (mount order coincides) | URL order (explicit) | **none** |
| Open a new panel | on top | on top | **none** |
| Nested open A→B→C | C over B over A | C over B over A | **none** |
| Close a panel | removed | removed | **none** |
| Back / forward nav | Router-driven | Router-driven | **none** |
| **Reopen an already-open panel** | stays put (bug) | **rises to top** | **fix** |
| **Nested backdrops** | one scrim per panel (cumulative dimming) | **one shared scrim** | **fix** |

Only two deltas, both toward the stated design intent. The two things to verify in realestate:
(a) nothing relies on the per-panel backdrop look, (b) no flow depends on reopen-not-raising.

## Migration phases

- **Phase 0** — kratt `.desktop { isolation: isolate }`. Independent, unblocked, ships now.
- **Phase 1** — Router → react-kit: engine move + `RouterProvider`/context + `popstate` fix;
  keep `urlChanged` for back-compat. Swap kratt + realestate imports. **No behavior change.**
- **Phase 2** — z-index token scale in `theme.css`; migrate components. Mechanical; the modal
  band still defaults to today's effective order, so **no ordering change**.
- **Phase 3** — `OverlayStackProvider` + shared backdrop; `PopupPanel` registers + reads
  ordered z-index; per-panel backdrop behind the compat gate.
- **Phase 4** — kratt adopts the provider; remove dead `popup()` wrapper; verify the two deltas.
- **Phase 5** — realestate adopts the provider; validate the two deltas against its flows.

Each phase is independently shippable and (except the deliberate deltas in 3–5) behavior-
preserving.

## Risks & mitigations

- **Shared git dep, no pin** → keep existing component defaults compatible; gate all new
  behavior behind `OverlayStackProvider` presence. Apps flip on adoption, not on reinstall.
- **Router is a side-effecting global singleton** → fix `onpopstate` clobber, assert single
  instance, provide teardown for tests.
- **`Tabs` dual-history-writer** → route all history writes through the Router.
- **realestate unseen from this workspace** → it is the validation oracle; do not ship the
  Tier-2 behavior change to its branch without testing the two deltas there.
- **Reopen-raises could surprise a flow that leaned on the bug** → called out in the
  compatibility table; verify in realestate before Phase 5.

## Resolved decisions

1. **Router home → `react-kit/router` submodule** (tree-shakeable; `Tabs` + overlay host import it).
2. **Shared-backdrop click → close-topmost by default, but per-entry behavior** (close /
   guarded-close via `CloseGuardContext` / blocking-inert). The three behaviors already exist
   in the repo and must be preserved — see §B.
3. **URL-as-state is preserved as a hard invariant** (copy-paste URL restores state). Internally
   replace the `"urlChanged"` global event with the Router context and retire the event
   (deprecated shim during migration, removed after); migrate `Tabs` + `useWorkspaceId`.
4. **z-index → one `--rk-z-modal` base + `index` increment for the stack; a small fixed band
   ladder above/below with `~1000` gaps.** No per-component magic numbers; nothing else
   increments.

## Out of scope

- Redesigning the route DSL.
- Converting declarative URL-driven panels into imperative store pushes.
- Merging kratt desktop windows into the modal stack (they stay in the isolated Tier-1 layer).
