# Changesets

Every PR that changes a published package must include a changeset. Run
`pnpm changeset` before handoff and verify coverage with
`pnpm exec changeset status --since=main`. Each package keeps its own
independent version. Compatible Core releases preserve adapter patch versions and
existing peer floors through `onlyUpdatePeerDependentsWhenOutOfRange`. Adapter Core
peers use explicit compatibility ranges; `workspace:^` would raise the packed peer
floor on each Core release. A Core release outside those ranges still raises the
adapter major and peer floor, and requires compatibility review. This option is
experimental upstream and may change in a patch release. CI installs the committed
lockfile with `--frozen-lockfile`; release regression tests must pass when updating
Changesets.

After adding or removing package Changesets, run
`node scripts/check-release-state.mjs --write`. The same synchronization runs during
`pnpm version-packages`; `pnpm docs:check` rejects stale source release state.
Dated registry evidence is preserved independently of source versioning.

See https://github.com/changesets/changesets for usage.
