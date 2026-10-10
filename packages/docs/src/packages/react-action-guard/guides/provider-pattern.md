# Provider pattern

`UIBlockingProvider` creates an isolated blocking store for its descendants. Production applications,
SSR trees, tests and independent editors should use explicit ownership. Hooks outside a provider
fall back to shared global state; strict context hooks instead throw when no provider exists.

```tsx
import type { ReactNode } from "react";
import { UIBlockingProvider, useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";

function ReleaseEditor() {
  const store = useUIBlockingContext();
  function release() {
    const { clearBlockersForScope } = store.getState();
    clearBlockersForScope("editor");
  }
  return <button onClick={release}>Release editor protection</button>;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  return (
    <UIBlockingProvider>
      {children}
      <ReleaseEditor />
    </UIBlockingProvider>
  );
}
```

Clearing protection does not cancel application work. Global blockers survive targeted scope clearing.

## Supported props and hooks

The provider accepts `children` and initial `middlewares`. It has no `store`, `onStoreCreate`,
restoration or Devtools naming prop. Resolve a store in a descendant to use its supported actions;
do not import private store creators or mutate snapshots. Initial middleware configuration belongs
to the provider; acquire explicit leases for dynamic observation.

| Hook                                        | Resolution                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `useUIBlockingContext`                      | Nearest provider API; throws outside provider                                         |
| `useOptionalUIBlockingContext`              | Nearest provider API or null                                                          |
| `useIsInsideUIBlockingProvider`             | Provider presence                                                                     |
| `useUIBlockingStoreFromContext`             | Reactive provider state, optional selector/equality function; throws outside provider |
| `useResolvedStoreApi` / `useResolvedValue`  | Provider first, global fallback                                                       |
| `uiBlockingStoreApi` / `useUIBlockingStore` | Always global                                                                         |

A hook in the component returning a provider resolves its ancestors, not the provider it returns.
Sibling providers are independent and a nested provider replaces the outer store for descendants.
IDs may repeat between independent stores; they must remain unique among active producers in one store.

Continue with [multiple providers and typed hooks](/advanced/ownership), [SSR and hydration](/advanced/ssr),
[observation leases](/advanced/observability), [Core contract](../contract) and [migration](../migration).
