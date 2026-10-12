# Identity, ownership and integration decisions

Manual registration IDs identify one owned lifetime within a store. A scope names the area that
work protects; an operation label describes the work. Repeated editors can share a scope while
using different IDs. Independent Providers may reuse IDs because their stores are isolated.

Two active manual hooks using one ID in one store replace the same registration. Unmounting
either can remove it. Development warnings expose the collision; they do not prevent it. Give
each independent owner a unique ID or isolate its store. For deliberate named imperative control,
let one application owner manage the registration instead of mounting several same-ID hooks.
`useAsyncAction` already allocates separate IDs per concurrent invocation; tracking does not
exclude concurrent execution or cancel work.

```tsx
import { isDefined } from "@okyrychenko-dev/type-utils";
import { useActionBlocker, useBlockingInfo } from "@okyrychenko-dev/react-action-guard";

export function EditorSaveProtection({ ownerId, pending }: { ownerId: string; pending: boolean }) {
  // The application supplies a stable ownerId unique within this store.
  useActionBlocker(`${ownerId}-save`, { scope: "editor", reason: "Saving revision" }, pending);
  const blockers = useBlockingInfo("editor");

  const [first] = blockers;
  let explanation = "Editor available";

  if (isDefined(first)) {
    const { reason } = first;
    explanation = reason ?? "Editor protected";
  }
  return <output aria-label="Editor protection">{explanation}</output>;
}
```

This is a coordination example, not automatic allocation or a unique-ID validator. The reason is
from the first observed blocker; applications needing all explanations should render the collection.
Permission, repeat-execution exclusion, cancellation and backend correctness remain application-owned.

## Current ownership and distribution

Use [Providers and typed hooks](./ownership) for React subtree isolation and scope typing.
The public `createBlockingLifecycle` supplies imperative transitions and observation, independently
of Provider stores. Core still declares React/Zustand peers and exports its root only; that lifecycle
export does not imply a standalone React-free installation. Provider store injection, an application
guard factory and a headless subpath/package remain deferred proposals.

## Decisions and reconsideration

| Proposal                          | Current decision                                              | Reconsideration evidence                                                                                  |
| --------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Automatic manual-hook identity    | Defer; retain explicit IDs and existing diagnostics           | Repeated-owner defects in a real integration, desired named controls and compatible token/label migration |
| Application guard instance        | Defer independently                                           | Recurring imperative ownership wiring outside the React tree and a prototype reducing that wiring         |
| Standalone headless distribution  | Defer independently                                           | Runnable non-React consumer plus demonstrated peer/import/bundle constraints                              |
| New form/data/state adapters      | Defer; assess React Hook Form first when justified            | Repeated workflow pain and measurable benefit over existing composition                                   |
| Commercial or framework expansion | Defer; authorization and workflow execution stay outside Core | Actual consumers, credible demand and explicit security/operating ownership                               |

The repository decisions record options and migration consequences:
[registration identity](https://github.com/okyrychenko-dev/react-action-guard/blob/main/docs/adr/0002-registration-identity.md),
[guard instances and headless distribution](https://github.com/okyrychenko-dev/react-action-guard/blob/main/docs/adr/0003-guard-instance-and-headless-entry.md)
and [ecosystem demand gates](https://github.com/okyrychenko-dev/react-action-guard/blob/main/docs/adr/0004-ecosystem-demand-gates.md).
These links target repository source and become available on main when the changes are merged.

Collect a local consumer report with a reproducible workflow, owners/scopes, current wiring,
cleanup and native-library constraints, before/candidate measurements and an evaluator. Keep
unknown measurements explicit; the [pilot plan](../learning/workflow-pilot) provides a starting
matrix. A future accepted proposal requires its own bounded spec and public verification seam.
The current [Core contract](../packages/react-action-guard/contract), independent package
composition and release verification do not depend on speculative expansion.
