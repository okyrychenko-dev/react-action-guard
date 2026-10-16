# Mutation compatibility verification

Source baseline: `6a08414` (2026-10-16). This is verification of the existing
binding; no mutation observer or execution-owner runtime changes are included.

## Coverage inventory before extending tests

| Public behavior                                                                                 | Existing evidence                                                   | Added differential coverage                                                                                            |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A/B overlap, latest result, both invocation methods                                             | `useBlockingMutation.lifetime.test.tsx`; packed `mutation.test.mjs` | Direct native/adapter comparison for success and failure, hook/per-call callback order and latest variables/data/error |
| Reset with pending work, unmount and late settlement                                            | Lifetime suite and packed callback-completion case                  | Native/adapter reset snapshots and per-call callback suppression after reset/detach                                    |
| Provider/store replacement and return                                                           | Lifetime suite; `useBlockingMutation.storeReturn.test.tsx`          | Reuse existing ownership tests; no duplicate store harness                                                             |
| Awaited hook/cache callbacks, ignored per-call promises, callback throws                        | Lifetime suite                                                      | Reuse existing coverage                                                                                                |
| Error boundary predicates, client defaults, original error values                               | Lifetime suite                                                      | Native/adapter comparison while an older execution is still pending when the latest error unmounts the observer        |
| Retry, offline pause, scope queue, timeout episodes, key/client changes and callback reentrancy | Lifetime suite; packed reentrancy and synchronous-failure cases     | Reuse existing coverage                                                                                                |
| Generic variables/results/callback types and installed entry points                             | Source type tests and packed `.mts`/`.cts`, ESM/CJS consumers       | Reuse existing consumers                                                                                               |

The source additions are in `src/hooks/__tests__/useBlockingMutation.differential.test.tsx`.
The existing packed fixture is `scripts/compatibility/mutation.test.mjs` at repository
root. Both compare to native Query and assert explicit expected behavior, so parity
alone cannot silently bless callback loss on both sides.

## Selected versions and intentional differences

Source tests use the locked Query 5.90.10. The packed targets select Query 5.90.10
and 5.104.1 with React/DOM 19.2.8, TypeScript 5.6.3 and type-utils 0.1.2.
“Comparison target” does not mean the latest registry release. These points do not
establish compatibility across the entire declared `^5.90.10` range.

Native result observation remains latest-call observation. Protection accounts for
all calls owned by the hook, so it can remain active after B succeeds, after reset,
after an error boundary detaches the observer or after a Provider change. Pending
work stays in its originating store and ends on actual settlement or the configured
blocker timeout. Timeout does not cancel execution. Per-call callback promises are
not awaited; hook/cache callbacks follow native execution. No deduplication,
authorization or serialization is added.

## Reproduction

```sh
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack exec vitest run src/hooks/__tests__/useBlockingMutation.differential.test.tsx src/hooks/__tests__/useBlockingMutation.lifetime.test.tsx src/hooks/__tests__/useBlockingMutation.storeReturn.test.tsx
pnpm run build
pnpm run test:packed query-floor query-current
```

Packed checks apply actual pending Changesets in a disposable workspace, then
install the planned tarballs with strict peer resolution. Successful `result.json`
files and consumer locks identify exact evaluated versions. These checks do not
publish packages or verify the npm registry cohort. Full release/browser verification
remains a separate release verification step.

## Executed verification — 2026-10-16

- Full workspace suite: 902 passed (35 configuration + 867 workspace tests).
- Focused differential/lifetime/store-return suites: 43 passed; differential suite
  rerun after the import review correction: 5 passed.
- Workspace build and typecheck, adapter lint, and documentation check passed
  (25 canonical examples, 21 migrated reference imports, 200 links).
- Fresh strict-peer packed consumers passed ESM/CJS loading, NodeNext declaration
  checks and all 11 mutation cases on each selected Query version (22 total).
  The first sandboxed registry install timed out; the registry-enabled rerun passed.
- Both consumers installed planned Core 2.0.0, UI/Router/Devtools 1.0.0 and
  Query adapter 0.4.0. These are disposable Changesets-versioned artifacts;
  source manifests were unchanged and nothing was published.

- `query-floor`: Query 5.90.10, Query Core 5.90.10; completed 2026-10-16T09:15:23.681Z on Node v22.20.0.
- `query-current`: Query 5.104.1, Query Core 5.104.1; completed 2026-10-16T09:15:30.869Z on Node v22.20.0.

Artifact SHA-256 (planned tarballs used by both consumers):

```text
8e6141f7f9a490320d2191811e28193912e6da5c55175273a1998deb0dcf96f7  core.tgz
e2a143e686758c2217a5815dcad2193451d67af5cd3f77c301eb23968183ebca  ui.tgz
b5dcc90b06000c0bab099288a37015dbd1298013ebd9dbabf1d7da2a62dfdee6  router.tgz
fc5ba765a49d530d1240bb9e256e34311d5abeef047f2fa2425704e1bc14b2ea  devtools.tgz
523cd3a2fcd9f3035fa56314fc9da51723782a54821d5664f7898402d8832408  tanstack.tgz
```

Consumer locks and raw results were retained in
`/tmp/action-guard-compatibility-hqgjHC`. Other compatibility targets and Next
production-browser checks were not rerun; the full release evidence remains separate.
