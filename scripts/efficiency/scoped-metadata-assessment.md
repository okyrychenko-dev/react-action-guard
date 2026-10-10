# Scoped metadata follow-up — feedback tickets 18 + 19

## Implementation and ownership

Core `useBlockingInfo` subscribes to a scoped immutable projection instead of the entire lifecycle snapshot. UI guarded controls consume the same hook; lifecycle `getBlockingInfo` uses the same filtering and priority ordering. The public hook accepts readonly observed-scope arrays so the UI adapter can reuse it. A prepared matcher normalizes observed scopes once per selector/projection; string checks and array membership share the ordinary observation rules without normalizing every blocker on every read. Existing string calls, matching rules, global blockers, empty observations and insertion-order priority ties are preserved.

Each hook owns a selector retaining only its last input snapshot, matching list and ordered result. Resolved subscriptions and selection retention use react-zustand-toolkit through `createResolvedStoreHooks`. Core supplies metadata equality to `useResolvedValue`, so equivalent results remain stable even if bounded normalization-cache eviction recreates a selector. This path adds no direct Zustand runtime imports. Unchanged matching metadata retains the result and skips sorting and subscription-driven React renders. Equality checks every published field, including the exact blocker scope array, timestamp, timeout and callback identity. Relevant replacement/removal remains observable; prior results and blocker scopes stay frozen. Scope normalization remains the existing bounded 256-entry cache; no global metadata cache, scope index or dependency removal is introduced. The hook's selector and subscription are released with the hook, and independent providers use independent selectors. Boolean subscriptions are unchanged.

Public-hook tests under actual Providers cover unrelated add/update/remove, relevant metadata, replacement resetting omitted fields, globals, scope arrays and changes, priority ties, immutable prior results, equivalent observed arrays, normalization-cache eviction, provider isolation and cleanup. Both unrelated-render regressions failed on the previous implementations and passed with the new projection.

## Retained baseline and workload inventory

The original [assessment](assessment.md), [production](evidence/production.json), [development](evidence/development.json), bundle attribution and consumer lock remain unchanged. Their source base is `711f0d7c672cf64db619be16337aa551325f1e0f`. The recommendation to retain toolkit and type-utils is preserved; externalization is still an attribution estimate rather than a removal implementation.

| Seeded blockers | Controls per kind | Lifecycle/event observers | Disposition                                                         |
| --------------- | ----------------- | ------------------------- | ------------------------------------------------------------------- |
| 10              | 20                | 0                         | Retained small workload                                             |
| 100             | 100               | 5                         | Retained medium workload; no duplicate 100-blocker scenario         |
| 500             | 200               | 5                         | Retained large workload                                             |
| 1000            | 200               | 5                         | New blocker scale with unchanged consumer/observer counts           |
| 100             | 100               | 100                       | New observation scale with unchanged medium blocker/consumer counts |

All sizes also measure 50 rapid scoped add/remove pairs per sample. The medium workload alone measures 10 unrelated add/remove pairs with individual synchronous React commits per sample. Both rapid scenarios use one additional validation subscriber to capture every registration/removal phase; capture cost is inside the measured interval, assertions outside. Snapshot sizes/presence, exact publications/events, scoped counts/reasons and consumer renders are checked rather than inferring correctness solely from the final empty registration. Untimed React preparation seeds the captured Provider before attaching consumers; the empty-control mount and update/churn measurement boundaries remain unchanged. This avoids quadratic setup work from notifying every consumer during initial seeding, without removing a measured workload.

## Evidence and environment

Executed on 2026-10-10 against task baseline `64fd756dbae4feb62b88698af1ed765a59212691` plus the recorded [source diff](scoped-metadata-evidence/source.patch). The diff captures sources at measurement time, including then-current documentation progress; final assessment/evidence were completed afterwards. Unrelated `.gitignore` is excluded from the source diff and task commit. [Production](scoped-metadata-evidence/production.json), [development](scoped-metadata-evidence/development.json), [provenance/bundles](scoped-metadata-evidence/bundles.json), the [consumer lock](scoped-metadata-evidence/consumer-lock.json) and all six attribution metafiles are retained. Code-fixture and tarball SHA-256 values plus the source-diff hash identify this run independently of its later handoff commit.

Node 22.20.0, pnpm 11.21.0, npm 11.19.0, React/DOM 19.2.8, Zustand 5.0.15, Happy DOM 20.11.2, esbuild 0.28.2, toolkit 1.0.0 and type-utils 0.1.2; Linux 7.0.0-38-generic x64, Intel Core i7-3610QM @ 2.30 GHz. These are measured installed versions, not claims about latest releases. The historical run used the same reported CPU, Node and runtime dependency versions; transitive/type packages and source bases are independently recorded in their locks/reports.

`pnpm run measure:efficiency /tmp/guard-efficiency-18-19-toolkit` exited successfully after strict-peer installation of planned Core 2.0.0 / UI 1.0.0 tarballs. Source package manifests were unchanged. Packed Provider isolation/SSR/hydration, strict narrowing fixture, middleware-release probe, actual consumer SSR and dependency-guard execution all passed. The retained consumer/tarballs are under `/tmp/action-guard-efficiency-eRtOAK` on the measuring machine; reproduce fresh tarballs through the runner. No other expensive verification ran concurrently with final sampling. Exploratory/interrupted runs and the earlier report-finalization failure are excluded from these final results.

## Results

Wall-clock milliseconds, median / p95; 5 warmups, 20 measured samples. Counts below include two top blockers. Controls are per kind, so 100 controls means 300 mounted consumers. Production has no Strict Mode wrapper; development does.

| Blockers / controls per kind / observers | Production unrelated | Production related | Development unrelated | Development related |
| ---------------------------------------- | -------------------- | ------------------ | --------------------- | ------------------- |
| 12 / 20 / 0                              | 0.247 / 0.342        | 1.692 / 1.931      | 0.245 / 0.403         | 6.253 / 8.713       |
| 102 / 100 / 5                            | 2.938 / 3.168        | 6.767 / 7.951      | 3.147 / 6.495         | 13.607 / 22.527     |
| 502 / 200 / 5                            | 25.323 / 26.168      | 45.158 / 47.467    | 24.776 / 25.641       | 76.971 / 77.811     |
| 1002 / 200 / 5                           | 47.518 / 48.807      | 83.451 / 86.248    | 50.296 / 53.753       | 113.577 / 129.754   |
| 102 / 100 / 100                          | 2.740 / 3.063        | 6.677 / 9.206      | 2.895 / 3.065         | 11.961 / 21.490     |

Historical unrelated-update p95 comparison (separate runs, not an isolated experiment):

| Blockers / controls per kind | Prior production | New production | Reduction | Prior development | New development | Reduction |
| ---------------------------- | ---------------- | -------------- | --------- | ----------------- | --------------- | --------- |
| 12 / 20                      | 4.819            | 0.342          | 92.9%     | 14.101            | 0.403           | 97.1%     |
| 102 / 100                    | 61.479           | 3.168          | 94.8%     | 144.870           | 6.495           | 95.5%     |
| 502 / 200                    | 629.761          | 26.168         | 95.8%     | 3027.278          | 25.641          | 99.2%     |

Every unrelated metadata and rapid React sample rendered **zero** boolean, metadata and guarded-button consumers in both modes. Related metadata samples rendered each metadata/button consumer once in production and twice in development, while boolean consumers rendered zero. Availability removal made all checkout buttons available and metadata empty. Relevant reason/count/priority checks, registration/removal phase visibility, exact publication/event counts and cleanup passed for every workload.

Rapid scoped lifecycle registration/removal, **50 pairs per sample**, with one phase-capture subscriber included:

| Blockers / controls per kind / observers | Production median / p95 | Development median / p95 |
| ---------------------------------------- | ----------------------- | ------------------------ |
| 12 / 20 / 0                              | 1.031 / 1.217           | 1.118 / 1.248            |
| 102 / 100 / 5                            | 2.549 / 4.321           | 2.567 / 3.973            |
| 502 / 200 / 5                            | 10.440 / 11.631         | 11.045 / 11.484          |
| 1002 / 200 / 5                           | 20.934 / 21.709         | 21.290 / 23.681          |
| 102 / 100 / 100                          | 3.898 / 9.252           | 3.699 / 9.875            |

The medium React rapid scenario performs **10 pairs / 20 individual commits per sample**: production 57.291 / 58.459 ms, development 58.135 / 59.661 ms. Both have zero consumer renders and validate each snapshot-size transition. These are batch durations, not per-transition timings.

The retained medium synthetic p95 improves by more than 50% and is below 16 ms in this run. The 500/1000-blocker production cases still exceed 16 ms despite zero unrelated renders: eliminating renders does not eliminate linear filtering/comparison work across many consumers. The 100-observer case passes exact event counts; its timing difference from the 5-observer case is noisy and does not isolate observer cost from scheduling/GC. Lifecycle transition/read/mount/removal and bundle costs remain available in the raw reports; do not subtract scenarios to invent phase attribution.

## Limits and future thresholds

Happy DOM on Node measures synthetic wall time through `flushSync` React commits, not native browser frames, paint or input latency. Development Strict Mode is reported separately from production. Warmups, 20 raw samples, validation outside the timer and matching workload boundaries are retained. Historical/follow-up comparisons are observations from separate runs and package bases, not an isolated causal experiment or cross-machine guarantee. The added scale/churn scenarios have no historical timing baseline.

The prior decision threshold remains: investigate unwanted unrelated renders or unrelated p95 above 16 ms at about 100 blockers / 100 controls per kind in an application's representative workload. A future optimization should show at least 50% lower unrelated p95 on the same target browser/hardware while preserving semantic checks. This follow-up's synthetic comparison does not establish a browser frame budget. Filtering still scales with blockers and consumers; there is no constant-time matching claim. Repeat the application workload on its real browser/hardware before deciding whether any further indexing or shared caching is justified. Dependency removal and browser performance guarantees remain outside these tickets.
