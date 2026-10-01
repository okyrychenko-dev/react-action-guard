# Architecture migration

The Blocking lifecycle owns blocker transitions, generation-safe timeouts, immutable reads, and
ordered observation. Global and provider-scoped stores adapt independent lifecycles through
`@okyrychenko-dev/react-zustand-toolkit` and Zustand. There is no additional state manager.

## Removed compatibility interfaces

The store no longer exposes `activeBlockers`, `middlewares`, `registerMiddleware`,
`unregisterMiddleware`, or `runMiddlewares`. `StoredBlocker`, `BlockingObservationOptions`, `ShallowStoreBindings`, and Devtools `DEVTOOLS_MIDDLEWARE_NAME` are no
longer exported, and the lifecycle no longer supports compatibility `restore()` calls.

| Previous usage                                      | Supported replacement                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| Read a blocker map                                  | Select `blockingSnapshot`, or call `getBlockingInfo(scope)`               |
| Write a blocker map with `setState`                 | Call `addBlocker`, `updateBlocker`, `removeBlocker`, or a clear action    |
| Use core `ShallowStoreBindings`                     | Import the binding type from `@okyrychenko-dev/react-zustand-toolkit`     |
| Use `StoredBlocker`                                 | Use readonly `BlockerInfo` projections                                    |
| Register and unregister by name                     | Acquire `observeBlockingEvents(observer)` and invoke its returned release |
| Dispatch middleware events directly                 | Perform a lifecycle action; events describe actual transitions            |
| Inspect middleware names to coordinate integrations | Own an independent observation lease                                      |

Observation leases are additive, ordered, and safe to release repeatedly. Throws and rejected
promises cannot interrupt transitions or other observers. `configureMiddleware` remains available
and replaces only the global observations it previously acquired. Provider `middlewares` remain
initial observations belonging to that provider's store.

Devtools panels and providers participate in one Observation session per store. They share history
and one automatic observer. The first configured participant owns configuration; ownership transfers
to the earliest remaining configured participant without applying its candidate values until its
next explicit update. Final release detaches the observer before resetting runtime state and history.

Manual Devtools middleware now uses an anonymous lease. The migration-only named global-authority
exception is removed. Attaching a manual global-history middleware alongside automatic observation
adds another history writer; use one approach per history to avoid duplicates. Automatic session
teardown never releases independently owned leases.

TanStack hooks share provider resolution, blocking policy, reasons, identity and cleanup. Their
query, infinite-query, mutation and multi-query results are unchanged. Loading-specific reasons
precede fetching-specific reasons, then error-specific reasons, with the configured/default fallback.

Guarded action, button, field, group and link hooks share state and accessibility interpretation.
Existing disabled, loading and read-only flags remain preserved according to each control kind.
Description and helper-text modes require a nonblank reason ID only while displaying a blocked
reason. Mapping callbacks and distinct blocked-link interactions retain their existing behavior.

Scopes are normalized once: missing scopes mean global and empty lists match nothing, arrays are sorted and deduplicated,
and guarded controls inherit when their explicit scope is missing or an empty list. Global blockers affect ordinary observation;
targeted clearing never treats global as a wildcard.

## Verification

Run `pnpm run check` for builds, lint, package typechecks, configuration tests and all package tests.
Run the docs package `typedoc` command separately from its VitePress build. Scan generated core declarations
for removed compatibility interfaces before release. Historical changelog entries describe older
versions and are not current interfaces.
