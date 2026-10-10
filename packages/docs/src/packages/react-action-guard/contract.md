# Stable Core responsibilities

This is the bounded contract for the **planned Core 2.0 stabilization** represented by current source.
It is not a claim that Core 2.0 is published. Check manifests, pending Changesets and the
[versioned capability evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md)
when selecting a release. Applying the release cohort and registry publication are separate work.

## Boundaries

Core owns blocker registration and configuration, scope matching and observation, the Blocking
lifecycle and established React composition. The lifecycle is transition authority; Zustand adapts
immutable projections to React. Providers create independent stores; global fallback is convenience
state and is unsuitable for SSR request isolation.

Core continues to support `useActionBlocker`, `useAsyncAction`, availability/metadata hooks,
conditional, scheduled and confirmable helpers, `createTypedHooks`, public lifecycle creation,
provider/context APIs and existing logger/performance/analytics helpers. Stabilization does not
remove those specialized helpers or add new primitives. The deprecated `useBlocker` alias remains
supported while current examples use `useActionBlocker`.

## Preserved guarantees

- Exact-label matching, explicit multi-scope registration and global observation semantics; dotted
  labels do not create hierarchy. Targeted clearing does not remove global blockers.
- Priority orders metadata/reasons; all matching active blockers retain protection.
- Readonly immutable blocker snapshots and scope arrays; retained reads cannot mutate live state.
- Snapshot publication before events, FIFO reentrant publication and isolated observer failures.
- Additive observation leases with idempotent release and independent ownership.
- Adjacent/nested provider isolation, current provider resolution, Strict Mode cleanup and SSR boundaries.
- Typed hooks constrain scope vocabulary without creating a separate store.
- Explicit IDs are store-local names; duplicate warnings do not prevent replacement or shared-ID cleanup.

## Registration and execution policies

Active registration configuration replaces previous values, clears omitted optional fields and avoids
updates for equivalent scopes. Unchanged timeouts retain deadlines and use current callbacks;
changed timeout durations restart timers and removed timeouts cancel them. Conditional timeout ends
its current true episode; scheduled timeout does not move the independent scheduled end notification.
See [registration details](../../guides/lifecycle) for reactivation behavior.

Mounted registrations release on detach. Async action execution registrations survive caller unmount
and end per call on settlement, clearing or timeout. Query registration follows active-request policy
and mounted ownership. Mutation protection accounts for all owned unsettled calls while preserving
native latest-result observation; reset/key changes/detach do not discard pending ownership.
See the [mutation lifetime guide](../../guides/mutations) for callback and expired-episode behavior.
Timeouts release protection without cancelling work. Tracking does not exclude concurrent calls.

## Decisions outside this contract

Automatic logical identities, application guard factories, a standalone lifecycle/headless entry,
telemetry extraction and analytics migration need separate evidence-backed decisions. Existing
`createBlockingLifecycle` is supported through the current core entry; it does not promise a new
non-React distribution or provider store-injection API. UI, router and Query adapters remain optional.

Read the [migration guide](./migration), [generated public reference](./api/typedoc/README),
[ownership guide](../../advanced/ownership) and [observability guide](../../advanced/observability).
