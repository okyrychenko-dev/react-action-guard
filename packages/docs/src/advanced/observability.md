# Observe transitions and explain protection

Use `useBlockingInfo` for current reasons. Use event observation for diagnostics about transitions.
An observer is not a policy middleware that can veto actions or cancel work.

```tsx
import { useEffect } from "react";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";

export function Diagnostics() {
  const store = useUIBlockingContext();
  useEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents((event) => {
      console.info(event.action, event.blockerId);
    });
  }, [store]);
  return <ActionGuardDevtools store={store} />;
}
```

Render beneath `UIBlockingProvider`. Devtools does not infer that provider store from nesting:
without an explicit `store`, it observes global state. Panels/providers observing one store share
one Observation session, history and automatic observer. The first configured participant owns
configuration; when it leaves, ownership transfers to the earliest remaining configured participant.
Its candidate values apply on its next explicit update. Final release detaches automatic observation
before resetting session runtime/history; it does not release independently acquired leases.

Every `observeBlockingEvents` call returns an independent idempotent release. Retain and invoke it
on cleanup. `configureMiddleware` replaces only its own global observation leases. Provider
`middlewares` are initial store-local observers. Built-in logger, performance and analytics helpers
remain supported; see [middleware reference](../packages/react-action-guard/api/middleware).
Attaching a manual Devtools history writer alongside automatic recording can duplicate history.

Observer exceptions/rejections are isolated; slow synchronous observer work still costs execution
time. Avoid secrets in reasons or event payloads. New telemetry integrations use application-owned
recipes on this observation boundary. Existing Core analytics helpers remain supported; no new
package, subpath or vendor-export removal is selected.
See [Devtools reference](../packages/react-action-guard-devtools/).

## An application-owned telemetry adapter

Provide a transport callback from your application. This complete hook sends only transition
identity and time; add approved payload fields deliberately rather than forwarding reasons or
callbacks. Render the consumer under `UIBlockingProvider`; React releases its store-local lease
on detach and acquires a new one if the store or transport changes.

```tsx
import { useEffect } from "react";
import { useUIBlockingContext, type BlockingAction } from "@okyrychenko-dev/react-action-guard";

interface TelemetryRecord {
  action: BlockingAction;
  blockerId: string;
  timestamp: number;
}

export function useBlockingTelemetry(send: (record: TelemetryRecord) => void | Promise<void>) {
  const store = useUIBlockingContext();
  useEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents(({ action, blockerId, timestamp }) =>
      send({ action, blockerId, timestamp })
    );
  }, [store, send]);
}
```

The six native events are `add`, `update`, `remove`, `timeout`, `clear`, and `clear_scope`.
An expiration normally produces `timeout` followed by `remove`; count expirations by `timeout`,
not by both events. Clear operations report aggregate counts rather than individual removal
events. A remove is not an attempted action, confirmation, approval or success. Record those
facts at the application boundary where they happen. Lifecycle events do not include source
provenance or a registry of guarded actions.

## Explain known areas and actions

```tsx
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";
import "@okyrychenko-dev/react-action-guard-devtools/styles.css";

export function ProtectionInspector() {
  const store = useUIBlockingContext();
  return (
    <ActionGuardDevtools
      store={store}
      inspection={{
        scopes: ["checkout", "checkout.details", "navigation", "help"],
        actions: [
          { id: "submit-order", scope: "checkout" },
          { id: "leave-checkout", scope: "navigation" },
          { id: "read-help", scope: "help" },
        ],
      }}
    />
  );
}
```

Open **Active Blockers** for the graph and equivalent text table. These panel-local declarations
explain matching; they do not register actions or change policy. Exact names match; dots do not
create parents. Global blockers affect every non-empty observation, including scopes supplied
only by declarations. Empty action scope arrays remain unaffected. Without declarations the
inspector shows scopes from active blockers and honestly reports unknown action mappings and
source provenance. Blocker age is `max(0, now - blocker.timestamp)` in milliseconds, refreshed
every second while visible blockers exist; timestamps may be supplied or updated, so age is not
proof of actual elapsed operation time. Priority orders blockers descending, preserving snapshot
order for ties. No event history is synthesized for pre-existing blockers.
