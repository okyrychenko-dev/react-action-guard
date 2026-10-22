# Versions and migration

Start with the [published-version installation and first example](/getting-started).
Use this page to distinguish the package you install from the source-built site and demo.

## Current source documentation

This site and its [interactive example](/onboarding) document the workspace source used for the
site build. The demo's linked provenance records its exact Git revision, working-tree differences
and Core manifest version. A source manifest version does not prove that these changes are in npm.

## Published cohort

| Package | Exact inspected version |
| --- | --- |
| Core | [2.0.0](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard/v/2.0.0) |
| UI | [1.0.0](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui/v/1.0.0) |
| Devtools | [1.0.0](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools/v/1.0.0) |
| Query adapter | [0.4.0](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack/v/0.4.0) |
| Router | [1.0.0](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-router/v/1.0.0) |

The stable cohort was verified against npm on **2026-10-21**. See the
[release handoff](https://github.com/okyrychenko-dev/react-action-guard/blob/main/RELEASE-HANDOFF.md)
for its version table and the
[registry verification record](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/registry-evidence.json)
for exact versions, peers, artifact integrity and installed ESM/CJS/type checks.
These checks cover one selected dependency set; provenance signatures, live CI and
browser behavior were not verified by that inspection.

The **first example** and Core README quickstart were separately compiled against downloaded
**Core 2.0.0** on **2026-10-22**, with React/DOM **19.2.8**, Zustand **5.0.15**,
TypeScript **5.9.3**, React types **19.2.18** and React DOM types **19.2.3**. This isolated
consumer uses installed declarations with no workspace links: strict checking, NodeNext module
resolution, ES2022 and `react-jsx`, with **`skipLibCheck: false`**. The registry artifact
depends on type-utils **0.1.2** and Zustand Toolkit **1.0.0**. See the
[quickstart evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/published-quickstart-evidence.json)
and [reproduction commands](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/README.md#published-first-example)
for resolved dependencies and checked snippet hashes. This is compilation evidence for that
selected set, not a new full-cohort, browser or publication verification.

Use the README and declarations shipped with the installed release. There is no
archived documentation selector for a registry cohort yet; this site documents
current source, which can contain unreleased changes even when its manifest
version equals a published version.
The npm version links above identify package artifacts. A matching repository tag or source commit
has not been verified for this cohort; those links do not claim release-to-source provenance.

<!-- release-source-state:start -->

## Source release state

Generated from workspace manifests and remaining Changesets. These are source versions,
not evidence of npm publication. Dated registry evidence remains historical.

| Package | Source manifest version |
| --- | --- |
| Core | 2.0.0 |
| UI | 1.0.0 |
| Devtools | 1.0.0 |
| Query adapter | 0.4.0 |
| Router adapter | 1.0.0 |

7 pending package Changesets remain; the next versioning run may change these versions.

<!-- release-source-state:end -->

## Source changes since the inspected registry cohort

The current source adds per-invocation `useAsyncAction` result inference,
`UseAsyncActionReturn`, and configurable `reason`/`priority`. These additions are
not in the inspected published Core 2.0.0 declarations. That release supports an
explicit result generic and its existing timeout options. Source Router warning
and packaged README corrections are also pending release.

The generated source state above records manifest versions and remaining package
Changesets. Applying versions or testing a disposable cohort does not establish
npm publication. Review each installed package's `peerDependencies`
before adopting its adapters.

## Migration path

- [Core migration](/packages/react-action-guard/migration): supported names, explicit registration
  ownership, Provider isolation and public lifecycle entry points.
- [Lifecycle contracts](/guides/lifecycle): positive finite timeouts, long deadlines and explicit
  scheduled windows. Nonpositive lifecycle timeouts mean no timer; zero schedule duration is empty.
  These are different contracts. Invalid schedule bounds cancel hook-owned work and report a
  development diagnostic.
- [Router capabilities](/packages/react-action-guard-router/): choose the adapter for your actual
  interception needs; Next App Router does not provide universal SPA interception.

Keep unreleased source behavior separate from the capabilities of the package versions you install.
