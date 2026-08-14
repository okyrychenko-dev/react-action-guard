# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.5] - 2026-05-27

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.4` line.
- Updated the transitive toolkit override to `react-zustand-toolkit@^0.4.1`.

## [0.3.4] - 2026-05-09

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.3` line.
- Prepared package metadata for the coordinated `react-action-guard` stability release.

## [0.3.3] - 2026-04-18

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.2` line
- Kept the transitive toolkit override aligned with `react-zustand-toolkit@0.4.0`

## [0.3.2] - 2026-03-08

### Fixed

- 🧠 Restored closer TanStack Query parity by switching wrapper defaults from hard-coded `Error` to `DefaultError`.
- 🔌 Restored support for the optional `queryClient` parameter across all hook wrappers.

### Changed

- ♻️ `useBlockingManager` now reads store actions directly instead of subscribing hook instances to unrelated store updates.

## [0.3.1] - 2026-03-08

### Fixed

- 🛡️ Fixed blocker ID collisions for `useBlockingQuery` and `useBlockingMutation` when multiple hook instances used the same key.
- 🧹 Fixed premature blocker removal on unmount in same-key multi-instance scenarios.
- 🧠 Fixed wrapper typing so TanStack Query inference is preserved more accurately for `select`, `initialData`, mutation variables, and `useQueries` tuples.
- ⚙️ Fixed blocker lifecycle churn on rerender by updating existing blockers instead of tearing them down and re-adding them on every dependency change.

### Changed

- 🔑 `blockerId` generation now includes per-instance identity for query/mutation hooks (same key no longer implies shared blocker ID).
- ♻️ Simplified `useBlockingManager` effect lifecycle to reduce unnecessary remove/add churn from unstable external dependencies.
- ⬆️ Synced local dev dependency `@okyrychenko-dev/react-action-guard` to `^1.0.1` (matches peer dependency).
- 🔄 Aligned query hook internals and docs with current TanStack Query v5 state references (`isPending` / `isRefetching`).
- 📝 Refreshed public API docs to use the correct package introduction versions in `@since`.
- 📦 Aligned package metadata and packed artifact validation with the published ESM/CJS entry points and type declarations.
- ⬆️ Narrowed the documented and published `@tanstack/react-query` peer range to the tested v5 line (`^5.90.10`).

### Added

- 🧪 Added type-level tests covering query, infinite query, mutation, and `useQueries` inference contracts.
- 🧪 Added rerender and React `StrictMode` lifecycle coverage for `useBlockingQuery`, `useBlockingQueries`, and `useBlockingInfiniteQuery`.
- 📦 Added a packed-artifact smoke test in a temporary consumer app to verify import and type resolution outside the source tree.

## [0.3.0] - 2026-01-25

### Breaking Changes

- ⚠️ **Updated minimum peer dependency versions**:
  - React: `^18.0.0 || ^19.0.0` (removed React 17 support)
- ⬆️ **Updated peer dependency**: `@okyrychenko-dev/react-action-guard` from `^0.6.0` to `^1.0.1`

### Changed

- 🔧 **ESLint configuration**: Added `curly: ["error", "all"]` rule
- 📝 Cleaned up trailing whitespace in JSDoc comments across all hooks

## [0.2.4] - 2024-12-28

### Documentation

- 📚 **Comprehensive JSDoc examples** (14 total) demonstrating react-action-guard concepts
  - `useBlockingQuery` (4): scope isolation, background refresh, error handling with retries, multi-scope coordination
  - `useBlockingMutation` (4): multi-component coordination, priority system, error blocking during retries, whole-app coordination
  - `useBlockingInfiniteQuery` (3): visual feedback with `useBlockingInfo`, initial vs pagination blocking, scope isolation
  - `useBlockingQueries` (3): parallel coordination blocking all queries, dynamic query arrays, critical app initialization
- 🎯 **All examples demonstrate react-action-guard value**:
  - `useIsBlocked` / `useBlockingInfo` usage in separate components
  - Scope-based isolation and multi-component coordination
  - Priority-based blocking resolution
  - No prop drilling patterns
- 📖 **README enhancements**:
  - Added "React-Action-Guard Concepts" section explaining scope isolation, useIsBlocked/useBlockingInfo, multi-component coordination, priority system
  - All sections now show library benefits over vanilla TanStack Query
- 📝 **Documentation improvements** in manual docs with concept-focused examples

## [0.2.3] - 2024-12-24

### Changed

- ⬆️ Updated peer dependency: `@okyrychenko-dev/react-action-guard` from `^0.5.0` to `^0.6.0`
  - Compatible with new `updateBlocker` function for dynamic metadata updates
  - Compatible with new middleware events (`clear`, `clear_scope`)
  - Compatible with priority validation (negative values → 0)

## [0.2.2] - 2024-12-17

### Changed

- ⬆️ Updated peer dependencies to support React 19
  - React: `^18.0.0 || ^19.0.0`

### Added

- ⏱️ Added `timeout` and `onTimeout` support in blocking config for all hooks

## [0.2.0] - 2025-01-30

### Added

- 🪝 **`useBlockingInfiniteQuery` hook** - TanStack Query `useInfiniteQuery` wrapper with UI blocking
  - Support for infinite scrolling and pagination
  - Block during initial loading, fetching next/previous page, and error states
  - Dynamic reasons for different states (`reasonOnLoading`, `reasonOnFetching`, `reasonOnError`)

- 🪝 **`useBlockingQueries` hook** - TanStack Query `useQueries` wrapper with UI blocking
  - Execute multiple queries in parallel with unified blocking behavior
  - Block when any query is loading, fetching, or in error state
  - Dynamic reasons based on query states

- 🎨 **Clean architecture with shared utilities**:
  - `useBlockingManager` - Centralized blocker lifecycle management
  - `resolveBlockingReason` - Dynamic reason selection logic
  - `useQueryBlockerId`, `useMutationBlockerId`, `useRandomBlockerId` - ID generation utilities

- 📚 **Comprehensive documentation**:
  - Updated README with examples for all 4 hooks
  - Advanced usage examples for infinite queries and multiple queries
  - Architecture section explaining internal structure
  - Expanded Best Practices section with code examples

### Changed

- ♻️ **Refactored all hooks** to use shared utilities
  - Reduced code duplication by 69% (~220 lines)
  - Each hook is now ~33% smaller (from ~90 to ~60 lines)
  - Single source of truth for blocker management logic

- 🏗️ **Improved project structure**:
  - Created `src/internal/` for internal utilities (not exported)
  - Created `src/utils/` for pure utility functions
  - Created `src/types/` for shared type definitions
  - Added `BaseBlockingConfig` type for common configuration properties

### Improved

- 🧪 **Test coverage**: 61 tests across 4 test suites (from 41 tests)
- 📖 **Documentation**: README expanded from 468 to 912 lines (+95%)
- 🔧 **Maintainability**: Changes to blocking logic now affect all hooks automatically
- 🎯 **Type safety**: All shared utilities fully typed with TypeScript
- 🧹 **Code quality**: DRY principle applied throughout the codebase

### Technical Details

- All hooks now follow consistent pattern:
  1. Wrap TanStack Query hook
  2. Monitor state changes
  3. Resolve dynamic reasons
  4. Manage blockers via shared `useBlockingManager`
  5. Generate stable IDs
  6. Automatic cleanup

## [0.1.0] - 2025-01-26

### Added

- 🚀 Initial release
- 🪝 `useBlockingQuery` hook - TanStack Query `useQuery` wrapper with UI blocking
- 🪝 `useBlockingMutation` hook - TanStack Query `useMutation` wrapper with UI blocking
- 🎯 Scope-based blocking system
- 📊 Priority-based blocker management (queries: 10, mutations: 30)
- 💬 Dynamic reasons support for different states:
  - Query states: `reasonOnLoading`, `reasonOnFetching`, `reasonOnError`
  - Mutation states: `reasonOnPending`, `reasonOnError`
- 🔒 Type-safe configuration with discriminated unions for mutation blocking
- 📚 Full TypeScript support with comprehensive JSDoc documentation
- 🧹 Automatic blocker cleanup on component unmount
- 🔑 Deterministic blocker IDs based on query/mutation keys
- ⬇️ Fallback hierarchy for reason messages
- 🏷️ Support for multiple scopes per blocker

### Features

- **Query Blocking**: Control blocking during initial loading, background fetching, and error states
- **Mutation Blocking**: Control blocking during pending and error states
- **Type Safety**: TypeScript prevents invalid configurations (e.g., `reasonOnError` without `onError: true`)
- **Flexibility**: Works seamlessly with all TanStack Query features (callbacks, optimistic updates, etc.)
- **Priority System**: Higher priority blockers take precedence
- **Clean API**: Same API as TanStack Query with additional `blockingConfig` parameter

### Documentation

- 📖 Comprehensive README with examples and API reference
- 💻 JSDoc comments for all public APIs
- 🔍 TypeScript type definitions with detailed annotations
- ✅ 41 unit tests with 95%+ coverage

[Unreleased]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.5...HEAD
[0.3.5]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/okyrychenko-dev/react-action-guard-tanstack/releases/tag/v0.1.0
