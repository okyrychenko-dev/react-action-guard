# SSR and hydration ownership

Render a fresh `UIBlockingProvider` for each request/application tree. The global fallback is shared
module state and does not isolate requests. Do not use `uiBlockingStoreApi` for request-local state.
Client effects register mounted blockers after commit; server rendering alone does not perform those
registrations. Keep initial rendered UI deterministic across server and client and hydrate within the
same provider layout. Derive any server-rendered disabled state from request-local application data.

For Next App Router, put the provider in a client boundary and render it from the server layout:

```tsx
"use client";
import type { ReactNode } from "react";
import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";

export function Providers({ children }: { children: ReactNode }) {
  return <UIBlockingProvider>{children}</UIBlockingProvider>;
}
```

Import `Providers` in your layout and wrap its children within the body. This makes a client boundary;
it does not add same-document App Router interception. See the [App Router limitations](../packages/react-action-guard-router/next-app).

Do not persist or restore blocker snapshots as live authority: they contain transient ownership and
may describe work no longer running. Re-establish protection from current application state through
supported registrations. Provider `middlewares` are initial observers, not a reactive configuration
channel; use an explicitly released lease for dynamic observation. Test independent requests,
provider adjacency/nesting and hydration through consumer output rather than private store maps.
