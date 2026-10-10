# Queries and mutation lifetimes

The `react-action-guard-tanstack` package integrates **TanStack Query**. TanStack Router is a
separate [router entry](../packages/react-action-guard-router/tanstack-router).
Install the Query adapter and TanStack Query, and render hooks below both `QueryClientProvider`
and `UIBlockingProvider`. The adapters preserve native result shapes and inference.

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
