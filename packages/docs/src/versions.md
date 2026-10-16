# Versions and migration

## Current source documentation

This site and its [interactive example](/onboarding) document the workspace source used for the
site build. The demo's linked provenance records its exact Git revision, working-tree differences
and Core manifest version. A source manifest version does not prove that these changes are in npm.

## Planned stable cohort

The current release handoff plans Core **2.0.0**, UI **1.0.0**, Devtools **1.0.0**, Query **0.4.0**
and Router **1.0.0**. These are planned tarball versions, not verified registry availability.
Read the [release handoff](https://github.com/okyrychenko-dev/react-action-guard/blob/main/RELEASE-HANDOFF.md)
for candidate evidence and release prerequisites.

## Published releases

No registry cohort was verified as part of this documentation build. Review the
[published Core versions](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard?activeTab=versions)
and each adapter's peer requirements before installing. There is no archived documentation selector
for a registry cohort yet; this navigation distinguishes current source from planned and published
artifacts rather than presenting source docs as a released version.

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
