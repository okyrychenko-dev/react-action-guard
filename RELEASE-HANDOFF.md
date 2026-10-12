# Planned release cohort handoff

This handoff concerns source baseline `001da8a1f9bd7e83656208ae3f4953384137176f`
and the pending Changesets on `chore/30-release-readiness`. It is release preparation,
not a registry publication record or a statement that the Release workflow has run.

## Version provenance

Source package manifests and pending Changesets remain unchanged by verification.
The existing [cohort preparation](scripts/compatibility/cohort.utils.mjs) copies
built artifacts, applies `changeset version` in a disposable workspace and packs
that resulting cohort. Package checks and fresh consumers inspect those tarballs,
not source aliases. Strict peer installation checks the rewritten internal Core
peer ranges together with the selected external peers.

The planned cohort is Core **2.0.0**, UI **1.0.0**, Devtools **1.0.0**, Query adapter
**0.4.0**, and Router adapter **1.0.0**. These version numbers describe the planned
tarballs only. No npm registry version or dist-tag has been inspected or changed
by this task. Registry availability must be established after authorized publication.

Source manifests currently declare Core 1.0.5, UI 0.1.5, Devtools 0.3.0,
Query 0.3.5 and Router 0.2.4. These are workspace metadata, not an npm lookup.
In the disposable versioned cohort, Devtools/Query/Router require Core `^2.0.0`;
UI's `workspace:^` is resolved by packing against Core 2.0.0.

## Migration and behavior

Read the [Core migration guide](packages/docs/src/packages/react-action-guard/migration.md)
and [capability matrix](CAPABILITIES.md) before selecting a compatible cohort.
Registration owns current configuration and lifetime; mutation protection covers
unsettled executions owned by a hook; navigation confirmation invalidates obsolete
attempts. Existing deprecated aliases remain supported. React Router requires
6.19.0 or later and a data router. Next App Router protection remains unload-only.

The existing matrix distinguishes declarations/loading, memory-router behavior
and production browser behavior. Selected peers and Chrome fixtures do not establish
every supported version combination, arbitrary RSC composition, Pages history/options,
or other browsers. UI blocking does not cancel work or replace server authorization.

## Verification records

Executed records and exact selected dependency versions are retained in
[packed evidence](scripts/compatibility/evidence.json),
[publication evidence](scripts/compatibility/publication-evidence.json), and
[Next runtime evidence](scripts/next-runtime/evidence.json). Each record carries
its own date and scope; historical records are not proof of this baseline.

On 2026-10-12, `pnpm run release:check` passed source build, documentation
examples/links, lint, typecheck, all **852 tests**, formatting, publication checks
and the full **13-target** packed compatibility matrix. Publication checks used
publint 0.3.24, ATTW 0.18.5 and esbuild 0.28.2; the recorded profiles/exclusions
remain in force. `pnpm run test:next-runtime` passed production build, consumer
typecheck and **7 browser scenarios**, with no skips, on Chrome 155.0.8059.39.

Node 22.20.0, pnpm 11.21.0 and npm 11.19.0 were used. Publication evidence includes SHA-256 for all five tested
tarballs, installed peer ranges and the pending Changesets inventory. Next evidence
independently identifies its Core/Router tarballs and fixture hash. Tarballs from
separate runner invocations need not have identical archive hashes.

Initial sandbox runs failed at config-test child-process execution (`EPERM`) and
Next consumer installation (`ETIMEDOUT`). The successful runs were outside that
sandbox. Their raw consumers, locks and reports remain at
`/tmp/action-guard-publication-EmvDxK`, `/tmp/action-guard-compatibility-mbaIMI`
and `/tmp/action-guard-next-runtime-4XJSpS`;
these local temporary paths are inspection aids, not durable published artifacts.
CI must rerun verification for the final release commit.

## Authorized release follow-up

Keep all pending Changesets until the existing release pipeline applies them in
its version PR. Review generated changelogs, versions and peer ranges together;
do not manually overwrite versions or discard accumulated changesets.
The [Release workflow](.github/workflows/release.yml) validates packages before
the Changesets action creates a version PR or publishes. Release merge and npm
publication require a separate operational instruction. After publication, record
the actual versions, dist-tags, provenance and corresponding source commit before
upgrading planned capability statements to published guarantees.

Optional features, speculative identity/factory decisions, marketing distribution
and the external workflow pilot are not release gates for this cohort.

## PR 13 documentation follow-up

The release documentation fixes on `fix/13-release-feedback` are based on
`63543da72f0761bf235f78c9b26a5b8ad07d788c`. They correct Core peer requirements,
packaged guide links and the Query adapter's Node >=20 declaration. Every tarball
now includes CHANGELOG.md. Pending changeset descriptions reflect the final cohort
and no longer promise removed named middleware/runMiddlewares interfaces.

The release version command now advances changelog links and regenerates the
Core, Devtools and Query TypeDoc references after updating manifests. A disposable
copy executed the real version command, confirmed API headings for 2.0.0/1.0.0/0.4.0
and all five changelog links, then repeated it without duplicating release links.
Source reference headings retain source-manifest versions until the version PR
regenerates them; they are not statements of registry publication. Existing TypeDoc
internal-reference warnings remain, with no generation errors.

The refreshed publication evidence includes checks of README relative destinations
inside installed packages, documented Core peers and Node floors. This follow-up
supersedes the earlier tarball hashes above; its source base and input hashes are
recorded in the updated JSON evidence. The raw disposable version workspace is
`/tmp/action-guard-version-feedback-g8d69s2m`; CI must execute the version command
again when updating the release PR. No release merge or publication was performed.

`pnpm run release:check` passed all source checks, 852 tests, publication validation
and all 13 packed targets after the fixes. `pnpm run test:next-runtime` passed all
7 production Chrome scenarios without skips. Fresh reports/consumers remain in
`/tmp/action-guard-publication-QbVOLA`, `/tmp/action-guard-compatibility-xDO5LQ`
and `/tmp/action-guard-next-runtime-uHSCHu`. Package versions in the planned cohort
remain unchanged from the earlier handoff. The earlier interrupted verification
attempts are not used as success evidence.
