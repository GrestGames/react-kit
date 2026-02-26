# Extract `@grest-ts/react` from realestate-api-v2

## Context

The realestate-api-v2 client has a sophisticated, generic UI framework layer under `client/src/common/` — proxy-based form system, Grid, input components, modals, async state hooks, entity tracker, etc. We're extracting this into a standalone package at `C:/GG/react-kit/` so it can be reused across projects (kratt-client, future projects). Single flat package — no sub-packages.

## Package Setup

**Name:** `@grest-ts/react`
**Location:** `C:/GG/react-kit/`

```
react-kit/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Barrel re-export of everything
│   ├── ApiError.ts
│   ├── EntityTracker.tsx
│   ├── ErrorTracker.tsx
│   ├── MyPage.tsx
│   ├── Decimal2.ts
│   ├── UnreachableCode.ts
│   ├── form/
│   │   ├── useAsyncForm.tsx
│   │   ├── FormRoot.ts
│   │   ├── FormObjectData.ts
│   │   ├── FormObjectProxyHandler.ts
│   │   ├── Form.tsx
│   │   ├── ActionMenu.tsx
│   │   ├── PillButton.tsx
│   │   ├── PillButton.css
│   │   ├── css/
│   │   │   ├── button.css
│   │   │   ├── form.css
│   │   │   ├── grid.css
│   │   │   ├── input.css
│   │   │   └── loader.css
│   │   ├── input/
│   │   │   ├── StandardFormElementProps.ts
│   │   │   ├── TextInput.tsx
│   │   │   ├── NumberInput.tsx
│   │   │   ├── DateInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── AutoComplete.tsx
│   │   │   ├── AutoComplete.css
│   │   │   ├── Checkbox01.tsx
│   │   │   ├── checkbox.css
│   │   │   ├── CheckboxGroup.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── toggle.css
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FileUpload.css
│   │   │   ├── Button.tsx
│   │   │   ├── DeleteObjectSection.tsx
│   │   │   ├── DeleteObjectSection.css
│   │   │   ├── InlineEditWrap.tsx
│   │   │   ├── InlineEdit.css
│   │   │   └── useInlineEdit.ts
│   │   ├── text/
│   │   │   ├── Currency.tsx
│   │   │   ├── Percent.tsx
│   │   │   ├── Sq.tsx
│   │   │   ├── FileSize.tsx
│   │   │   ├── DatePast.tsx
│   │   │   └── RelativeDate.tsx
│   │   ├── other/
│   │   │   ├── TipBox.tsx
│   │   │   ├── TipBox.css
│   │   │   ├── FileIcon.tsx
│   │   │   ├── FileIcon.css
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ProgressBar.css
│   │   ├── grid/
│   │   │   ├── Grid.tsx
│   │   │   ├── GridCards.tsx
│   │   │   ├── GridCards.css
│   │   │   ├── FileGrid.tsx
│   │   │   ├── FileGrid.css
│   │   │   ├── FileGridMini.tsx
│   │   │   └── FileGridMini.css
│   │   └── tabs/
│   │       ├── Tabs.tsx
│   │       └── Tabs.css
│   ├── mini/
│   │   ├── PopupPanel.tsx
│   │   ├── Panel.tsx
│   │   ├── Panel.css
│   │   ├── DarkBackground.tsx
│   │   ├── DarkBackground.css
│   │   ├── Alert.tsx
│   │   ├── LoadingPopup.tsx
│   │   ├── BatchProgressPopup.tsx
│   │   ├── FileViewer.tsx
│   │   ├── FileViewer.css
│   │   ├── FileIframe.tsx
│   │   ├── LazyDataSet.tsx
│   │   ├── MainArea.tsx
│   │   ├── MiniTip.tsx
│   │   ├── MiniTip.css
│   │   ├── Separator.tsx
│   │   ├── ToolTip.tsx
│   │   ├── ToolTip.css
│   │   └── useDropDownPositioning.tsx
│   ├── helpers/
│   │   ├── useAsyncState.ts
│   │   ├── useAsyncEffect.ts
│   │   ├── useOnlyLatestResult.ts
│   │   ├── AddToBody.ts
│   │   └── useOutsideClick.ts        ← NEW: copied from app/formElements/
│   ├── responsive/
│   │   └── useResponsive.ts
│   ├── util/
│   │   ├── ArrayUtils.ts
│   │   ├── DateUtils.ts
│   │   ├── StringUtils.ts
│   │   ├── EnumHelper.tsx
│   │   ├── ImageUtil.ts
│   │   ├── deepClone.ts
│   │   ├── download.ts
│   │   ├── isPromise.tsx
│   │   ├── part.tsx
│   │   ├── selectTargetElementText.ts
│   │   └── viewTransition.ts         ← simplified from useFlip.ts
│   └── css/
│       └── base.css                   ← generic base styles from Common.css
```

**Excluded files** (domain-specific or unnecessary):
- `ExampleSheet.tsx` — demo component
- `LanguageIcon.tsx` — needs `flag-icons`, domain-specific
- `CopyEmailButton.tsx` — domain-specific
- `Router.tsx` — custom query-string router (app-specific)
- `Logger.ts` — not used by any component in common/

## 5 Coupling Points to Resolve

### 1. `useOutsideClick` (ActionMenu.tsx)
**Current:** imports from `../../app/formElements/useOutsideClick`
**Fix:** Copy the 27-line hook into `src/helpers/useOutsideClick.ts`. Update import in ActionMenu.tsx to `../../helpers/useOutsideClick`.

### 2. `useCompanyAuth` in Grid.tsx (line 92, 177)
**Current:** `const companyAuth = useCompanyAuth()` — uses `companyAuth.jwt?.company?.companyId` as useEffect dependency to reset data when company changes.
**Fix:** Add optional `reloadKey?: any` prop to Grid. Replace the companyAuth useEffect with:
```tsx
useEffect(() => {
    if (reloadKey === undefined) return;
    updateData(undefined);
    setFilter((f) => f ? {...f, limit: [0, rowsPerCall] as [number, number]} : f);
}, [reloadKey]);
```
Consuming app passes `companyAuth.jwt?.company?.companyId` as `reloadKey`.

### 3. `useCompanyAuth` in LazyDataSet.tsx (line 19, 43)
**Current:** Same pattern — reloads when company ID changes.
**Fix:** Add optional `reloadKey?: any` to `LazyDataSetProviderProps`. Replace the companyAuth useEffect with a reloadKey useEffect.

### 4. `@realestate/api/Brands` in DateUtils.ts (line 1)
**Current:** `import {tDate, tYearMonth} from "@realestate/api/Brands"`
**Fix:** Define branded types locally at top of DateUtils.ts:
```ts
export type tDate = string & { __brand: "tDate" };
export type tYearMonth = string & { __brand: "tYearMonth" };
```

### 5. `AppRouter.Popup` in useFlip.ts → viewTransition.ts
**Current:** Checks if a popup is open before running view transition.
**Fix:** Simplify to accept an optional `shouldSkip?: () => boolean` parameter:
```ts
export function viewTransition(update: () => void, shouldSkip?: () => boolean) {
    if (!(document as any).startViewTransition || shouldSkip?.()) {
        update();
        return;
    }
    (document as any).startViewTransition(() => { flushSync(update); });
}
```

## Import Path Fixes

Several files use redundant self-referencing paths like `../../common/ApiError` that worked in the original structure (`common/form/X.ts` → `../../common/` resolves back into `common/`). In the extracted package (`src/form/X.ts`), these need fixing:

| File | Old import | New import |
|------|-----------|------------|
| `form/FormObjectData.ts` | `../../common/ApiError` | `../ApiError` |
| `form/useAsyncForm.tsx` | `../../common/ApiError` | `../ApiError` |
| `form/input/DeleteObjectSection.tsx` | `../../../common/ApiError` | `../../ApiError` |
| `form/input/StandardFormElementProps.ts` | `../../../common/ApiError` | `../../ApiError` |
| `helpers/useAsyncState.ts` | `../../common/ApiError` | `../ApiError` |
| `helpers/useOnlyLatestResult.ts` | `../../common/ApiError` | `../ApiError` |

## Base CSS (`src/css/base.css`)

Extract generic styles from `Common.css`, excluding domain-specific rules (`.apartmentFeature`, etc.):
- HTML/body reset, font family
- Table base styles (`.list`, `.form`, `.shrinked`)
- `.area` card style
- `.box` bordered container
- Color utilities (`.gray`, `.red`, `.green`, `.orange`, `.blue`, `.brown`, `.purple`, `.pink`, `.teal`)
- Size utilities (`.micro`, `.mini`, `.small`, `.normal`, `.large`, `.huge`, `.gigantic`)
- Text utilities (`.bold`, `.nowrap`, `.singleLine`, `.center`, `.left`, `.right`, `.vmiddle`)
- `.tag`, `.tag-green`, `.tag-gray`, `.tag-orange`
- `hr` styling
- Mobile responsive overrides for tables/forms
- Remove: `.apartmentFeature`, `.bicycleSpot`, `.parking`, `.storage`, `body { min-width: 1200px }`, `.pageContent:has(.tv2Root)`

## Dependencies

**package.json:**
```json
{
  "name": "@grest-ts/react",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*.css": "./src/*.css",
    "./css/base.css": "./src/css/base.css"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@grest-ts/schema": ">=0.0.17",
    "@grest-ts/schema-file": ">=0.0.17"
  },
  "optionalDependencies": {
    "react-datepicker": ">=7"
  },
  "devDependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@grest-ts/schema": "^0.0.18",
    "@grest-ts/schema-file": "^0.0.18",
    "react-datepicker": "^9.1.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/react-datepicker": "^7.0.0",
    "typescript": "^5.9.3"
  }
}
```

**Note:** Ship TypeScript source directly (no build step). Consuming apps (Vite) compile it. This is the simplest approach for personal use — no build, no dist folder, no declaration generation. Just `"main": "src/index.ts"`. The consumer's bundler handles everything including CSS imports.

**tsconfig.json:** Minimal — just for type-checking during development:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "customConditions": ["browser"]
  },
  "include": ["src"]
}
```

## Execution Order

1. Create `package.json` and `tsconfig.json`
2. Copy all files from `realestate-api-v2/client/src/common/` → `react-kit/src/`, preserving directory structure
3. Copy `useOutsideClick.ts` from `app/formElements/` → `src/helpers/`
4. Apply the 5 coupling fixes
5. Fix all self-referencing import paths
6. Create `src/css/base.css` from Common.css
7. Create `src/index.ts` barrel export
8. Run `tsc --noEmit` to verify no type errors
9. Install dependencies

## Verification

- `npm install` succeeds
- `npx tsc --noEmit` passes with zero errors
- All 74 .ts/.tsx files and 25 .css files are present
- No imports reference `@realestate/`, `useCompanyAuth`, `AppRouter`, or `app/formElements`
