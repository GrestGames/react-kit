# Forms (`useAsyncForm` + grest-ts schemas)

How to build a create/edit form with grest-react-kit. The golden rule:

> **The form binds the wire schema literally. Validation is the schema's job, not yours.**

A correct form is mostly declarative — `init` loads, `onSubmit` sends, the inputs
bind to schema fields, and grest-ts + react-kit handle validation and error
display. If you find yourself hand-writing a form interface, remapping fields, or
calling `setValidationError`, you've left the happy path.

## Canonical shape

```tsx
import {useAsyncForm, Form, TextInput, PasswordInput, FormSubmitButton} from "grest-react-kit"
import {type CreateItemRequest} from "@app/api"   // = typeof IsCreateItemRequest.infer

export function EditItem({id}: {id: string}) {
    const {api} = useApi()
    const isNew = id === "new"

    const [F] = useAsyncForm<CreateItemRequest>({
        init: async () => isNew
            ? {name: "", secret: ""}                       // empty values, not a hand-built shape
            : await api.item.get({itemId: id as tItemId}), // load ONE item, don't list()-and-find
        onSubmit: async (data) => {
            if (isNew) await api.item.create(data)         // pass the wire shape straight through
            else       await api.item.update({itemId: id, ...data})
            onClose()                                      // then refresh your list however the app does
            return true
        },
    }, [id])

    return <Form prop={F}>
        <table className="form"><tbody>
            <tr><td>Name</td>  <td><TextInput prop={F.name} className="wide"/></td></tr>
            <tr><td>Secret</td><td><PasswordInput prop={F.secret} className="wide"/></td></tr>
            <tr><td></td>      <td><FormSubmitButton/></td></tr>
        </tbody></table>
    </Form>
}
```

That's it. No `interface ItemForm`, no per-field validation, no error banners.

## How validation actually flows

1. `onSubmit` calls `api.item.create(data)`. grest-ts validates `data` against the
   contract's input schema and **throws `VALIDATION_ERROR`** if it fails.
2. `FormRoot.submit` catches it: a `VALIDATION_ERROR` is mapped **by issue path**
   onto the matching form fields; **any other** thrown error becomes the
   form-level submit error.
3. Each input renders its **own** `validationError.msg` (see `TextInput`,
   `NumberInput`, `FileUpload`). The `<Form>` auto-renders the form-level submit
   error as a `TipBox` ("Please go over the form…").
4. Editing any field clears that field's error **and** the submit `TipBox`.

So: an empty required `name` becomes an inline error under the Name input with
**zero** form code — because the schema says `name: IsString.trim.nonEmpty`.

## Rules

- **Type the form from the schema.** `useAsyncForm<typeof IsCreateX.infer>` (export
  the inferred request type from your `api` package). Never hand-write an `XForm`
  interface — the wire schema is the single source of truth for the shape.
- **Load one item with a `get({id})` endpoint.** Add `get` to the contract; never
  `list()` then `.find()`.
- **Pass the wire shape through.** `create(data)` / `update(data)`. Selecting a few
  fields for a different endpoint is fine; *reshaping* values (flattening a nested
  field, rebuilding an object) is the smell to avoid.
- **Two schemas for two realities.** Create and update are different shapes:
  - **Create** — required fields (e.g. a new item *must* have a secret).
  - **Update** — every field optional; one left `undefined` is **skipped
    server-side** (keeps the existing value), so a rename-only edit doesn't touch
    the secret.
  - Don't force one schema to serve both.
- **Validation lives in the schema, never in the component.**
  - ❌ `throw new Error("Enter a secret")` in `onSubmit` → becomes a generic submit
    popup, not a field error.
  - ❌ `F.x.setValidationError(...)` to enforce "required".
  - ✅ Make the field's *schema* express the rule (`IsString.trim.nonEmpty`,
    `IsFile`, `maxLength`, a branded `refine`, …) and let it surface automatically.
- **Reuse the primitives.** Inputs render their own errors. `FormSubmitButton` is
  auto-disabled until the form is changed. `DeleteObjectSection` is the standard
  delete-confirm. `Tabs` organizes multi-section forms. `TipBox` is the
  intent-styled note box (`success`/`warning`/`danger`/`neutral`). Don't hand-roll
  any of these.

## Gotchas that cost real time

### "Required" must be a *type-level* fact, not a refine on an optional

`orUndefined` short-circuits validation: when a value is `undefined`, the validator
returns **valid before refinements run**. So this **never fires**:

```ts
text: IsString.orUndefined.refine(t => !!t, REQUIRED)   // ❌ undefined passes, refine skipped
```

To make a field required, type it required (no `orUndefined`):

```ts
text: IsString.trim.nonEmpty                            // ✅ empty/undefined is a validation error
```

This is exactly why create (required) and update (optional) must be **separate
schemas** — a single field can't be "optional in the type but required in
validation."

### Tagged unions: use `IsDiscriminated`, not `IsUnion`

A plain `IsUnion` validates each variant against throwaway issues and, on failure,
reports **one generic union error** at the union's path — which doesn't map to any
input. `IsDiscriminated("via", {…})` validates the matching variant and **keeps its
field error at `field.subfield`**, so react-kit maps it onto the right input.

Render union branches with `.when`:

```ts
secret: IsDiscriminated("via", {
    file: IsObject({via: IsLiteral("file"), file: IsFile}),
    text: IsObject({via: IsLiteral("text"), text: IsString.trim.nonEmpty}),
})
```
```tsx
{F.secret.when("via", "file", s => <FileUpload prop={s.file}/>)}
{F.secret.when("via", "text", s => <PasswordInput prop={s.text}/>)}
```

## Field API (the `F` proxy)

`F.field` exposes: `.val()`, `.set(v)`, `.isChanged()`, `.validationErrors()`,
`.setValidationError({msg})` (rarely needed), and `.when(discriminator, value, render)`
for discriminated unions. Nested fields chain: `F.secret.text`.

## Component cheat-sheet

| Need | Use |
|---|---|
| Form wrapper + context | `<Form prop={F}>` |
| Text / password / number | `TextInput` / `PasswordInput` / `NumberInput` (`className="wide"` for the long variant) |
| File | `FileUpload` (single) / `FileMultiUpload` |
| Boolean / choice | `Checkbox` / `Select` |
| Submit | `FormSubmitButton` (auto-disabled until changed) |
| Delete confirm | `DeleteObjectSection` |
| Multi-section | `Tabs` |
| Inline note | `TipBox intent="success|warning|danger|neutral"` |
| Card grid (lists) | `Cards` + `Card` (`variant="add"` for a "+" tile) |
| New-form seed | `part<T>(partial)` — cast a partial to the full type for `init` |
