# Registration and the Blocking lifecycle

The Blocking lifecycle owns registration, metadata replacement, immutable projections, ordered
observation and generation-safe timeouts. Hooks add activation policy and React ownership.

## Choose a producer by lifetime

Unmount ends a mounted registration, but application work can keep running. Choose the producer
whose protection lifetime matches that work:

| Producer | Registration owner | After producer unmount | Protection ends |
| --- | --- | --- | --- |
| `useActionBlocker` | Mounted hook with an explicit store-local ID | Registration is removed, even if the application operation continues. | Deactivation, unmount, timeout or explicit clearing. |
| `useAsyncAction` | Each invocation, in the store captured when it starts | Every pending invocation retains its own registration in that store. | That invocation settles, times out or is explicitly cleared. |
| `useConfirmableBlocker` | Mounted hook, active while its dialog is open or callback executes | Registration is removed. An already started `onConfirm` callback may continue; unmount does not cancel it. | Dialog cancellation, callback settlement, unmount, timeout or explicit clearing. |
| Query adapter `useBlockingMutation` | Hook instance's owned execution episode in its originating store | Owned pending calls retain protection. Error-only protection ends on detach. | All covered pending/error state clears, or the episode times out; explicit clearing removes the current registration. |

`useConfirmableBlocker` shares a pending confirmation execution within that hook; this does not
give it the detached execution ownership of `useAsyncAction`. If protection must survive unmount,
select an execution owner deliberately rather than assuming all async helpers retain it.

For mutations, native `mutation.isPending` describes the latest observed result. Native
`useMutation` plus a mounted `useActionBlocker` therefore releases registration on unmount.
The adapter covers every unsettled call started through that hook, including an older call when
a newer result finishes first. Reset and key changes retain pending ownership; reset clears
error-only protection, and detach ends it. See [mutation policy](./mutations#mutation-policy)
for awaited callbacks, timeout episodes and work outside that owner.

Timeout and explicit clearing release protection; they do not cancel application work or settle
its promise. Hook policies can register again according to their own activation rules; clearing is
not cancellation or a permanent opt-out. Tracking overlapping calls does not exclude execution.
Applications own command guards, cancellation and backend idempotency.

Explicit mounted registration IDs must be unique among owners in one store. Duplicate diagnostics
do not prevent one owner from updating or removing another owner's registration. See
[ownership](../advanced/ownership) for repeated instances and Provider isolation.
The [published-version quickstart](../getting-started) uses the released async signature;
[versions and migration](../versions) identifies pending source additions.

## Current registration configuration

`useActionBlocker` uses current committed scope, reason, priority, timestamp, timeout and callback.
Equivalent rerenders and equivalent scope arrays avoid redundant updates. Replacement clears
omitted optional values; imperative `updateBlocker` instead merges a partial configuration.
Unchanged timeout duration keeps the existing deadline; changing duration restarts it and removing
it cancels the timer. Timeout invokes the latest committed callback.

After `useActionBlocker` timeout, an equivalent rerender does not restart protection. A subsequent
configuration change can register again while active. Explicit deactivation then activation starts
a new registration. Query registrations follow that same replacement policy while retaining their
own query activation and reason policy.

## Async execution metadata and result types

This section describes current source. Per-invocation result inference, `UseAsyncActionReturn`
and configurable async reason/priority are absent from the inspected Core 2.0.0 declarations;
see [pending source changes](../versions#pending-source-changes).

Each `useAsyncAction` invocation owns a separate registration and infers its callback result.
Provide a product-facing reason and priority without managing a registration manually:

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";

export function useProfileCommands() {
  const execute = useAsyncAction("profile", ["editor", "navigation"], {
    reason: "Зберігаємо зміни…",
    priority: 30,
  });

  async function save(): Promise<{ id: string }> {
    return execute(async () => ({ id: "profile" }));
  }

  async function count(): Promise<number> {
    return execute(async () => 42);
  }

  return { save, count };
}
```

Omitting reason and priority keeps `Executing ${actionId}` and priority 20; an empty reason
and priority 0 remain valid. Higher priorities order reasons, while every matching blocker
retains protection. Rerenders affect future invocations; running registrations retain their
captured metadata and store until settlement or timeout. Timeout releases protection without
cancelling the operation. Explicit hook result generics remain supported as constraints;
`createTypedHooks` preserves the same per-call inference.

## Conditional and scheduled helpers

```tsx
import { useConditionalBlocker, useScheduledBlocker } from "@okyrychenko-dev/react-action-guard";

export function Maintenance({ busy, startsAt }: { busy: () => boolean; startsAt: number }) {
  useConditionalBlocker("background-maintenance", {
    scope: "editor",
    condition: busy,
    checkInterval: 1000,
    reason: "Background maintenance",
    timeout: 30000,
  });
  useScheduledBlocker("planned-maintenance", {
    scope: "editor",
    schedule: { start: startsAt, duration: 60000 },
    reason: "Planned maintenance",
    timeout: 30000,
  });
  return null;
}
```

A conditional timeout ends the current true-condition episode; continuous true polling and metadata
changes do not re-add it. A false-to-true transition may start another episode. The condition is
checked immediately and periodically; changing interval does not itself redefine a true episode.

A scheduled timeout ends registration without changing the separate schedule end notification.
Metadata changes do not restart its schedule or replay start/end callbacks. Changing schedule
boundaries establishes the new schedule. Duration takes precedence over end when both are supplied.
Invalid or completed schedules do not activate; start-only schedules have no automatic scheduled end.
Both helpers release their registrations and timers on unmount. The confirmable helper remains
supported; see its [reference](../packages/react-action-guard/api/hooks).

## Snapshot and event guarantees

Reads are readonly immutable snapshots, including scope arrays. Retaining a projection does not let
a consumer mutate later lifecycle state. Transitions publish the new snapshot before delivering their
events. Reentrant transitions retain FIFO publication order. Observation leases are additive and safe
to release repeatedly; observer exceptions and rejected promises cannot interrupt other observers or
transitions. Observers describe actual transitions and do not grant cancellation authority.

See [observation ownership](../advanced/observability), [Core contract](../packages/react-action-guard/contract)
and [migration](../packages/react-action-guard/migration).
