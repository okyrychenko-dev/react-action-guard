# @okyrychenko-dev/react-action-guard

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A save can affect an editor and a navigation control owned by different components.
Core lets the operation publish scopes and reasons, so both consumers react without receiving
its pending state as props. Unrelated controls remain available.

For one local loading button, React state or mutation observation is usually sufficient.
Use shared scopes when independent features need a common availability policy. React Context
can also coordinate a small workflow; this library supplies blocker registration, scope matching,
ordered reasons and lifecycle cleanup rather than requiring you to build that model yourself.

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard zustand
# or
yarn add @okyrychenko-dev/react-action-guard zustand
# or
pnpm add @okyrychenko-dev/react-action-guard zustand
```

This package requires the following peer dependencies:

- [React](https://react.dev/) ^18.0.0 || ^19.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) ^5.0.0 - State management library

## Quick Start

One producer, two independent consumers, one real Provider. Paste this into a React application's
`App.tsx`; the simulated save takes 1.2 seconds:

```tsx
import {
  UIBlockingProvider,
  useAsyncAction,
  useBlockingInfo,
  useIsBlocked,
} from "@okyrychenko-dev/react-action-guard";
import { useState, type ReactElement } from "react";

function SaveButton(): ReactElement {
  const runSave = useAsyncAction("save-profile", ["profile", "navigation"]);
  const blocked = useIsBlocked("profile");
  const [status, setStatus] = useState("Ready");

  async function save(): Promise<void> {
    try {
      await runSave(() => new Promise<void>((resolve) => setTimeout(resolve, 1200)));
      setStatus("Saved");
    } catch {
      setStatus("Save failed; try again");
    }
  }

  return (
    <>
      <button
        disabled={blocked}
        onClick={() => {
          void save();
        }}
      >
        Save profile
      </button>
      <p role="status">{status}</p>
    </>
  );
}

function ProfileEditor(): ReactElement {
  const blockers = useBlockingInfo("profile");

  return (
    <>
      <label>
        Display name <input disabled={blockers.length > 0} />
      </label>
      <p role="status">{blockers[0]?.reason ?? "Editing available"}</p>
    </>
  );
}

function NavigationControl(): ReactElement {
  const blockers = useBlockingInfo("navigation");
  const [page, setPage] = useState("Profile");

  return (
    <>
      <button disabled={blockers.length > 0} onClick={() => setPage("Dashboard")}>
        Open dashboard
      </button>
      <p role="status">{blockers[0]?.reason ?? "Navigation available"}</p>
      <p>{page}</p>
    </>
  );
}

export default function App(): ReactElement {
  return (
    <UIBlockingProvider>
      <SaveButton />
      <ProfileEditor />
      <NavigationControl />
      <button onClick={() => alert("Help remains available")}>Help</button>
    </UIBlockingProvider>
  );
}
```

The save publishes both explicit scopes. Each consumer reads only its own scope and displays
`Executing save-profile` while protected. Names match literally: `profile.name` does not inherit
`profile`. A `global` blocker affects ordinary scopes; omitted scopes default to `global`.

`useAsyncAction` releases each execution's blocker after success or failure. If its producer
unmounts, pending work stays protected until settlement; unmount does not cancel the operation.
Every call still executes. Applications own repeat-submit exclusion, cancellation and backend
permissions. The navigation control above changes local UI; it does not intercept browser navigation.

Prefer `UIBlockingProvider` for explicit ownership and SSR, using fresh state per request.
Without a Provider, hooks use a shared global fallback that does not isolate server requests.
For existing boolean state, register it with `useActionBlocker` instead.

## Run the complete example

The [core-only example](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination)
adds success/failure, retry, producer detachment and unrelated help. From a repository checkout:

```bash
pnpm install --frozen-lockfile
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter react-action-guard-core-example run dev
```

## Next steps

- [Canonical documentation and local site instructions](https://github.com/okyrychenko-dev/react-action-guard/tree/main/packages/docs): concepts, Provider ownership, examples and API reference.
- [UI controls](https://github.com/okyrychenko-dev/react-action-guard/tree/main/packages/ui): richer control state and accessible reason relationships.
- [Router integration](https://github.com/okyrychenko-dev/react-action-guard/tree/main/packages/router): browser navigation protection with adapter-specific limits.
- [Enterprise showcase and local run instructions](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/enterprise-demo): checkout coordination, isolated sessions and Query integration.

## Core Concepts

- `scope` lets you coordinate blocking across components like `"form"`, `"navigation"`, or `"checkout"`
- `useAsyncAction` is the fastest path for async workflows
- `useActionBlocker` is the lower-level hook when you already have your own boolean state
- `UIBlockingProvider` gives you isolated state instead of the default global store

### Not React Router's `useBlocker`

`useActionBlocker` coordinates shared UI blocking state. It does not intercept browser navigation like React Router's [`useBlocker`](https://reactrouter.com/api/hooks/useBlocker).

The original `useBlocker` export remains available as a deprecated alias for backward compatibility. Prefer `useActionBlocker` in new code, especially when the same application uses React Router.

## Core Use Cases

### Track async actions

Use `useAsyncAction` when related controls should reflect work in flight. It tracks concurrent calls rather than excluding them.

### Coordinate multiple components

Use shared scopes when one component starts work and another component should react by disabling UI or showing blocker details.

### Isolate blocking domains

Recommend `UIBlockingProvider` for production ownership and SSR, with a fresh store for each request, test, or micro-frontend. The global fallback is shared convenience state, not request isolation.

## API Reference

Continue in the [canonical Core reference and recipes](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard/reference.md)
for hook options, specialized helpers, provider/context APIs, store actions, middleware,
typed scopes, cancellation/exclusion and advanced workflow examples. All detailed material
previously expanded here is retained there.

Production applications should use `UIBlockingProvider` for explicit ownership. Global fallback
is shared convenience state and does not isolate SSR requests. Tracking does not prevent
concurrent work or cancel operations; applications own exclusion and idempotency.

## Development

This package lives in the [react-action-guard monorepo](https://github.com/okyrychenko-dev/react-action-guard)
(pnpm workspaces). From the monorepo root:

```bash
# Install dependencies for all packages
pnpm install

# Run this package's scripts with --filter
pnpm --filter @okyrychenko-dev/react-action-guard run test:run
pnpm --filter @okyrychenko-dev/react-action-guard run test:coverage
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter @okyrychenko-dev/react-action-guard run typecheck
pnpm --filter @okyrychenko-dev/react-action-guard run lint
pnpm --filter @okyrychenko-dev/react-action-guard run lint:fix
pnpm --filter @okyrychenko-dev/react-action-guard run format
pnpm --filter @okyrychenko-dev/react-action-guard run dev

# Or cd into the package and run scripts directly
cd packages/core
pnpm run test:run
```

## Contributing

Contributions are welcome! Please ensure, before opening a PR:

1. All tests pass (`pnpm run test`)
2. Code is properly typed (`pnpm run typecheck`)
3. Linting passes (`pnpm run lint`)
4. Code is formatted (`pnpm run format`)
5. If the change affects this package's public behavior, add a changeset: `pnpm changeset`
   (see the [Releasing](https://github.com/okyrychenko-dev/react-action-guard#releasing) section
   of the monorepo README)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT © Oleksii Kyrychenko

## Canonical guides and stabilized Core

Follow [concepts](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/concepts.md),
[workflow guides](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/guides/workflows.md),
[UI integration](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard-ui/index.md),
[Router integrations](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard-router/index.md),
and [advanced ownership](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/advanced/ownership.md).
The [Core contract](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard/contract.md)
and [migration guide](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard/migration.md)
describe current source and planned stabilization, rather than asserting registry publication.
