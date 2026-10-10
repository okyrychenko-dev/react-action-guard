# Migrate to the stabilized architecture

This guide describes current source and the planned Core 2.0 contract; it does not assert registry
publication. Review the [capability matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md),
package manifests and pending Changesets, then install a mutually compatible published cohort.
Do not assume the current workspace can be installed using an unpublished version number.

## Supported names and ownership

Replace deprecated `useBlocker` imports with `useActionBlocker`; the alias is still supported.
Replace `useOptionalContext`, `useResolvedStore` and `useResolvedStoreWithSelector` with
`useOptionalUIBlockingContext`, `useResolvedStoreApi` and `useResolvedValue` respectively.
These names preserve provider-first resolution where applicable. Direct global store APIs remain
global; wrapping a caller in a provider does not redirect `uiBlockingStoreApi`.

```tsx
import {
  UIBlockingProvider,
  useActionBlocker,
  useResolvedStoreApi,
} from "@okyrychenko-dev/react-action-guard";

function Editor({ pending }: { pending: boolean }) {
  useActionBlocker("editor-save", { scope: "editor", reason: "Saving" }, pending);
  const store = useResolvedStoreApi();
  function clear() {
    const { removeBlocker } = store.getState();
    removeBlocker("editor-save");
  }
  return <button onClick={clear}>Explicitly release protection</button>;
}

export function App({ pending }: { pending: boolean }) {
  return (
    <UIBlockingProvider>
      <Editor pending={pending} />
    </UIBlockingProvider>
  );
}
```

Explicit removal releases protection, not the underlying save. Use distinct IDs for independently
mounted producers; a duplicate warning is not a collision remedy. Use a provider per independent
workflow/request and keep producer and consumers in the same store when they coordinate.

## Replace mutable maps and named middleware

| Previous architecture interface                                         | Current replacement                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `activeBlockers` / mutable map writes                                   | `blockingSnapshot`, `getBlockingInfo`, supported lifecycle actions |
| `StoredBlocker`                                                         | Readonly `BlockerInfo`                                             |
| Core `ShallowStoreBindings`                                             | Toolkit's public binding type                                      |
| `registerMiddleware` / `unregisterMiddleware` / `middlewares` store map | Independent `observeBlockingEvents` lease and its release          |
| `runMiddlewares`                                                        | Perform lifecycle actions; observe their actual events             |
| `BlockingObservationOptions` / lifecycle `restore()`                    | Supported observation methods / registrations from current state   |
| Devtools `DEVTOOLS_MIDDLEWARE_NAME`                                     | Observation session or independent manual lease                    |

Provider `middlewares` and `configureMiddleware` remain supported: the former initializes local
observations, the latter replaces only its own global leases. Do not restore serialized snapshots
as active ownership. Readonly projections and their nested scope arrays cannot be mutated.

```tsx
import { useEffect } from "react";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";

export function TransitionLog() {
  const store = useUIBlockingContext();
  useEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents((event) => {
      console.info(event.action, event.blockerId);
    });
  }, [store]);
  return null;
}
```

Observers cannot veto a transition. Publication precedes event delivery and observer failures do not
break other transitions/observers. Bind Devtools explicitly to this provider store; avoid combining
manual history middleware with automatic recording for the same history.

## Updated registration and mutation behavior

Conditional/scheduled/query hooks share current registration interpretation. Scope/reason/priority
changes update active protection; omitted options clear previous values. Timeout callbacks use current
configuration. Conditional timeout waits for a new false-to-true episode; scheduled timeout retains
the original schedule-end callback time. Follow [lifecycle examples](../../guides/lifecycle).

A mutation's native `isPending` describes its latest observed call, while shared protection covers
all owned unsettled calls. Observe shared scopes for cross-feature availability rather than treating
the latest result as all-work accounting. Keep native `mutate`/`mutateAsync` return and callback
semantics. Reset, key changes and unmount retain pending protection; timeout ends the episode without
cancelling work. See the [mutation example and complete policy](../../guides/mutations).

Existing helpers remain supported. No automatic-ID, guard-factory or telemetry-package migration is
introduced. Run application typechecking and consumer tests for provider isolation, overlapping work,
timeouts, reasons and failure cleanup. Consult the [contract](./contract) and
[architecture migration record](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/MIGRATION.md)
for the preserved architecture details.
