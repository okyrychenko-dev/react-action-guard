# Queries and mutation lifetimes

The `react-action-guard-tanstack` package integrates **TanStack Query**. TanStack Router is a
separate [router entry](../packages/react-action-guard-router/tanstack-router).
Render coordination hooks below `UIBlockingProvider`; Query hooks also need
`QueryClientProvider`. Both approaches below preserve native mutation variable/result inference.

## Choose native observation or execution coordination

Use native `useMutation` plus Core when protection should follow the **latest observed
mutation while the component is mounted**. This is enough for a single submit flow whose
owner remains mounted. Give each mounted owner a unique registration ID in its blocking store.

```tsx
import { useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import { useMutation } from "@tanstack/react-query";

export function useObservedProfileSave(
  registrationId: string,
  save: (value: string) => Promise<void>
) {
  const mutation = useMutation({ mutationFn: save });
  useActionBlocker(
    registrationId,
    { scope: ["profile", "navigation"], reason: "Saving profile", priority: 30 },
    mutation.isPending
  );
  return mutation;
}
```

Choose `useBlockingMutation` when protection must cover **every unsettled call owned by
that hook**, including after reset, a newer call settling first, or the producer detaching.
The adapter owns a per-instance registration ID and an execution lifetime; native
`mutation.isPending` alone describes the latest observation. Neither approach prevents
repeated submission, cancels work, or supplies backend idempotency.

The following checked example uses the adapter for execution coordination and query policy:

```tsx
import {
  useBlockingMutation,
  useBlockingQuery,
} from "@okyrychenko-dev/react-action-guard-tanstack";

export function useProfileWork(
  load: () => Promise<string>,
  save: (value: string) => Promise<void>
) {
  const profile = useBlockingQuery({
    queryKey: ["profile"],
    queryFn: load,
    blockingConfig: {
      scope: "profile",
      onLoading: true,
      onFetching: false,
      reasonOnLoading: "Loading profile",
    },
  });
  const mutation = useBlockingMutation({
    mutationFn: save,
    blockingConfig: {
      scope: ["profile", "navigation"],
      reasonOnPending: "Saving profile",
    },
  });
  return { profile, mutation };
}
```

## Query policy

Initial **active** requests block by default (`isPending && isFetching`). Disabled queries
without data and offline paused queries do not block just because their status is pending.
Background refetches and infinite pagination are opt-in with `onFetching: true`; errors are
opt-in with `onError: true`. Loading reasons precede fetching reasons, then error reasons,
then the configured/default fallback. Query collections own one registration; an empty
collection does not block. Configuration replacement and unmount cleanup follow
[registration ownership](./lifecycle).

Compare [producer lifetimes](./lifecycle#choose-a-producer-by-lifetime) when choosing mounted
observation or protection that survives detach.

## Mutation policy

One mutation hook protects all unsettled calls started through its `mutate` / `mutateAsync`,
including native retries, offline pauses, scope queues and cache/hook callbacks that TanStack
awaits. If A starts, then B finishes first, the native result can show B's success while shared
protection stays active for A. Equal keys, other hooks, direct cache calls and restored persisted
mutations do not join this owner.

`reset()` resets native observation and clears error-only protection; it retains owned pending
work. Key changes retain pending ownership too. Unmount keeps pending protection in the
originating store, while ending that owner's error-only protection. Hook-level awaited callback
failures keep native rejection behavior. Per-call callbacks retain native latest-call suppression
and detach behavior; their promises are not awaited. Handle `mutateAsync` rejection in the caller;
`mutate` returns void and consumes rejection.

While attached, committed scope/reason/priority/timeout changes update protection. A timeout
bounds one registration episode: additional calls do not restart the deadline; changing timeout
before expiry restarts it, removing timeout cancels it. Metadata changes retain the deadline.
After expiry, rerenders, more calls, configuration changes or pending-to-error transitions do not
revive that episode. Only clearing all pending and eligible error state allows a later episode.
Timeout calls the current callback once, without cancellation or settlement.

See the [complete execution decision](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/docs/adr/0001-mutation-execution-lifetime.md)
and [Query reference](../packages/react-action-guard-tanstack/). Shared protection is an execution
lifetime guarantee; it does not lock or cancel mutations.

## Dependency support and upstream update checks

The adapter declares TanStack Query `^5.90.10`, Core `^2.0.0` and React
`^18.0.0 || ^19.0.0`. The selected packed Query compatibility points are **5.90.10**
and **5.104.1**, with React/DOM **19.2.8**. They do not establish every version in the
peer ranges, nor claim the latest registry release. Other Query versions remain untested
by that selected matrix until their checks run.

The existing differential suite compares native and adapter callbacks, reversed A/B
settlement, latest result selection, reset, detach and error boundaries against the locked
Query version. Native `throwOnError` behavior is retained: a boundary can detach the observer
while older owned work stays protected. Adapter error-only protection ends on detach;
pending protection remains in its originating store. Per-call callbacks retain native
latest-call suppression and are not awaited; awaited cache/hook callbacks remain part of
execution lifetime. These guarantees do not extend to other hooks' calls, direct cache work
or restored persisted mutations.

From the repository root, reproduce the checks before accepting an upstream update:

```bash
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack exec vitest run src/hooks/__tests__/useBlockingMutation.differential.test.tsx
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run typecheck
pnpm run build
pnpm run docs:check
pnpm run test:packed query-floor
pnpm run test:packed query-current
```

For a proposed new Query version, select it explicitly in a disposable dependency-update
branch and the packed compatibility target, then rerun native-versus-adapter differential,
type and packed checks. Inspect any difference in callbacks, errors, reset and detachment
before changing the adapter or its peer range. Record exact resolved versions and new
results in the [compatibility matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/README.md).
A passing historical record does not verify a new upstream version or current source diff.
