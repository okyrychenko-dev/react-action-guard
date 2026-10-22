# Release cohort handoff

## Current release state — 2026-10-21

The published cohort below was verified directly against npm. Each package's
`latest` tag points to the listed version. Source versions and pending package Changesets are listed below.
Matching source and registry versions do not identify identical artifacts.

| Package        | Verified npm version |
| -------------- | -------------------- |
| Core           | 2.0.0                |
| UI             | 1.0.0                |
| Devtools       | 1.0.0                |
| Query adapter  | 0.4.0                |
| Router adapter | 1.0.0                |

[Dated registry evidence](scripts/compatibility/registry-evidence.json) records
exact peer ranges, dist-tags, tarball URLs, SHA-512 integrity and the selected
consumer dependencies. All five archives matched registry integrity, and all
installed `dist` files matched their downloaded archive contents. A fresh isolated
installation with `--strict-peer-deps --ignore-scripts` and all selected optional
Router peers passed, as did `npm ls --all`, ESM/CJS imports for eight public entry
points and NodeNext `.mts`/`.cts` consumer compilation. Consumer compilation used
`--skipLibCheck`; this is one selected peer set, not the full compatibility matrix.
The import probes emitted a circular-dependency warning about
`replaceRouteChunk`; export assertions and type checks passed.

Registry metadata advertises provenance attestations. Their contents, signatures
and the exact published source commit were **not verified**. The source revision
in the evidence identifies this documentation checkout, not the npm artifacts.
No live GitHub Actions, browser navigation or production Next application checks
were run for this summary. Historical fixture results below retain their original
scope and date.

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

### Source changes since the inspected registry cohort

Current source documentation includes per-invocation `useAsyncAction` result inference,
`UseAsyncActionReturn`, and `reason`/`priority` options that are absent from the
published Core 2.0.0 declarations. Core 2.0.0 supports an explicit result generic
and the existing timeout options. Router warning corrections and the packaged
README links to manifest peer requirements are also pending release.

The generated source state above follows versioning; it does not establish npm
publication. Use the [versions page](packages/docs/src/versions.md),
[Core migration guide](packages/docs/src/packages/react-action-guard/migration.md),
[capability matrix](CAPABILITIES.md), and the README/declarations shipped with the
installed package. The documentation site follows its source revision; an archived
site for the registry cohort is not available.

### Outstanding evidence and external work

Public documentation hosting and browser verification still need a selected
hosting destination/access. A real application must be selected before its pilot
baseline and measured integration. Publication evidence reconciliation and the
parallel verification/publication gate remain open; registry availability alone
does not close their acceptance criteria. No publication or deployment was
performed during this documentation task.

The following references are local tracker fields for the maintainer checkout;
the Git-ignored tracker is not shipped with this document.

| Work                                        | Local tracker reference                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Hosted onboarding and public browser checks | [Tracker](.scratch/11-in-progress-release-hosting-workflow-pilot/issues/06-hosted-coordination-onboarding.md) |
| Stable publication evidence                 | [Tracker](.scratch/11-in-progress-release-hosting-workflow-pilot/issues/08-publish-stable-cohort.md)          |
| Real application baseline                   | [Tracker](.scratch/11-in-progress-release-hosting-workflow-pilot/issues/09-pilot-baseline.md)                 |
| Measured pilot                              | [Tracker](.scratch/11-in-progress-release-hosting-workflow-pilot/issues/10-measured-pilot.md)                 |
| Parallel CI and publication gate            | [Task graph](.scratch/12-ready-parallel-ci-gated-release/README.md)                                           |

## Historical release-preparation records

Everything below records earlier release preparation. Statements about a planned
cohort, uninspected registry or pending initial publication describe those earlier
snapshots, not the current registry inspection above. Original command outcomes,
source revisions and evidence links are preserved. A tested candidate revision is
not proof of the source commit of today's inspected npm artifacts.

The latest tested candidate is `9c5150769aebb5ceb96eee5affa2d770a60928c9`,
including the Router README correction. The final artifact refresh below records
fresh publication, packed compatibility and Next production/browser checks.
Earlier verification sections are historical. This is release preparation;
registry publication and release merge require separate authorization.

### Version provenance

Read the checked-out package manifests, changelogs and remaining `.changeset/*.md`
files for the current source release state. Verification itself does not apply
versions in the checkout. The version PR applies accumulated Changesets, consumes
them and regenerates API references through `pnpm version-packages`.
The existing [cohort preparation](scripts/compatibility/cohort.utils.mjs) copies
built artifacts, applies `changeset version` in a disposable workspace and packs
that resulting cohort. Package checks and fresh consumers inspect those tarballs,
not source aliases. Strict peer installation checks the rewritten internal Core
peer ranges together with the selected external peers.

The planned cohort is Core **2.0.0**, UI **1.0.0**, Devtools **1.0.0**, Query adapter
**0.4.0**, and Router adapter **1.0.0**. These are the evaluated release versions; inspect the checked-out manifests to
determine whether the version PR has applied them to source. No npm registry version or dist-tag has been inspected or changed
by this task. Registry availability must be established after authorized publication.

At the pre-version verification baseline, source manifests declared Core 1.0.5,
UI 0.1.5, Devtools 0.3.0, Query 0.3.5 and Router 0.2.4. These historical
versions do not describe a checkout after the version PR has applied versions.
Source manifest versions alone do not establish npm availability.
In the disposable versioned cohort, Devtools/Query/Router require Core `^2.0.0`;
UI's `workspace:^` is resolved by packing against Core 2.0.0.

### Migration and behavior

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

### Verification records

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

### Authorized release follow-up

Before versioning, retain pending Changesets for the release pipeline. Applying
the version PR consumes those files; their absence afterwards is expected.
Review generated changelogs, versions, peer ranges and API headings together;
do not manually overwrite versions or discard accumulated changesets.
The [Release workflow](.github/workflows/release.yml) validates packages before
the Changesets action creates a version PR or publishes. Release merge and npm
publication require a separate operational instruction. After publication, record
the actual versions, dist-tags, provenance and corresponding source commit before
upgrading planned capability statements to published guarantees.

Optional features, speculative identity/factory decisions, marketing distribution
and the external workflow pilot are not release gates for this cohort.

### Publication authentication and build ownership

Release infrastructure changes can carry an empty changeset to satisfy the PR
check without bumping package versions. Before the release action decides between
versioning and publication, the workflow consumes only changesets whose parsed
release list is empty. Non-empty changesets remain for the normal version PR.
This prevents empty notes from suppressing publication of already-versioned packages.

The release workflow installs pnpm 12.6.0 with `pnpm/action-setup@v6.1.0`,
which adds pnpm 12 support. It uses Node 24 and npm Trusted Publishing through GitHub Actions
OIDC, matching the sibling React libraries. Configure a trusted publisher on each
of the five npm packages for owner `okyrychenko-dev`, repository `react-action-guard`
and workflow `release.yml`. The workflow grants `id-token: write` and does not pass
`NPM_TOKEN` or request an interactive OTP. Package settings must permit trusted
publication; workflow configuration alone does not establish that npm is configured.

`pnpm release` builds the workspace in dependency order before Changesets publishes
packages concurrently. Each package's `prepublishOnly` validates its exported build
artifacts without cleaning or rebuilding them. Concurrent lifecycle rebuilds can
otherwise remove Core declarations while dependent packages are generating types.
For manual publication, build from the repository root first.

CI and Release set `HUSKY=0` at workflow scope, before dependency installation.
This skips hook installation and suppresses existing Husky hooks during release
commits and tag pushes. Explicit workflow verification steps remain responsible
for checks; developer hooks remain enabled outside these workflows. The shared
verification graph described below gates Release for its exact commit.

The local hook baseline at source `17fd3b809394b7bfa79b801e2e7f395dec6758a0`
invokes `pnpm run typecheck`, `pnpm run lint`, `pnpm run test:run` and
`pnpm run build` for each pre-push invocation. A disposable harness ran the
installed Husky dispatcher with the repository's unchanged pre-push script and a
recording pnpm substitute: all four commands ran without `HUSKY=0`, none ran with
either workflow's environment, and all four still ran in the developer environment.
The Husky installation entry point also skipped installation with that environment.
No package was published and no tag was pushed. This establishes command suppression,
not elapsed-time savings. Historical Actions timings were unavailable locally
because GitHub CLI was unauthenticated; capture comparable Actions durations and
confirm release tag behavior during the next authorized release.

After a failed attempt, inspect all five exact registry versions before retrying.
Changesets skips versions already published; retain the intended source versions
and verify the complete cohort after recovery. A successful CI check or GitHub
release alone does not establish registry publication.

### Historical package documentation follow-up

The release documentation fixes are based on
`63543da72f0761bf235f78c9b26a5b8ad07d788c`. They correct Core peer requirements,
packaged guide links and the Query adapter's Node >=20 declaration. Every tarball
now includes CHANGELOG.md. Pending changeset descriptions reflect the final cohort
and no longer promise removed named middleware/runMiddlewares interfaces.

The release version command now advances changelog links and regenerates the
Core, Devtools and Query TypeDoc references after updating manifests. A disposable
copy executed the real version command, confirmed API headings for 2.0.0/1.0.0/0.4.0
and all five changelog links, then repeated it without duplicating release links.
At that pre-version baseline, source reference headings retained the old manifest
versions. The version PR regenerates them for its updated manifests; inspect the
checked-out references when reviewing it. Neither state establishes registry publication. Existing TypeDoc
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

### Release stability audit

The review compares local release tag `v1.0.5`
(`212f3e268b76cde12719e93037cb329124692f89`) with baseline
`743c6f4f004c59ea507ae5c465cff7cb1f34e596` and the audit working tree.
The monorepo diff includes imported adapter history; the review considered the
current shipped implementations, local specifications and accepted ADRs rather
than treating imported commits as newly introduced behavior.

#### Standards

- Shared the repeated scope identity calculation across React Router, TanStack
  Router and Next Pages. Sorting and duplicate elimination remain unchanged.
- Removed three unused internal helpers: the old confirmation dispatcher,
  blocker-config projection and redundant past-schedule predicate. Removed their
  obsolete direct tests where present; none was a supported package export.
- Re-exported the three deprecated Core context hooks from their existing owner
  instead of maintaining duplicate implementations. Built declarations preserve
  the public names, signatures and deprecation annotations.
- Corrected App Router's type import to use the Core directory entry point and
  removed unsupported root types from the Router README example.

Separate adapter navigation behavior and independently built Storybook examples
remain separate. Pending Changesets are retained for the existing release pipeline.

#### Spec and runtime findings

Two inherited scheduling defects were reproduced before correction: a delayed
start callback delivered after the entire window could leave protection active
indefinitely, and an end delay exceeding 2,147,483,647 ms could release protection
immediately. Elapsed windows are now skipped and long windows use bounded deadline
rechecks. Start rechecks also retain scheduled work when the wall clock moves
backwards. The public hook suite passes all 32 scenarios, including notification
errors, timeout episodes, current callbacks, schedule replacement and cleanup.

The reviewed registration, navigation ownership and mutation execution contracts
match the accepted specifications. No additional blocking violation was confirmed
in those runtime paths. This assessment is bounded by the executed tests and
documented capability limits; it is not certification of every peer combination.

#### Final candidate verification

On 2026-10-12, `pnpm run release:check` passed build, documentation validation,
lint, typecheck, all **849 tests**, formatting, publication validation for all five
packages and all **13 packed consumer targets**. The test total excludes nine
obsolete tests belonging to removed internal helpers and includes three added
schedule scenarios, relative to the corrected baseline's 855 tests.

`pnpm run test:next-runtime` passed production Next 15.5.23 build, consumer
typecheck and **7 Chrome scenarios**, without skips. Router browser history passed
**2 scenarios**, without skips. Refreshed JSON records above identify this baseline,
the package source diff SHA-256, selected peers and artifact hashes. Source maps
from publication, compatibility, Next and demo tarballs matched the current
Core/Router sources (52 source entries per cohort).

The enterprise demo installed the final local cohort with `setup:local` and passed
public import verification, its ordinary `npm run check` (**75 tests**), production
build and all **11 Chrome scenarios**, without skips. Earlier unrestricted parallel
component runs had timeout/transient-state failures; the isolated failing cases
passed, and two full runs with two workers passed all 75 tests without extending
timeouts. The demo now limits Vitest to two workers. Navigation tests explicitly
wait for cancellation to close the dialog and for the next dialog to appear;
the initial browser run had one failed sidebar scenario, whereas the final full
browser run passed. Initial failed runs are retained as diagnostic evidence, not
counted as successful verification.

Existing nonblocking diagnostics remain: legacy Next minimum-version fixtures
emit npm deprecation/security warnings, the demo component suite emits HeroUI
accessibility warnings, and its production bundle emits Vite's size warning.
Compatibility testing of historical version floors is not a recommendation to
deploy those versions. These diagnostics were not silenced by the audit.

Raw successful consumers and reports are retained locally at
`/tmp/action-guard-publication-lpciz5`, `/tmp/action-guard-compatibility-7D68Ha` and
`/tmp/action-guard-next-runtime-Ufcrvc`. The package source diff SHA-256 is
`2727f00e92a8588b8f35a442ff2d74868e352ad430ef5eb92adeaa154e2580b8`.
The unrelated user change to `.gitignore` is preserved and excluded from package
input provenance. Sandbox attempts failed at subprocess execution or consumer
installation; the successful release and Next runs were outside the sandbox.

Local validation used Node 22.20.0, pnpm 11.21.0 and npm 11.19.0. CI must rerun on
the final committed candidate, including its configured pnpm 12.6.0 and Node 24
job. Selected Chrome and memory-router scenarios do not extend the existing
capability matrix. In particular, Next App Router remains unload-only. No registry
publication, release merge, manifest version override or dependency removal was
performed.

### Earlier corrected stabilization cohort

The tested source is `9246f46abdb689a1f8a96060af456fbf3ac6ba8f` plus the
migration-guide updates and empty release-evidence changeset. There are no runtime
implementation changes in this preparation. The unrelated user edit to `.gitignore` is excluded. The
JSON records inventory all 59 pending changesets and hash the lockfile and changed
migration inputs. No accumulated package changeset was discarded; the planned
Core 2.0.0 / UI, Devtools and Router 1.0.0 / Query 0.4.0 cohort remains unchanged.

Fresh `pnpm run release:check` passed build (including docs/demo), 25 canonical
examples, 21 reference imports, 2 application snippets, 217 links, lint, typecheck,
**904 tests**, formatting, publication validation and all **13 packed targets**.
The tests comprise 35 configuration, 347 Core, 201 Router, 117 Query, 154 Devtools,
45 UI and 5 coordination-example tests. No source or packed scenario was skipped.
Packed ESM/CJS loading, NodeNext types, strict peer installation and the existing
Provider, mutation and navigation fixtures passed within their documented scope.

Fresh publication evidence records SHA-256 for all five tarballs, installed Core
peers, declaration profiles and bundle measurements. Compatibility evidence now
also identifies its own five tarball hashes and every selected installed peer.
Both exercise type-utils 0.1.2 and Toolkit 1.0.0 in fresh consumers. No TypeScript
implementation change was needed. Source manifests and public exports are preserved.

Local tooling: Node 22.20.0, pnpm 11.21.0, npm 11.19.0, TypeScript 5.6.3 and
Vitest 4.1.10. The release workflow uses Node 22 and pnpm 12.6.0; this local run
does not establish that CI toolchain result. Rerun CI for the final release commit.
Raw successful publication/packed reports and locks remain locally at
`/tmp/action-guard-publication-8W1Kxy` and
`/tmp/action-guard-compatibility-WGD2Zv`. Committed JSON is the durable result;
temporary consumer paths are inspection aids.

The initial sandbox release run failed during the docs build (`spawnSync git EPERM`);
the successful release run used expanded permissions. The initial Next consumer
installation timed out (`spawnSync npm ETIMEDOUT`); it supplies no browser success
evidence. Historical records above are not substituted for fresh verification.

Migration guidance now covers atomic rejection of invalid lifecycle timeouts,
no-timer sentinels, bounded long waits, empty/invalid scheduled windows and render-time
Router predicates. Registry state remains uninspected. Publication and
registry-installed verification require separate release authorization; no release
merge, hosting deployment or npm publication was performed.

Fresh `pnpm run test:next-runtime` passed Next 15.5.23 production build,
consumer typecheck and **7 Chrome 155.0.8059.84 scenarios**, with zero
skips or failures. Pages cancellation/confirmation, latest-attempt handling,
detach/reattach and subsequent Link protection passed; App same-document navigation
remained unintercepted; Pages and App native reload prompts and cleanup passed.
The Next record identifies its independent Core/Router artifact hashes, fixture
hash and exact peers. Raw reports/locks: `/tmp/action-guard-next-runtime-dMzU3n`.
Selected Chrome/Next results preserve the documented limits for other browsers,
Pages history/options and arbitrary RSC compositions. Router browser-history and
enterprise-demo suites were not rerun for this preparation and remain historical.

### Final artifact refresh

The Router README wording change is included in source commit
`9c5150769aebb5ceb96eee5affa2d770a60928c9`. Fresh publication, compatibility and
Next runs use that commit with no package working-tree changes. The unrelated
`.gitignore` edit is excluded. Documentation and evidence updates produced after
the runs do not alter packed package inputs.

The refreshed records supersede the earlier artifact hashes. They inventory
package manifests, READMEs, changelogs, licenses, the lockfile and all 59 pending
changesets. Each artifact record reads peer dependencies from the tarball manifest,
checks them against an installed consumer, and records the packed README SHA-256.
All packed READMEs match the current source bytes; UI's published Core peer is
`^2.0.0`. Source package versions and the planned cohort remain unchanged.

`pnpm run package:check` passed publint, declaration analysis, installed README
links/peers, bundle measurements and import probes for all five packages.
`pnpm run test:packed` passed all 13 strict-peer targets with ESM/CJS loading,
NodeNext types and the existing public behavior fixtures.
`pnpm run test:next-runtime` passed the production build, consumer typecheck and
all 7 Chrome scenarios without skips. Exact peers, browser version and artifact
hashes are recorded in the refreshed JSON. Raw consumers and reports are at
`/tmp/action-guard-publication-hm8q6H`,
`/tmp/action-guard-compatibility-YBtjkM` and
`/tmp/action-guard-next-runtime-aEqnDd`.

The source suite was not rerun for this metadata refresh; its 904-test result above
remains separately dated evidence. The local toolchain remains Node 22.20.0,
pnpm 11.21.0 and npm 11.19.0. Legacy Next floor installations emit existing npm
security/deprecation warnings; testing those floors is not a deployment recommendation.
Selected peers and Chrome scenarios retain the existing capability limits.
No registry publication or release merge was performed; CI must verify the final
release commit using its configured toolchain.

## Verification and publication gate

PRs enter the reusable `Verification` workflow through `CI`; main pushes enter the
same graph through `Release`. Release remains the npm Trusted Publisher workflow
identity (`.github/workflows/release.yml`). Only its release job has repository
write, pull-request write and OIDC permissions. PR verification has read access.
Both callers select pnpm through `package.json` with pnpm/action-setup v6.1.0.

Package preparation builds the five publishable packages in dependency order,
without the documentation site, and applies pending Changesets in a disposable
workspace. The `verified-cohort` artifact contains tarballs, original build outputs
and `cohort.json`: source commit, package names/versions and SHA-256 for every
transported file. Consumers reject another commit, missing files, unexpected files
and changed hashes. Publication, all thirteen compatibility targets and production
Next checks download that artifact; their evidence includes its metadata even when
later checks fail. Formatting and dependency-policy checks run independently.
Lint, typechecks, documentation, Node 22/24 tests and navigation browser checks restore the same package builds;
coverage runs on Node 22 only. Each job owns its workspace and temporary outputs.

The final gate uses `always()` and requires every expected job to report `success`;
failure, cancellation, missing results or unexpected skips fail it. Release requires
a successful reusable workflow and its exact commit output, on a main push. It
consumes empty Changesets and preserves the Changesets Version PR decision. A
candidate with unapplied versions cannot reach verified publication: source package
versions must match, and a fresh pack of restored source must have exactly the same
file contents as the verified tarballs. Archive timestamps/compression do not affect
this content comparison. `pnpm release:verified` performs no build; the standalone
`pnpm release` command still builds before publishing.

After partial publication, rerun Release for the same commit. Changesets skips
existing registry versions. After successful publication, the command checks every
expected registry version, creates missing current-version tags and explicitly
pushes those tags, including tags from an earlier interrupted run. Conflicting
remote tags fail rather than being overwritten. Never bump versions to retry.
Run `pnpm release:verified --dry-run` only with the cohort and exact main-push
context to verify inputs without contacting the publish endpoint.

### Required checks and rollout

Before merging, migrate branch protection from `Verify (Node 22)` and
`Verify (Node 24)` to the aggregate reusable `Verification gate` check under the
PR `verification` job, and retain `Changeset check`. Confirm GitHub's displayed
check names on the first PR run before removing old requirements. The gate covers
all matrix children and every required browser/documentation/consumer job.
Keep main publication serialized; do not introduce a second independent publisher.

Local contract tests exercise artifact transport and each gate failure state.
Hosted PR verification has confirmed scheduling and the displayed check name
`verification / Verification gate`. A failed PR run also demonstrated that failed
lint/navigation prerequisites reject the gate. Branch-protection settings have
not been inspected or changed. Actual npm provenance, release tags and
partial-publication recovery require the next authorized release.

### Hosted verification evidence

Observed on 2026-10-22; raw workflow identities and per-job timestamps are in
[`scripts/release/ci-evidence.json`](scripts/release/ci-evidence.json).

| Run                                                                                                          | Result                                     | Workflow elapsed | Summed job minutes |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ---------------- | ------------------ |
| [Previous PR CI](https://github.com/okyrychenko-dev/react-action-guard/actions/runs/39646590281)             | Success                                    | 3m 37s           | 23.77              |
| [Shared-cohort PR CI](https://github.com/okyrychenko-dev/react-action-guard/actions/runs/39653100941)        | Success                                    | 3m 14s           | 16.82              |
| [Previous main CI](https://github.com/okyrychenko-dev/react-action-guard/actions/runs/39647162962)           | Success                                    | 3m 02s           | 21.00              |
| [Previous main Release](https://github.com/okyrychenko-dev/react-action-guard/actions/runs/39647162959)      | Success                                    | 3m 42s           | 3.63               |
| [Shared-cohort main Release](https://github.com/okyrychenko-dev/react-action-guard/actions/runs/39653708312) | Verification success; release setup failed | 2m 47s           | 17.07              |

Workflow elapsed includes scheduling and finalization; summed job minutes exclude
skipped jobs and are elapsed runner durations, without billing rounding. The PR
sample reduced elapsed time by 23 seconds and summed job time by 6.95 minutes
(29.2%). These adjacent runs use different commits, independent runner/cache
states and variable network downloads. Their timings are observational, not a
controlled benchmark or a fixed speedup guarantee. Main's new run stopped before
the Changesets decision, so it cannot establish end-to-end release improvement.

The previous PR graph explicitly launched 17 full workspace builds: publication,
13 compatibility targets, Next runtime and both Node jobs, with additional builds
inside standalone consumer/coverage commands. The new graph prepares one
five-package cohort; consumer jobs restore it and documentation builds separately.
Successful hosted steps confirm artifact reuse, both Node versions, pinned pnpm
12.6.0, all thirteen compatibility targets and both browser jobs.

On main commit `373b0ad7ea1fb09663f5af95a05db8da1cb6359e`, all 25 verification jobs
passed and the release job received that exact verified commit and restored its
artifact. `changeset status` then failed because SHA checkout left detached HEAD
without a local `main` branch. No publication step ran. Release now attaches the
verified SHA to local `main` before running Changesets; it does not follow a newer
remote tip. A local isolated checkout reproduced the failure and passed after
attachment while retaining the exact SHA. The corrected hosted release path
remains to be verified after merge.

### Local verification evidence

Validated on Node 22.20.0 with the locally installed pnpm 11.21.0; the configured
Actions toolchain remains the packageManager-pinned pnpm 12.6.0 on Node 22/24.
Hosted PR and main verification subsequently passed with pinned pnpm 12.6.0 and
Node 22/24, as recorded above.

- Built one five-package cohort, restored it, and reused it across all thirteen
  compatibility targets, strict publication checks (publint/ATTW), and seven
  production Next browser scenarios. All passed. Navigation browser checks: 2 passed.
- Four contract tests passed, covering artifact transport, hash/file/commit/package
  rejection, each required gate failure state, exact main-push context, and real
  package-content correspondence with a rejected source modification.
- Package and example typechecks, all workspace lints/format checks, documentation
  compilation/link checks and the production documentation/demo build passed.
  actionlint 1.7.7 accepted all three workflows.
- Independent Standards and Spec reviews reported no remaining findings.

Evidence is retained locally at `/tmp/action-guard-shared-cohort-retry`,
`/tmp/action-guard-compatibility-3r9lYR`, `/tmp/action-guard-publication-S0Rnuy`, and
`/tmp/action-guard-next-runtime-NCOxR7`. Temporary paths are local evidence,
not release assets or hosted CI results. No npm publish endpoint was contacted.
