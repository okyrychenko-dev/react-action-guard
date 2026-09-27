# Changesets

Every PR that changes a published package must include a changeset. Run
`pnpm changeset` before handoff and verify coverage with
`pnpm exec changeset status --since=main`. Each package keeps its own
independent version; `updateInternalDependencies: "patch"` bumps a
dependent package's `peerDependencies`/`dependencies` range whenever a
workspace package it depends on is released.

See https://github.com/changesets/changesets for usage.
