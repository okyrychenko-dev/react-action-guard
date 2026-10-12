# When loading flags cross feature boundaries

Editorial draft. A save button starts with a useful boolean: while the save is pending,
show progress and prevent another click. Local state is a good fit when that component owns
both the operation and every affected control. A coordination package adds little to that case.

The design question changes when saving also affects an editor in another feature and a
navigation control. Passing `saving` through a common ancestor still works, but each new
producer asks consumers to understand another operation. A recalculation might affect the same
editor; a background lookup might affect only one selector. Combining every pending flag into
one application-wide boolean would disable unrelated help.

## Choose the state model from the question

| Approach                    | Fits when                                                                                     | Composition you still own                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Local state                 | One owner controls the operation and its UI                                                   | Lifting/passing state when consumers move apart; failure and detach policy                                                         |
| React Context               | A bounded workflow can expose a shared pending value                                          | Combining multiple producers, reasons, identity and cleanup; Context can implement these well                                      |
| Native mutation observation | Controls need the state of a particular mutation or observed mutation set                     | Selecting which executions count and combining non-network conditions; one observed result need not describe every concurrent call |
| Shared scopes               | Independent producers declare conflicts and consumers ask whether an interaction is available | Scope naming, Provider placement, registration ownership and execution policy                                                      |

These are alternative ways to express application requirements, not a reliability ranking.
Request progress and interaction availability can differ: a background query may be fetching
while editing remains allowed. Keep request state for progress and result rendering even when
scopes determine availability.

## Run one save with two consumers

Use the [core-only example](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination).
From the repository root after installing the repository's prerequisites:

```bash
pnpm install --frozen-lockfile
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter react-action-guard-core-example run dev
```

Click **Save profile**. The editor and navigation control display `Executing save-profile`
and become unavailable, while **Show help** stays usable. Enable **Simulate save failure**,
then save and retry. Start another save and hide **Show save controls**: consumers stay
protected until that pending promise settles.

The producer declares `profile` and `navigation` once with `useAsyncAction`. Consumers use
public observation hooks under one Provider; they receive no save-state props. Each call has
its own lifetime, so settling one call does not mean every other call has settled. That is
interaction tracking, not serialization or duplicate-submit exclusion.

## What this example establishes

The existing rendered App tests check availability, visible reasons, success, failure, retry
and detached-producer settlement. They can be repeated with:

```bash
pnpm --filter react-action-guard-core-example run test:run
pnpm --filter react-action-guard-core-example run typecheck
```

The operation is simulated; it does not persist the input, and the navigation button changes
local display state. The example provides no measured reduction in production defects or
browser-navigation interception. To evaluate complexity in an actual application, capture the
[pilot baseline](./workflow-pilot) before changing its state model.

Read [conflicting actions](./conflicting-actions) for scope policy and [mutation guidance](../guides/mutations)
for Query-specific lifetimes.
