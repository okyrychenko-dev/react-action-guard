# Versions and migration

## Current source documentation

This site and its [interactive example](/onboarding) document the workspace source used for the
site build. The demo's linked provenance records its exact Git revision, working-tree differences
and Core manifest version. A source manifest version does not prove that these changes are in npm.

## Published cohort

The stable cohort was verified against npm on **2026-10-21**. See the
[release handoff](https://github.com/okyrychenko-dev/react-action-guard/blob/main/RELEASE-HANDOFF.md)
for its version table and the
[registry verification record](https://github.com/okyrychenko-dev/react-action-guard/blob/main/scripts/compatibility/registry-evidence.json)
for exact versions, peers, artifact integrity and installed ESM/CJS/type checks.
These checks cover one selected dependency set; provenance signatures, live CI and
browser behavior were not verified by that inspection.

Use the README and declarations shipped with the installed release. There is no
archived documentation selector for a registry cohort yet; this site documents
current source, which can contain unreleased changes even when its manifest
version equals a published version.

## Pending source changes

The current source adds per-invocation `useAsyncAction` result inference,
`UseAsyncActionReturn`, and configurable `reason`/`priority`. These additions are
not in the inspected published Core 2.0.0 declarations. That release supports an
explicit result generic and its existing timeout options. Source Router warning
and packaged README corrections are also pending release.

Pending Changesets describe the next release inputs. The version PR will apply
them and determine the next cohort; a disposable versioned test cohort does not
establish npm publication. Review each installed package's `peerDependencies`
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
