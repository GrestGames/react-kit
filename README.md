# grest-react-kit

A React UI library (forms, grid, inputs, modals, async-state hooks) built on
grest-ts schemas. Source-distributed: consumers import `.ts`/`.tsx` directly
and bundle it themselves (`exports` points at `src/`).

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

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```
