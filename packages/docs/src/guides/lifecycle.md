# Registration and the Blocking lifecycle

The Blocking lifecycle owns registration, metadata replacement, immutable projections, ordered
observation and generation-safe timeouts. Hooks add activation policy and React ownership.

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
