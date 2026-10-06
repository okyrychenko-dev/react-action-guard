# Efficiency measurements (local tickets 15 and 16)

Run from the repository root, with Node 22+, pnpm, npm and registry access:

```sh
pnpm run build
pnpm run measure:efficiency /tmp/guard-efficiency-new-run
```

Use a new or empty output directory. Without an argument, evidence is retained in a fresh `/tmp/action-guard-efficiency-*` directory. The runner prints the separate disposable consumer directory. It never edits source manifests or removes dependencies. It reuses the existing packed-cohort helper to apply pending Changesets in a disposable workspace and install actual Core/UI tarballs with strict peer resolution. The measured cohort is the planned release, not the versions currently published on npm.

The output contains production and development JSON with every raw timing and render count, bundle raw/gzip sizes, six esbuild attribution metafiles and the consumer lock. `bundles.json` is written last, after all checks pass. Keep the raw reports and lock with any conclusions; rerun after changes to package artifacts, peers or workloads. Existing output is rejected to avoid mixing successful old evidence with a failed run.

The fixtures invoke supported public hooks, providers, lifecycle/store transitions and dependency guards. The existing packed provider suite checks nested/adjacent/independent roots, cleanup, SSR request isolation and hydration. The strict TypeScript fixture checks nonempty-array indexing, optional/unknown narrowing, assertion narrowing and middleware-preserving selector subscription types. A runtime toolkit probe checks selector subscription behavior and release.

Each workload uses 5 warmups and 20 measured samples. `performance.now()` measures wall time; validation, setup/reset and teardown are excluded, except fresh-root mount itself. Production React has no Strict Mode wrapper; the separately reported development run uses Strict Mode. React commits use `flushSync`. These are Happy DOM measurements on Node, not native browser layout, paint, input latency or a cross-machine performance guarantee. The p95 is the nineteenth sorted sample; use repeated runs for a decision, not tiny differences between noisy values.

Three workloads seed 10, 100 and 500 concurrent blockers, split between checkout and inventory, plus one high-priority blocker in each scope. They mount 20, 100 and 200 consumers **per kind** (boolean, scoped metadata, guarded button): 60, 300 and 600 components in total. Observer counts are 0, 5 and 5. Observers are public lifecycle/store observation leases; the Devtools panel is not mounted. Workloads intentionally stress metadata consumers observing the same scope; applications with sparse consumers may differ substantially.

Measurements separate lifecycle update plus immutable snapshot publication, cached snapshot retrieval (1000 reads/sample), scoped filtering plus sorting (100 reads/sample), fresh provider/control mount, related/unrelated reason update plus React commit, and an availability toggle. The toggle uses one blocker, with untimed restoration, rather than pretending to unblock checkout while other checkout blockers remain. Priority, scoped counts, observed availability/reason, observer delivery and cleanup are checked. The transition and React measurements use different boundaries and must not be subtracted to invent exact phase costs.

The minified browser-target ESM consumers invoke `useActionBlocker` and either `useIsBlocked` or `useGuardedButton` under a provider. Core also executes a lifecycle add/remove availability check. SSR smoke invokes these components; it does not claim effects run on the server. Client availability is verified by the benchmark workload. React/DOM are external, Zustand and the two runtime dependencies are included. Esbuild targets ES2022, defines production mode and uses default gzip compression. Metafiles show attribution; gzip contributions are not additive.

The externalized type-utils/toolkit variants are **cost estimates**, not removal implementations: they leave imports to a dependency the consumer must still supply. Their deltas include tree-shaking/minification effects and do not establish equivalent replacement semantics or exact future savings. The guard-only entry exercises six guards rather than checking a symbol's `typeof`. No source alias or workspace link is used in the consumer. The recorded lock's tarball paths identify that run's disposable cohort; reproduce through the runner, not by installing an old `/tmp` lock directly.

Prior art: the sibling `react-modal-manager/scripts/benchmark-lifecycle.mjs` informed warmup/setup separation; its packed checker and this repository's publication runner informed isolation and bundle measurement. No sibling byte claims were copied.

See [the recorded assessment](assessment.md) and [raw evidence](evidence/) for conclusions and limitations.
