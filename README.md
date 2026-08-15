# react-action-guard

[![CI](https://github.com/okyrychenko-dev/react-action-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/okyrychenko-dev/react-action-guard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Coordinate shared UI interaction locks across complex React forms and workflows: duplicate-submit
protection, conflicting actions, and navigation-sensitive state, all resolved through shared scopes
with automatic lifecycle cleanup.

This is a pnpm workspace monorepo. Each package below still ships and versions independently on npm.

## Packages

| Package                                                                | Version                                                                                                                                          | Description                                                                    |
| ----------------------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------------------------------------------------- |
| [`@okyrychenko-dev/react-action-guard`](packages/core)                | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)               | Core: UI blocking with priorities, scopes, and automatic cleanup             |
| [`@okyrychenko-dev/react-action-guard-ui`](packages/ui)               | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)         | UI-agnostic guarded control primitives (buttons, links, fields, groups)      |
| [`@okyrychenko-dev/react-action-guard-tanstack`](packages/tanstack)   | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack) | TanStack Query integration: automatic blocking during queries/mutations      |
| [`@okyrychenko-dev/react-action-guard-router`](packages/router)       | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-router.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-router)   | Navigation blocking for React Router, TanStack Router, and Next.js           |
| [`@okyrychenko-dev/react-action-guard-devtools`](packages/devtools)   | [![npm](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-devtools.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools) | Visualization and debugging of blocking state                               |

See each package's own README for installation and usage. Full docs: [react-action-guard-docs](https://github.com/okyrychenko-dev/react-action-guard-docs).

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

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for independent per-package
versioning. Run `pnpm changeset` in a PR that changes a package's public behavior, describe the
change, and pick a bump type. Merging the PR opens (or updates) a "Version Packages" PR with the
version bumps and changelog entries applied; merging *that* PR publishes the affected packages to
npm.

## License

MIT © [Oleksii Kyrychenko](https://github.com/okyrychenko-dev)
