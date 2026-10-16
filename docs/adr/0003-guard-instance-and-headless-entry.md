# Evaluate guard instances and headless distribution independently

Accepted on 2026-10-12. Defer an application guard-instance factory and independently defer a standalone headless entry/package. Current repository consumers use React Providers or the public Core lifecycle; no actual external non-React consumer was supplied.

## Application guard instance

The [Provider](../../packages/core/src/context/UIBlockingContext.tsx) creates an isolated store for a subtree and exposes it through descendant context hooks. It accepts children and initial middleware, without public store injection or a custom-store factory. The [typed facade](../../packages/core/src/createTypedHooks.ts) constrains scopes but allocates neither a store nor IDs. The [ownership guide](../../packages/docs/src/advanced/ownership.md) distinguishes these from an independently created lifecycle. Do not treat the exported store type as a creation API.

| Option                                        | Benefit / cost                                                                                                                                 | Decision |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Provider plus context actions and typed hooks | Existing subtree isolation, imperative descendant access and compile-time scope vocabulary; external orchestration requires application wiring | Retain   |
| Application `createActionGuard` instance      | Could bind typed hooks, imperative actions and observation to one owner; adds store injection, disposal and adapter-binding contracts          | Defer    |

The [Provider suite](../../packages/core/src/context/__tests__/UIBlockingContext.test.tsx) exercises nested/sibling/global isolation and provider identity changes; the [typed-hook suite](../../packages/core/src/createTypedHooks.test.tsx) covers the existing facade. The showcase is a repository consumer, not measured evidence that an instance factory reduces real application wiring. Reconsider after a real integration demonstrates repeated imperative-outside-tree ownership pain and compares Provider/context wiring with a minimal instance prototype.

Any future instance spec must define whether hooks bind an instance or resolve context, mismatch behavior, adapter/Devtools binding, ownership of timers and observation leases, disposal with unsettled async work, and Strict Mode/remount semantics. SSR needs one owner per request and stable client initialization; a process singleton can leak protection across requests. Keep existing Provider/global defaults compatible and migrate opt-in consumers before proposing removal. Independent UI/Router/Query/Devtools packages remain composable rather than mandatory instance dependencies.

## Standalone lifecycle distribution

[createBlockingLifecycle](../../packages/core/src/store/blockingLifecycle/blockingLifecycle.ts) is already public through [Core exports](../../packages/core/src/index.ts). Its [interface](../../packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts) offers immutable snapshots, observation, subscriptions and transitions. It is not automatically connected to React Provider hooks. Internal lifecycle decoupling is complete enough to assess reuse without a rewrite.

| Option                               | Benefit / cost                                                                                                    | Decision |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------- |
| Existing Core root lifecycle export  | Supported imperative boundary and existing lifecycle tests; Core still declares React/Zustand peers               | Retain   |
| Core headless subpath                | Could isolate imports; a subpath alone does not remove package-level peers, and needs packed ESM/CJS/types checks | Defer    |
| Separate non-React lifecycle package | Could have independent peers and releases; introduces re-exports, version skew, type identity and migration costs | Defer    |

Core's [manifest](../../packages/core/package.json) currently exports only its root and declares React/Zustand peers. Source separation or tree shaking does not prove a React-free installation contract. No claim of a standalone framework-neutral package follows from the existing lifecycle API.

Reconsider independently of the factory when an actual non-React consumer supplies a runnable integration and a demonstrated installation, bundle or ownership constraint. Compare root import, subpath and extraction using fresh packed consumers, peer installation, SSR/environment safety, lifecycle cleanup/reentrancy and type compatibility. Preserve root re-exports during migration; extraction needs a separate bounded spec and release plan. No new factory, subpath or package is selected here.
