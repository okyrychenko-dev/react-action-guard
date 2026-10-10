# Actions, blockers and scopes

An action is application work: saving an editor, submitting payment or refreshing data.
A blocker is a temporary registration describing interactions that should wait. Consumers
observe scopes rather than importing the producer's pending state. Start with the
[core-only example](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination).

## Matching

Scopes are exact labels. `checkout.payment` does not imply membership in `checkout`.
A producer can register several scopes; any shared label matches an observation.
Omitting a core registration scope means `global`. A global blocker affects every nonempty
ordinary scope observation. Observing `global` does not aggregate all named blockers.
Empty core scope arrays match nothing. Arrays are normalized, sorted and deduplicated.
The UI package separately treats an omitted or empty explicit scope as inherited scope.

```tsx
import { useActionBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

export function PaymentProtection({ pending }: { pending: boolean }) {
  useActionBlocker(
    "payment",
    {
      scope: ["checkout", "navigation"],
      reason: "Submitting payment",
      priority: 80,
    },
    pending
  );
  const blocked = useIsBlocked("checkout");
  return <button disabled={blocked}>Change payment method</button>;
}
```

Render this component below a `UIBlockingProvider`. Unrelated labels stay available unless
another matching or global blocker protects them. `clearBlockersForScope` uses targeted
matching: global blockers are never cleared by a scope target, even `global`. Use
`clearAllBlockers` only when intentionally ending all protection in that store.

## Priority and reasons

Priority orders matching blockers and their reasons; it does not suppress lower-priority
protection. Core defaults to priority 0 and normalizes negative priorities to 0. Removing
the top blocker leaves the scope blocked while another matching registration remains.
`useBlockingInfo(scope)` returns readonly metadata; its first item supplies the top reason.
Use `useIsBlocked` when only availability is needed.

## Ownership and lifetime

| Producer                                    | Protection ends                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `useActionBlocker`                          | Deactivation, unmount, clearing or timeout                                         |
| Conditional / scheduled / confirmable hooks | Their policy ends, unmount, clearing or timeout                                    |
| `useAsyncAction`                            | Each call settles, clearing or timeout; caller unmount retains pending protection  |
| Query hooks                                 | Policy ends, identity change, unmount, clearing or timeout                         |
| Mutation hook                               | All owned covered execution state clears, or timeout; pending work survives detach |

A timeout releases protection without cancelling work or settling its promise. Tracking
concurrent work does not serialize calls. Applications own cancellation, exclusion and server
idempotency. Explicit registration IDs must be unique within a store: duplicate warnings do
not prevent overwrites or another hook's cleanup.

Read [lifecycle and registration](./guides/lifecycle), [workflow design](./guides/workflows)
and the [Core contract](./packages/react-action-guard/contract) next.
