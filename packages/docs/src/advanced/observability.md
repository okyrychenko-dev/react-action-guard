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
time. Avoid secrets in reasons or event payloads. A telemetry extraction or analytics migration is a
separate decision; this guide does not promise a new generic telemetry package or vendor removal.
See [Devtools reference](../packages/react-action-guard-devtools/).
