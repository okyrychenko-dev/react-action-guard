# Coordinate conflicts without stopping every interaction

Editorial draft. “Something is loading” is rarely the complete interaction policy. A revision
recalculation should prevent changing the input it reads and saving an intermediate revision,
but a read-only help panel can remain available. Write those conflicts down before choosing hooks.

## Start with a conflict matrix

For a proposed revision editor, use explicit labels. Dotted scope names have no implicit hierarchy.

| Producer                                 | Protected scopes                        | Consumers that wait                                  | Remains available                                             |
| ---------------------------------------- | --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| User recalculation                       | `property`, `revision`, `recalculation` | Property field, save revision, another recalculation | Read-only help                                                |
| Agent proposal being applied             | `property`, `revision`, `recalculation` | Same conflicting controls                            | Read-only help and explicit cancellation                      |
| Revision save in the proposed real pilot | `property`, `revision`                  | Editing and another save                             | Help; other controls follow the application's declared policy |

The last row is proposed integration policy. In the existing showcase, **Save revision** only
copies a local revision number; it is not an asynchronous server save. Consumer scope arrays
match if any label overlaps; they are not an “all scopes” requirement. A global blocker affects
ordinary nonempty observations, so keeping help available requires avoiding unrelated global protection.

## Explain the reason through a public observation

This self-contained consumer belongs below the same `UIBlockingProvider` as its producers.
It uses `type-utils` to narrow an optional first blocker and keeps an explicitly empty reason valid.
Install `@okyrychenko-dev/type-utils` alongside core to use this snippet.

```tsx
import { useBlockingInfo } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";

export function RevisionAvailability() {
  const blockers = useBlockingInfo("revision");
  const first = blockers[0];
  let reason = "Revision available";
  if (isDefined(first)) {
    const { reason: blockerReason } = first;
    reason = "Revision temporarily unavailable";
    if (isDefined(blockerReason)) {
      reason = blockerReason;
    }
  }
  return <p role="status">{reason}</p>;
}
```

Priority orders matching metadata; it does not allow an interaction while a lower-priority
matching blocker remains. Removing the highest-priority blocker can change the displayed
reason without making the control available. Use `useIsBlocked` for availability alone or the
[UI guarded hooks](../packages/react-action-guard-ui/reference) for control state.

## Keep execution ownership explicit

Disabling a rendered button helps communicate policy. Every programmatic entry still needs
application-owned permission and repeat-start checks. A blocker is not an atomic execution
lock, does not cancel requests, and does not validate a server revision. Choose a synchronous
application gate for repeated starts and server-side revision/idempotency checks for writes.
A timeout releases interaction protection without cancelling the underlying work.

For one component, local state can express this matrix. Context can carry a composed workflow
policy. Native mutation observation can supply request pending state. Scopes become useful when
multiple independently owned producers and consumers share conflicts and explanations; they
introduce a naming and lifetime contract in return.

## Reproduce the visible behavior

Follow the [enterprise showcase instructions](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/enterprise-demo)
and open Checkout's **User and agent coordination** section. Start an agent edit, try help,
then complete, fail or cancel it. Property editing, saving and recalculation wait together;
help remains available. Complete applies the local proposal, while failure/cancellation leaves
it unchanged. Open Devtools to inspect declared actions and current protection.

These are local simulations. See the [case study](./revision-case-study) for reproducible checks
and the limits of the evidence, and [navigation guidance](../guides/navigation) before claiming
that a revision scope intercepts navigation.
