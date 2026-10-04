# Capabilities and compatibility evidence

Evaluated **2026-10-04** against the pending Changesets cohort based on `490aad3`:
Core 1.0.5, UI 0.1.5, Devtools 0.3.0, Query adapter 0.3.5 and Router adapter 0.2.4
are the source manifest versions, **not the resulting release versions**. Release
these packages together after Changesets versioning. A manifest alone establishes
neither application runtime compatibility nor adoption of a sibling library.

Evidence kinds follow the sibling modal-manager format:

- **Verified behavior**: an executed public-interface check with the environment below.
- **Verified declarations/loading**: packed ESM/CJS entry points and NodeNext types; does not imply router application behavior.
- **Declared contract**: supported manifest ranges or API promises, beyond the finite evaluated versions.
- **Source observation**: an implementation fact; not an independently verified consumer guarantee.
- **Documented limitation**: a boundary consumers must account for.
- **Unverified**: no executed evidence for that environment or composition.

## Package and React evidence

Run `pnpm run build && pnpm run test:packed`; target names and exact versions are
listed in the [packed-check guide](scripts/compatibility/README.md). The [recorded packed results](scripts/compatibility/evidence.json) retain evaluated versions and UTC dates. The local run used Node 22.20.0, pnpm 11.21.0 and npm 11.19.0. The runner
retains resolved locks and dated result files in fresh temporary consumers. The
[CI matrix](.github/workflows/ci.yml) reruns each target; a configured job alone is
not a recorded passing result. Native Node ESM and CJS loading is tested separately
from browser-like memory-router behavior. TypeScript checks use 5.6.3, NodeNext,
`.mts` and `.cts`, with `skipLibCheck` (third-party declaration internals excluded).

| Area                             | Capability and boundary                                                                                                       | Evidence kind                                                      | Evaluated versions/date and reproducible check                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Published packages               | Core, UI, Devtools and Router root load with no optional router or Query peers; Query root loads with its required Query peer | Verified declarations/loading                                      | 2026-10-04; [runner](scripts/check-packed-compatibility.mjs), `pnpm run test:packed`; manifests listed above                                                                                |
| Router subpaths                  | `/react-router`, `/tanstack-router`, `/nextjs` load with only the relevant optional router peer                               | Verified declarations/loading                                      | 2026-10-04; `react-router-floor`, `react-router-7-floor`, `react-router-current`, `tanstack-router-floor`, `next-13-floor`, `next-14-floor`, `next-15-floor`, `next-current` targets        |
| React providers                  | Nested, adjacent and independent roots isolate equal blocker IDs; Strict Mode cleanup releases registration                   | Verified behavior                                                  | 2026-10-04; React/DOM 18.0.0, 19.0.0, 19.2.8; [public provider fixture](scripts/compatibility/provider.test.mjs); `react-18`, `react-19-floor`, `react-19` targets                          |
| SSR/hydration                    | Provider stores isolate server renders and hydration creates client state without recoverable mismatch                        | Verified behavior                                                  | Same versions/date/fixture; effect-owned blockers start after hydration; no server snapshot transfer is promised                                                                            |
| Global fallback                  | Provider-free hooks use a module-level default store; provider state does not leak into it                                    | Source observation plus verified provider isolation                | [Core resolver](packages/core/src/context/useResolvedStore.ts), provider fixture above; 2026-10-04. Use a provider for each request; the global fallback is not request isolation           |
| React support                    | React `^18.0.0 \|\| ^19.0.0`; selected tests are finite samples                                                               | Declared contract                                                  | [Core manifest](packages/core/package.json), 2026-10-04; intervening React versions and other renderers unverified                                                                          |
| Runtime dependencies             | Toolkit 1.0.0 and type-utils 0.1.2 participate in these packed checks; Zustand 5.0.0 and current 5.0.15 are selected          | Verified loading/selected behavior; declared ranges beyond samples | [runner](scripts/check-packed-compatibility.mjs), 2026-10-04; toolkit/type-utils are required dependencies, not optional integrations                                                       |
| Release resolution               | Current source core version is below Devtools/Query's pending peer range                                                      | Documented limitation                                              | [packed-check guide](scripts/compatibility/README.md), 2026-10-04; explicit peers and legacy peer resolution test the source cohort; strict post-versioning installation remains unverified |
| RSC and Next application runtime | No packed Next app build or server/client boundary check                                                                      | Unverified                                                         | Next checks below establish loading/types only; no RSC guarantee follows from SSR/provider tests                                                                                            |

## Module and navigation evidence

The workspace checks use `pnpm run test:run` with the locked dependencies, including
React/DOM 19.2.8, React Router DOM 7.14.2, TanStack Router 1.170.41 and Query 5.90.10.
Mocked Next route-event tests establish the adapter contract under simulated events,
not a real Next application or history guarantee.

| Area                      | Capability and boundary                                                                                                            | Evidence kind                                                      | Evaluated versions/date and reproducible check                                                                                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core lifecycle            | Immutable blocker snapshots, event observation, timeout and cleanup ownership                                                      | Verified behavior                                                  | 2026-10-04; [public lifecycle suite](packages/core/src/store/blockingLifecycle/__tests__/blockingLifecycle.test.ts), `pnpm --filter @okyrychenko-dev/react-action-guard test:run`                                                                                               |
| Guarded UI                | Scope-derived button, field, group and link states; accessible reasons and consumer-owned rendering                                | Verified behavior                                                  | 2026-10-04; [control matrix](packages/ui/src/ui/hooks/useGuardedControl/useGuardedControl.matrix.test.tsx), `pnpm --filter @okyrychenko-dev/react-action-guard-ui test:run`                                                                                                     |
| Query adapter             | Active fetching and pending mutations coordinate provider-scoped blocking; disabled/paused pending queries do not block by default | Verified behavior at selected version                              | Query 5.90.10, 2026-10-04; `pnpm --filter @okyrychenko-dev/react-action-guard-tanstack test:run`; [tests](packages/tanstack/src/hooks)                                                                                                                                          |
| Devtools                  | Store-bound observation sessions and observer cleanup; SSR does not attach observations                                            | Verified behavior                                                  | 2026-10-04; [session tests](packages/devtools/src/store/__tests__/devtoolsStore.test.ts), [SSR tests](packages/devtools/src/store/__tests__/devtoolsStore.ssr.test.ts); `pnpm --filter @okyrychenko-dev/react-action-guard-devtools test:run`                                   |
| React Router              | Denial retains location, confirmation permits one transition, later attempts remain protected                                      | Verified memory-router behavior                                    | 6.19.0, 7.0.0 and 7.14.2, 2026-10-04; [packed navigation fixture](scripts/compatibility/navigation.test.mjs), `react-router-floor`, `react-router-7-floor`, `react-router-current` targets. v6 below 6.19.0 excluded: stable `useBlocker` is unavailable                        |
| TanStack Router           | Native blocking, custom dialog composition, stale-confirmation denial and protected subsequent attempts                            | Verified workspace memory-router behavior                          | 1.170.41, 2026-10-04; [native suite](packages/router/src/tanstack-router/__tests__/useNavigationBlocker.test.tsx), [dialog suite](packages/router/src/tanstack-router/__tests__/dialogNavigation.test.tsx); `pnpm --filter @okyrychenko-dev/react-action-guard-router test:run` |
| TanStack browser history  | Same-document back/forward on matched routes; cancel stays, confirm reaches intended destination once                              | Verified browser behavior (prior recorded run)                     | 2026-10-03; Chrome 154.0.8037.57, Router 1.170.41, React/DOM 19.2.8; [browser evidence and command](packages/router/browser/README.md). Other browsers/cross-document history unverified                                                                                        |
| TanStack unmatched routes | Native not-found-to-matched navigation bypasses the blocker; callbacks are not invoked                                             | Documented limitation with real-router test                        | 1.170.41, 2026-10-04; native suite above; no compensation is implemented                                                                                                                                                                                                        |
| Next peer checks          | Next 13.4.0, 14.0.0, 15.0.0 and 15.5.23 support selected packed loading/types                                                      | Verified declarations/loading                                      | 2026-10-04; corresponding `next-*` targets; [Next manifest ranges](packages/router/package.json) are a declared contract, not runtime evidence                                                                                                                                  |
| Next Pages Router         | Route-event cancellation followed by `router.push(url)` replay for async acceptance                                                | Declared contract / simulated-event tests; real runtime unverified | [Pages adapter](packages/router/src/nextjs/usePagesRouterBlocker.ts), [tests](packages/router/src/nextjs/__tests__/usePagesRouterBlocker.test.ts), 2026-10-04. Replay may lose shallow/scroll/locale and original history semantics                                             |
| Next App Router           | Requests `beforeunload` prompt for document unload, subject to browser policy                                                      | Source observation / documented limitation                         | [App adapter](packages/router/src/nextjs/useAppRouterBlocker.ts), 2026-10-04; no same-document back/forward, Link or push interception; `onConfirm` is not evaluated                                                                                                            |
| Unload prompt UI          | Native prompt text/display and cross-document cancellation depend on browser policy                                                | Unverified browser behavior                                        | DOM beforeunload tests are not native-prompt evidence; no custom dialog on document unload is promised                                                                                                                                                                          |
| Payment cancellation      | Blocking cleanup and leaving a route do not abort requests or roll back transactions                                               | Documented limitation                                              | [async lifetime tests](packages/core/src/hooks/useAsyncAction/__tests__/useAsyncAction.lifetime.test.tsx), 2026-10-04; cancellation/authorization/idempotency remain application/server responsibilities                                                                        |

## Optional ecosystem composition

| Library               | Role and boundary                                                                                                                                                                                                                    | Evidence kind/date                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| react-zustand-toolkit | Required state/provider resolution dependency for Core and Devtools                                                                                                                                                                  | Verified selected cohort behavior at 1.0.0, 2026-10-04; no sibling results substituted                                                                                            |
| type-utils            | Required narrowing/types dependency                                                                                                                                                                                                  | Verified packed loading at 0.1.2, 2026-10-04; no sibling runtime compatibility claim                                                                                              |
| react-modal-manager   | Optional [confirmation UI](https://github.com/okyrychenko-dev/react-modal-manager/blob/0f76957bcf4ff4437d774fb567f87418fe57496e/README.md); adapt its result to a boolean promise and map reject/dismiss to denial                   | Declared composition contract, 2026-10-04; real sibling integration unverified. Public confirm-promise composition is exercised by the dialog suite, without adopting the sibling |
| react-effect-when     | Optional [effect gating](https://github.com/okyrychenko-dev/react-effect-when/blob/69c7381dcb301b57faf2a9ae39fd1460909ea877/README.md) (1.4.0); resource effects require `once: false` to reacquire when eligible                    | Source/design observation, 2026-10-04; Action Guard integration unverified. It does not replace blocker lifecycle ownership                                                       |
| assistant-kit         | [Application-authorized/idempotent action execution](https://github.com/okyrychenko-dev/assistant-kit/blob/2611d483117f315dc378f097555d46721b5ad472/packages/ai-actions-core/README.md); UI blocking does not replace backend checks | Source/design observation, 2026-10-04; integration unverified                                                                                                                     |
| legacy and tmp        | Historical/prototype references                                                                                                                                                                                                      | Excluded support targets, 2026-10-04                                                                                                                                              |

An optional confirmation boundary can deny rejection without adding a dependency:

```ts
const onConfirm = (message: string): Promise<boolean> =>
  confirmWithApplicationModal(message).then(
    (accepted) => accepted === true,
    () => false
  );
```

`confirmWithApplicationModal` is application-provided. Modal result semantics,
accessibility, resource cleanup, server authorization and execution cancellation
remain with their owners. No sibling adoption or full version-range compatibility
is inferred from a manifest or example.

## Migration and release impact

All five packages now publish format-specific declarations for ESM and CommonJS.
Core's legacy `main`/`module` paths point to existing artifacts, and the Next adapter resolves `next/router.js` for native ESM loading. Public root and
per-router import paths remain the same. React Router users on v6 below **6.19.0**
must upgrade; the adapter requires stable `useBlocker` and a data router. The router
peer-floor exclusion is a pre-1.0 minor release; declaration repairs are patches.
The pending lifecycle Changesets separately determine the complete cohort's version
and internal core peer updates. No optional sibling becomes a required dependency.
