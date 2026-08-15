# Changesets

Run `pnpm changeset` to describe a change before merging a PR. Each package keeps
its own independent version; `updateInternalDependencies: "patch"` bumps a
dependent package's `peerDependencies`/`dependencies` range whenever a
workspace package it depends on is released.

See https://github.com/changesets/changesets for usage.
