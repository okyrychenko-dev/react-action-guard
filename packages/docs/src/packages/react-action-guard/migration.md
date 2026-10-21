# Migrate to the stabilized architecture

Core **2.0.0** is published. The compatible cohort verified against npm on
**2026-10-21** is Core **2.0.0**, UI **1.0.0**, Devtools **1.0.0**, Query adapter
**0.4.0** and Router **1.0.0**. See the
[release handoff](https://github.com/okyrychenko-dev/react-action-guard/blob/main/RELEASE-HANDOFF.md)
and [registry evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/registry-evidence.json)
for exact peers, artifact integrity and installed-consumer checks. Those checks cover
one dependency set; published source provenance and browser behavior were not verified
by the registry inspection. Review the
[capability matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md)
for the scope of historical runtime evidence and remaining limitations.

This site follows current source and can include unreleased behavior despite matching
manifest versions. Per-invocation `useAsyncAction` result inference,
`UseAsyncActionReturn`, and async `reason`/`priority` options are pending release;
they are absent from published Core 2.0.0. With that release, use an explicit result
generic and the existing timeout options. Use the installed README and declarations
for the published API; pending Changesets describe future releases. Router warning
and packaged README corrections are also pending release.

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

## Corrected finite timeouts and scheduled windows

These migration contracts describe the stabilized Core 2.0 API. Core 2.0.0 is
published; the historical source and disposable-artifact tests linked in the
capability matrix retain their recorded scope and do not establish published source
provenance. The pending async additions listed above are separate from these contracts.

Lifecycle timeouts omitted, zero or finite negative values intentionally install no
timer. Positive finite timeouts use bounded native timer chunks, including delays
above 2,147,483,647 ms. NaN, infinity and unrepresentable deadlines throw RangeError
before registration, replacement or update changes state. Validate dynamic timeout
inputs before calling the lifecycle API; an invalid update preserves existing protection.

Schedules use half-open `[start, end)` windows. Omit both duration and end for an
indefinite window. Replace `duration: 0` with omitted bounds if indefinite protection
was intended: zero duration and equal bounds now mean empty windows without notifications.
All supplied bounds are validated even when duration takes precedence over end.
Invalid dates, negative/nonfinite durations, reversed bounds and overflowing calculated
ends cancel hook-owned work and warn in development without synthesizing completion.
Epoch-zero dates are real bounds. Distant start/end deadlines use bounded timer chunks;
a window already elapsed when its start callback runs never activates. Empty
reconfiguration also releases only hook-owned protection without completion. Keep
registration IDs unique among owners in the same store.

Keep stable Router predicates pure: they run on each render. Mutating a ref alone
still does not trigger a render or refresh navigation protection. Diagnostics retain
original registration lifetimes through scope updates and finalize actual bulk removal.
