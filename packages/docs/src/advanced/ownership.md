# Providers, typed hooks and custom lifecycle ownership

## Multiple providers

A provider creates one isolated store. Hooks resolve the nearest ancestor provider, then the global
fallback. A hook called in the component returning a provider cannot see that returned provider;
move it into a descendant. Sibling providers are independent, and a nested provider replaces the
outer store for its descendants. Scopes do not bridge stores.

```tsx
import type { ReactNode } from "react";
import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";

export function IndependentEditors({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <>
      <UIBlockingProvider>{left}</UIBlockingProvider>
      <UIBlockingProvider>{right}</UIBlockingProvider>
    </>
  );
}
```

The public provider accepts `children` and initial `middlewares`. It does not accept `store`,
`onStoreCreate`, store-restoration or Devtools naming props. To perform imperative work in a
provider, resolve its store in a descendant and use supported actions. Global `uiBlockingStoreApi`
and `useUIBlockingStore` always address the global store, even inside a provider.

## Typed hooks

```tsx
import { createTypedHooks } from "@okyrychenko-dev/react-action-guard";

type EditorScope = "global" | "editor" | "navigation";
const { useActionBlocker, useIsBlocked } = createTypedHooks<EditorScope>();

export function EditorGuard({ pending }: { pending: boolean }) {
  useActionBlocker("editor-save", { scope: ["editor", "navigation"], reason: "Saving" }, pending);
  const blocked = useIsBlocked("editor");
  return <input aria-label="Title" disabled={blocked} />;
}
```

Create this typed facade once in an application module and import it where needed. It constrains
scope spelling at compile time; it does not create a store, allocate IDs or change matching.
The facade covers action blockers, async actions and availability/metadata observation. Specialized
conditional/scheduled/confirmable hooks remain their existing separate API.

## Custom ownership without a provider injection API

For custom imperative integration, the public `createBlockingLifecycle` creates an independent
lifecycle. The application owns its instance, observers and registration cleanup. This is distinct
from a `UIBlockingProvider` store and does not cause built-in React hooks to observe it.

```ts
import { createBlockingLifecycle } from "@okyrychenko-dev/react-action-guard";

export function createEditorProtection() {
  const lifecycle = createBlockingLifecycle();
  const release = lifecycle.observe((event) => {
    console.info(event.action);
  });
  lifecycle.add("editor-load", { scope: "editor", reason: "Loading editor" });
  return {
    lifecycle,
    dispose: () => {
      release();
      lifecycle.clear();
    },
  };
}
```

The exported `UIBlockingStore` type describes the Zustand adapter surface; it is not a public
custom-store factory. Do not import private store creators or inject an arbitrary store into the
provider. Consumers needing custom React store wiring own that integration; there is no supported
application guard-instance factory or standalone headless entry proposed as part of this contract.
See [SSR](./ssr), [observation leases](./observability) and the [contract](../packages/react-action-guard/contract).
