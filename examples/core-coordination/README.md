# One save, two independent consumers

A small React application using **only core** from the React Action Guard ecosystem, alongside
React, React DOM and the Zustand peer. No Query, UI, Router or Devtools adapter is installed.
It consumes the workspace core package through its public entry point and built output.

## Run from this checkout

From the repository root, using the repository's Node and pnpm prerequisites:

```bash
pnpm install --frozen-lockfile
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter react-action-guard-core-example run dev
```

Open the local URL printed by Vite. For a production build and preview:

```bash
pnpm --filter react-action-guard-core-example run build
pnpm --filter react-action-guard-core-example run preview
```

To use core in an existing React 18/19 project instead:

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

See the [Provider-first quickstart](../../packages/core/README.md#quick-start) for a copyable app.
This checkout uses `workspace:*` to verify current source, rather than a published-version claim.

## Try the workflow

1. Click **Save profile**. The producer publishes `profile` and `navigation` scopes for 1.2 seconds.
2. The independent **Profile editor** and **Navigation** sections disable their controls and show
   `Executing save-profile`. **Show help** remains usable because it observes `help`.
3. After success, both consumers become available and their reasons clear.
4. Enable **Simulate save failure**, then save. Protection clears after rejection and an error
   appears. Disable failure and retry to recover.
5. Start a save, then turn off **Show save controls**. The producer unmounts, but protection stays
   until its promise settles. Showing the controls again mounts a fresh producer.

```text
UIBlockingProvider
├── SavePanel: useAsyncAction("save-profile", ["profile", "navigation"])
├── ProfileEditor: useBlockingInfo("profile")
├── NavigationControl: useBlockingInfo("navigation")
└── HelpControl: useIsBlocked("help")
```

Consumers receive no save-state props. The Provider supplies one isolated blocking store;
the simulated operation owns its success/failure outcome. Names match explicitly: `profile.name`
does not inherit `profile`. A `global` blocker would affect all these ordinary scope observations.

The input illustrates availability; the save is a simulation and does not persist its value.
The navigation button changes local display state. Core does not intercept browser navigation.
`useAsyncAction` tracks every call and releases its blocker in `finally`, including after producer
unmount. It does not exclude concurrent executions or cancel work. Application/backend code owns
repeat-submit exclusion, cancellation, permissions and idempotency.

## Choose the simplest state model that fits

| Approach             | Before / after comparison                                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local state          | A save button's own `pending` is enough. Sharing it with unrelated controls requires passing or lifting state.                                                                           |
| React Context        | A context can expose `pending` to this whole small workflow. You own how multiple operations, reasons and cleanup compose.                                                               |
| Mutation observation | Query tools provide native request state. Use it directly when that state answers the availability question; broader policy may combine calls and non-network conditions.                |
| Shared coordination  | The producer declares affected scopes once; independent controls observe availability and reasons. Multiple producers can protect the same scope until the last matching blocker leaves. |

For one loading button, choose local state or mutation state. Shared coordination becomes useful
when independent features need consistent interaction rules; it adds no server execution guarantee.

## Verify

Both test commands resolve core's public source entry through a test-only alias, so each works
without existing build output. Typechecking builds core first and checks its public declarations.
Lint and the example build use that built output; Vite's application build does not use the test alias:

```bash
pnpm --filter react-action-guard-core-example run typecheck
pnpm --filter react-action-guard-core-example run test:run
pnpm --filter react-action-guard-core-example run lint
pnpm --filter react-action-guard-core-example run build
```

Tests exercise visible controls and reasons through a real Provider, covering success, failure,
retry and detached-producer settlement. No internal store maps or mocked coordination hooks are used.

## Continue

- [Canonical documentation and local site instructions](../../packages/docs/README.md)
- [Core hook reference](../../packages/core/README.md#api-reference)
- [Enterprise showcase and run instructions](../enterprise-demo/README.md)
- [Router capabilities](../../packages/router/README.md#adapter-capabilities) for browser navigation
