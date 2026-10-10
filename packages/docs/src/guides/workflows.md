# Coordinate a workflow

Choose scopes around conflicts: a payment can protect checkout editing and navigation while
leaving help available. Share one store where features must coordinate; isolated providers
intentionally do not share protection. Avoid using dotted names as an implicit hierarchy.

```tsx
import { useState } from "react";
import {
  UIBlockingProvider,
  useAsyncAction,
  useIsBlocked,
  useBlockingInfo,
} from "@okyrychenko-dev/react-action-guard";

function Payment({ pay }: { pay: () => Promise<void> }) {
  const execute = useAsyncAction<void>("payment", ["checkout", "navigation"]);
  const blocked = useIsBlocked("checkout");
  const [error, setError] = useState<string>();
  async function submit() {
    setError(undefined);
    try {
      await execute(pay);
    } catch {
      setError("Payment failed. Please check its status before retrying.");
    }
  }
  return (
    <>
      <button disabled={blocked} onClick={submit}>
        Pay
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

function CheckoutEditor() {
  const blocked = useIsBlocked("checkout");
  const reasons = useBlockingInfo("checkout");
  return (
    <>
      <input aria-label="Address" disabled={blocked} />
      <p role="status">{reasons[0]?.reason}</p>
    </>
  );
}

export function Checkout({ pay }: { pay: () => Promise<void> }) {
  return (
    <UIBlockingProvider>
      <Payment pay={pay} />
      <CheckoutEditor />
      <button>Help</button>
    </UIBlockingProvider>
  );
}
```

Each `useAsyncAction` call receives its own registration and releases it in `finally` after success
or rejection. Concurrent calls remain independent, including calls from other hook instances.
Unmount of the caller keeps pending protection in the originating store. A timeout releases that
call's protection without settling work. `UseAsyncActionOptions` supports `timeout` and
`onTimeout`; its reason is generated as `Executing <actionId>`, rather than accepting a custom
reason or priority option. Use a mounted registration or Query adapter when their policies fit.

Local state is sufficient when one component owns both pending state and all affected controls.
Context can share a single workflow value. Native mutation state suits controls observing that
mutation result. Shared scopes help when independent producers and consumers need a common
conflict policy; they add ownership choices and IDs to maintain.

Try the [small runnable example](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination)
and [enterprise demo instructions](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/enterprise-demo).
Add [navigation protection](./navigation) and [diagnostics](../advanced/observability) as needed.
