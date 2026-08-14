# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2026-06-01

### Fixed

- 🔁 Made guarded scope normalization order-insensitive by deduplicating and sorting scope lists, so `['a','b']` and `['b','a']` resolve to the same cached entry.
- 🧠 Bounded the normalized scope cache with an LRU eviction policy (max 256 entries) to prevent unbounded memory growth.

### Changed

- ♻️ Derived `useGuardedLink` and `useGuardedButton` from the shared `useGuardedControl` hook to remove duplicated blocking and reason logic. Public return shapes are unchanged.

### Added

- 🧩 Exported the `GuardedReasonBlocker` type for custom reason resolvers.
- 🧪 Added regression coverage for guarded link behavior (click prevention, tab order, propagation, ARIA reason wiring) and scope normalization.

## [0.1.4] - 2026-05-27

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.4` line.
- Prepared package metadata for the coordinated toolkit compatibility release.

## [0.1.3] - 2026-05-09

### Fixed

- Stabilized normalized guarded scope references for inline array scopes across parent rerenders.
- Memoized guarded control hook return values so design-system consumers do not receive avoidably new references.
- Added regression coverage for inline array scopes and guarded button rerenders.

## [0.1.2] - 2026-05-03

### Changed

- ♻️ Deduplicated guarded action, button, and field hooks through a shared internal control hook.
- 📦 Aligned published package entry points with the generated CJS and ESM build artifacts.
- 🧼 Removed the direct UI package dependency on Zustand runtime imports by using the core package's resolved store selector API.

### Fixed

- 🛡️ Stabilized guarded hook state and blocker references across parent rerenders when blocking state does not change.
- 🔗 Fixed package metadata so legacy `main` resolves to the CJS artifact and `module` resolves to the generated ESM artifact.
- 🧪 Added regression coverage for multi-scope blockers, custom state mappers, ARIA attributes, blocked links, and stable hook references.

## [0.1.1] - 2026-05-03

### Changed

- 📦 Maintenance release with package metadata updates.

## [0.1.0] - 2026-05-03

### Added

- 🚀 Initial release of `@okyrychenko-dev/react-action-guard-ui`.
- 🧩 UI-agnostic guarded control hooks:
  - `useGuardedAction`
  - `useGuardedButton`
  - `useGuardedField`
  - `useGuardedLink`
  - `useGuardedGroup`
  - `useTopBlocker`
- 🎯 Scope inheritance through `GuardedScopeProvider`.
- ♿ Accessible state helpers for `disabled`, `readOnly`, `loading`, `aria-busy`, `aria-disabled`, `aria-readonly`, and described-by reason wiring.
- 🧠 Typed custom state mappers for adapting guarded state to design-system component props.
- 🧪 Vitest coverage for the core guarded UI hook behavior.

### Requirements

- **Peer Dependencies**:
  - `@okyrychenko-dev/react-action-guard` ^1.0.4
  - `react` ^18.0.0 || ^19.0.0

[Unreleased]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/okyrychenko-dev/react-action-guard-ui/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/okyrychenko-dev/react-action-guard-ui/releases/tag/v0.1.0
