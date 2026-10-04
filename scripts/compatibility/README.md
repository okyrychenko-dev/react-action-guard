# Packed compatibility checks

Run `pnpm run build` then `pnpm run test:packed` (all targets), or
`pnpm run test:packed react-18` (one target). Requires Node 22+, pnpm, npm, and registry access. CI selects pnpm 12.6.0. The recorded local evaluation used Node 22.20.0, pnpm 11.21.0 and npm 11.19.0. CI runs each target independently.

The runner packs all five publishable packages with pnpm, installs tarballs into
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
| query-floor           | TanStack Query 5.90.10                | Imports and declarations only; also the currently locked version                             |

Other targets select React/DOM 19.2.8 and React types 19.2.18. Zustand 5.0.0 is
selected except the `react-19` target, which checks current Zustand 5.0.15, along with toolkit 1.0.0 and type-utils 0.1.2. Supplied external peers and runtime dependency floors are checked against packed manifests. “Current” means the repository's selected dependency,
not a claim about the newest registry release. Exact resolved transitive versions
are retained in each consumer's package-lock.json.

Internal core peer ranges refer to the pending Changesets release cohort, whose
source manifests still have pre-release version numbers. The runner deliberately
uses `--legacy-peer-deps` and explicitly supplies peers, preventing automatic
installation of optional adapters. It proves packed import/declaration/runtime
behavior for that cohort, **not strict peer resolution or compatibility with an
older published core**. Release the packages together through Changesets; validate
strict installation after versioning before publication. No sibling package's
passing tests are counted as Action Guard evidence.

Exclusions: no complete version Cartesian product, Next application/browser/RSC
runtime, native browser prompt UI, cross-document history, or older peer versions.
Next floor checks establish loading and declarations only. The existing browser
suite separately establishes Chrome same-document TanStack history behavior.

Memory-router tests use Node’s `development` export condition with Happy DOM browser globals; native Node loading uses default conditions. This distinction is necessary for TanStack’s server/client conditional exports and is not evidence of a native browser run.
