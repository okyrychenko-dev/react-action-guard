# Packed compatibility checks

Run `pnpm run build` then `pnpm run test:packed` (all targets), or
`pnpm run test:packed react-18` (one target). Requires Node 22+, pnpm, npm, and registry access. CI selects pnpm 12.6.0. The recorded local evaluation used Node 22.20.0, pnpm 11.21.0 and npm 11.19.0. CI runs each target independently.

The runner copies built artifacts and package manifests into a disposable workspace, applies the actual pending Changesets there, then packs all five publishable packages with pnpm and installs tarballs into
fresh temporary npm consumers, and executes Node ESM and CommonJS imports plus
TypeScript 5.6.3 NodeNext `.mts`/`.cts` consumers. No source aliases or workspace
links are used. Unrelated optional router peers and Query are asserted absent.
Consumers and dated `result.json` files remain under the printed `/tmp` path for
inspection; CI uploads successful result files. Failed targets do not produce a
success record. Re-run after changes; a previous record is not proof for a new diff.

| Target                | Selected versions                     | Additional behavior                                                                          |
| --------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| react-18              | React/DOM 18.0.0, React types 18.0.0  | Strict Mode, nested/adjacent/independent roots, cleanup, SSR request isolation and hydration |
| react-19-floor        | React/DOM 19.0.0, React types 19.0.0  | Same provider suite                                                                          |
| react-19              | React/DOM 19.2.8, React types 19.2.18 | Same provider suite                                                                          |
| react-router-floor    | React Router DOM 6.19.0               | Real memory-router denial, confirmation and subsequent protection                            |
| react-router-7-floor  | React Router DOM 7.0.0                | Same navigation suite                                                                        |
| react-router-current  | React Router DOM 7.14.2               | Same navigation suite                                                                        |
| tanstack-router-floor | TanStack Router 1.170.41              | Same navigation suite; also the repository's currently locked version                        |
| next-13-floor         | Next 13.4.0, React/DOM 18.2.0         | Imports and declarations only                                                                |
| next-14-floor         | Next 14.0.0, React/DOM 18.2.0         | Imports and declarations only                                                                |
| next-15-floor         | Next 15.0.0, React/DOM 18.2.0         | Imports and declarations only                                                                |
| next-current          | Next 15.5.23                          | Imports and declarations only                                                                |
| query-floor           | TanStack Query 5.90.10                | Mutation concurrency, reset, detach, awaited callbacks and generic types; locked version     |
| query-current         | TanStack Query 5.104.1                | Same packed mutation suite                                                                   |

Other targets select React/DOM 19.2.8 and React types 19.2.18. Zustand 5.0.0 is
selected except the `react-19` target, which checks current Zustand 5.0.15, along with toolkit 1.0.0 and type-utils 0.1.2. Supplied external peers and runtime dependency floors are checked against packed manifests. “Current” means the repository's selected dependency,
not a claim about the newest registry release. Exact resolved transitive versions
are retained in each consumer's package-lock.json.

Both packed runners version the cohort using the same Changesets CLI/configuration as release. Source manifests and Changesets remain untouched. Packing-only workspace links resolve `workspace:` versions inside that disposable workspace; fresh test consumers use installed tarballs and registry dependencies, with no workspace links. `npm install --strict-peer-deps` checks the resulting internal Core peers as well as external peers. Unrelated optional peers remain absent in the compatibility matrix. The full publication consumer installs all adapters and their selected peers strictly too. These are tests of the planned cohort, not promises about older published packages or npm registry publication.

## Publication checks

Run `pnpm run build && pnpm run package:check` for publication checks, or `pnpm run release:check` for source checks, publication checks and the full compatibility matrix. The release workflow runs publication/compatibility checks before its release action.

- `publint --strict` inspects the actual versioned tarballs, failing on errors and warnings (informational suggestions are allowed).
- Are the Types Wrong? 0.18.5 checks declarations with bundled types. Core, UI, Devtools and Query use the strict profile. Router uses the `node16` **TypeScript resolution profile**, retaining ESM/CJS/bundler analysis while excluding unsupported legacy `node10` subpath resolution. This is not a Node 16 runtime support claim. Devtools excludes only `./styles.css` from declaration analysis; that non-JavaScript asset is separately checked for publication. No diagnostic rules are suppressed.
- Esbuild 0.28.2 measures raw/gzip bytes for declared ESM/CJS/types artifacts and a minimal consumer of every root/router entry. React, React DOM, router and Query peers are external; Toolkit/type-utils and other included dependencies contribute to measurements. Results identify externals and selected symbol. These are measurements, not universal bundle budgets or sibling comparisons.
- Bundled ESM import probes force the package's `sideEffects` metadata on temporarily to prevent tree shaking from hiding initialization. Each isolated Node process must exit, add no global properties, and write no stdout/stderr. Consumers' original manifests are restored. These probes do not establish absence of every possible browser or external-peer side effect; Devtools CSS remains explicitly side-effectful.

The runner retains `publication.json`, raw ATTW reports, consumers and resolved locks under its printed temporary directory; CI uploads reports and locks. A success record is written only after all checks pass. Versioned [publication evidence](publication-evidence.json) and [compatibility evidence](evidence.json) record the executed checks. Refresh those records after meaningful artifact, dependency or release-plan changes.

Exclusions: no complete version Cartesian product, Next application/browser/RSC
runtime, native browser prompt UI, cross-document history, or older peer versions.
Next floor checks establish loading and declarations only. The existing browser
suite separately establishes Chrome same-document TanStack history behavior.

Memory-router tests use Node’s `development` export condition with Happy DOM browser globals; native Node loading uses default conditions. This distinction is necessary for TanStack’s server/client conditional exports and is not evidence of a native browser run.
