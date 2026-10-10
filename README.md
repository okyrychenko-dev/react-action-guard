# react-action-guard

[![CI](https://github.com/okyrychenko-dev/react-action-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/okyrychenko-dev/react-action-guard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Saving a profile should temporarily disable its editor and a separate navigation control,
while help remains usable. React Action Guard lets the save operation publish scopes and reasons;
independent components observe them without receiving its loading state as props.

```text
UIBlockingProvider
  SavePanel → save-profile → [profile, navigation]
    ProfileEditor reads profile      → disabled + reason
    NavigationControl reads navigation → disabled + reason
    HelpControl reads help          → available
```

## Try core first

In an existing React 18/19 application, install core and its Zustand peer:

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

No UI, Query, Router or Devtools adapter is needed. Follow the
[Provider-first quickstart](packages/core/README.md#quick-start) or run the
[small executable example](examples/core-coordination/README.md) from this checkout:

```bash
pnpm install --frozen-lockfile
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter react-action-guard-core-example run dev
```

Try success, simulated failure and hiding the save controls during work. The two consumers
show `Executing save-profile` while blocked and recover after settlement. Help remains usable.
The navigation button demonstrates control availability; browser navigation interception requires
a Router adapter.

## When shared coordination helps

| Approach             | Good fit                                                  | What the application still connects                            |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Local pending state  | One operation and its own button                          | Pass state to other controls if they need it.                  |
| React Context        | A shared workflow with a small, explicit state model      | Design the shared state, reasons and lifecycle yourself.       |
| Mutation observation | Availability follows request state                        | Combine relevant executions and non-network rules when needed. |
| Shared scopes        | Independent features need common availability and reasons | Producers declare policy; consumers apply it to controls.      |

Local state or mutation state is enough for a single loading button. Shared scopes are useful
when several independent producers and consumers must agree on availability. Tracking does not
exclude repeated execution, cancel work or enforce backend permissions; applications own those rules.

## Continue learning

- [Core quickstart and hook reference](packages/core/README.md)
- [Canonical documentation: guides and local site instructions](packages/docs/README.md)
- [Enterprise showcase: checkout conflicts and isolated sessions](examples/enterprise-demo/README.md)
- [Versioned capability matrix](CAPABILITIES.md): evaluated peers, evidence and limitations

## Optional packages

This pnpm workspace contains independently versioned npm packages. Add adapters when you need
their integration; start with core for shared coordination.

| Package                                                             | Version                                                                                                                                                             | Description                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`@okyrychenko-dev/react-action-guard`](packages/core)              | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)                   | Core: UI blocking with priorities, scopes, and automatic cleanup        |
| [`@okyrychenko-dev/react-action-guard-ui`](packages/ui)             | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)             | UI-agnostic guarded control primitives (buttons, links, fields, groups) |
| [`@okyrychenko-dev/react-action-guard-tanstack`](packages/tanstack) | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack) | TanStack Query integration: automatic blocking during queries/mutations |
| [`@okyrychenko-dev/react-action-guard-router`](packages/router)     | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-router.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-router)     | Navigation blocking for React Router, TanStack Router, and Next.js      |
| [`@okyrychenko-dev/react-action-guard-devtools`](packages/devtools) | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-devtools.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools) | Visualization and debugging of blocking state                           |

See each package's own README for installation and usage. Full docs: [documentation site source and local build instructions](packages/docs/README.md).

Use `UIBlockingProvider` for production ownership and SSR. Hooks without a provider use a shared global fallback; it does not isolate server requests.

Next.js Pages Router offers limited route-event interception with replay limitations. App Router provides unload-only protection, with no same-document navigation interception. See the [router capability details](packages/router/README.md#nextjs-pages-router). The TanStack package above integrates **TanStack Query**; **TanStack Router** belongs to the Router package.

## Package Dependency Flow

```
react-zustand-toolkit (separate repo, foundation)
  ↓
react-action-guard (packages/core)
  ↓
├─ react-action-guard-ui        (packages/ui)
├─ react-action-guard-tanstack  (packages/tanstack)
├─ react-action-guard-router    (packages/router)
└─ react-action-guard-devtools  (packages/devtools)
```

## Development

```bash
pnpm install       # install all workspace packages
pnpm run build     # build all packages (topological order)
pnpm run test      # run all test suites
pnpm run typecheck
pnpm run lint
pnpm run check     # lint + typecheck + test + build
```

Scope a command to one package with pnpm's `--filter`, e.g. `pnpm --filter @okyrychenko-dev/react-action-guard run test`.

## Enterprise demo

The [enterprise demo](examples/enterprise-demo/README.md) is a regular directory in this
repository. It demonstrates checkout navigation confirmation, isolated sessions,
on-demand queries and application-owned payment cancellation.

It has its own npm dependencies and consumes packed current-source packages. Run it with:

```bash
cd examples/enterprise-demo
npm ci
npm run setup:local
npm run dev
```

See [evaluated workflows](examples/enterprise-demo/WORKFLOWS.md) for verification,
package provenance and browser tests.

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for independent per-package
versioning. Run `pnpm changeset` in a PR that changes a package's public behavior, describe the
change, and pick a bump type. Merging the PR opens (or updates) a "Version Packages" PR with the
version bumps and changelog entries applied; merging _that_ PR publishes the affected packages to
npm.

## License

[MIT](LICENSE) © [Oleksii Kyrychenko](https://github.com/okyrychenko-dev)

## Canonical guides and stabilized Core

Follow [concepts](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/concepts.md),
[workflow guides](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/guides/workflows.md),
[UI integration](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard-ui/index.md),
[Router integrations](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard-router/index.md),
and [advanced ownership](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/advanced/ownership.md).
The [Core contract](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard/contract.md)
and [migration guide](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/docs/src/packages/react-action-guard/migration.md)
describe current source and planned stabilization, rather than asserting registry publication.
