# Architecture

React Action Guard coordinates temporary interaction blocking through deep in-process modules.
`@okyrychenko-dev/react-zustand-toolkit` and Zustand remain the state-management base. Each global
or provider-scoped store adapts one independent Blocking lifecycle and publishes immutable snapshots.

## Blocking lifecycle

The lifecycle owns add, replacement, update-as-upsert, removal, clearing, scope clearing, timers,
event construction and observer delivery. Its interface exposes named transitions, scope reads,
`getSnapshot()`, snapshot subscription and anonymous observation leases.

Blocker maps, timeout handles and observer registrations stay inside the implementation. Public
`BlockerInfo` entries, their scope arrays and snapshot arrays are frozen. Store `blockingSnapshot`
is a readonly projection; callers use actions to change it rather than writing implementation state.

Transitions become synchronously visible through reads. Snapshot notifications precede each
transition's event, and notifications from reentrant actions drain in transition order. Observers
run in registration order without awaiting asynchronous completion. Throws and rejected promises
cannot prevent transitions or later observers.

Replacement invalidates earlier timers. Updating metadata keeps a timer's deadline unless a new
timeout is specified. A throwing timeout callback cannot prevent the distinct ordered `timeout`
and `remove` events. A replacement created by a timeout callback survives the old timer's cleanup.

## Scope semantics

One scope module defines normalization, observation, inheritance and targeted clearing. Omitted
scopes mean global. Arrays are deduplicated and sorted; an empty list matches nothing. Global
blockers affect every nonempty ordinary scope query. Targeted clearing preserves global blockers,
including when the target itself is global.

Guarded controls inherit their provider's scope when an explicit scope is missing or an empty
list. Any nonempty explicit scope overrides inheritance. Core hooks without a provider fall back
to the global blocking store; provider-scoped hooks resolve the nearest provider.

## Zustand adapters

Global and provider-scoped stores publish `blockingSnapshot` through
`@okyrychenko-dev/react-zustand-toolkit`. The adapter does not own blocker transition rules.
Lifecycle actions and synchronous reads follow the same behavior in both forms. External Zustand
writes cannot replace the lifecycle projection.

```tsx
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

const { addBlocker, getBlockingInfo, observeBlockingEvents } = uiBlockingStoreApi.getState();
const release = observeBlockingEvents(({ action, blockerId }) => {
  console.log(action, blockerId);
});
addBlocker('save', { scope: 'form', reason: 'Saving' });
console.log(getBlockingInfo('form'));
release();
```

## Observation session

Each blocking store has one permanently associated Devtools Observation session. Panels and
providers acquire participation leases and share one automatic observer, history and Devtools store.
The first active configured participant owns configuration; conflicts warn in development.
Ownership transfers to the earliest remaining configured participant when the owner releases.
Transfer does not apply candidate values until the successor's next explicit configuration update.
Final release detaches observation before resetting history and runtime viewing state. Idempotent
or stale releases cannot affect later participants.

Lifecycle observations are additive. Automatic session cleanup never releases independently
owned observations. Avoid adding a manual global-history writer alongside an automatic panel
when both would write the same event to the same history.

## TanStack coordination

Query, infinite-query, mutation and multi-query hooks adapt their distinct TanStack states to one
coordination module. It owns store selection, per-instance blocker identity, loading/fetching/error
policy, reason precedence, timeout configuration and cleanup. Loading reasons precede fetching
reasons, then error reasons, followed by the configured/default reason. Identity changes,
unmount and Strict Mode release only the calling instance's blocker. Public result typing is retained.

## Guarded controls

Action, button, field, group and link hooks share blocker observation, existing-state merging and
accessible reason interpretation. Public state mapping callbacks receive resolved control states.
Description/helper-text modes require a nonblank reason ID only when a blocked reason is displayed.
Link activation prevention, optional propagation stopping and configurable tab order remain in the
link adapter. Public state resolver utilities remain available.

## Migration

Mutable maps, named registration, direct event dispatch and compatibility `restore()` were removed
after callers migrated to snapshots and ownership leases. Select `blockingSnapshot` or use scoped
reads instead of map inspection. Use lifecycle actions instead of map replacement. Acquire and
release observations instead of naming them. Only actual lifecycle transitions produce events.

## Verification

Lifecycle and scope tests cover domain behavior. Observation session tests use real in-memory
stores to verify history, ownership and teardown. Shared TanStack and guarded-control behavior is
covered at their interpretation interfaces, with adapter tests for distinct runtime and interaction
behavior. Thin Zustand tests verify publication and isolation through the retained toolkit.
