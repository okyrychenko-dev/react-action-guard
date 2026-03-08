# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-03-08

### Breaking Changes

- 🔒 Removed public re-exports of internal `react-zustand-toolkit` helpers from the root API:
  - `createShallowStore`
  - `createStoreToolkit`
  - `createStoreProvider`
  - `createResolvedStoreHooks`
- 🧹 Tightened the public API boundary around `react-action-guard` store internals

### Migration Notes

- Import advanced store construction helpers directly from `@okyrychenko-dev/react-zustand-toolkit` if you still need them
- Prefer `useUIBlockingStore`, `uiBlockingStoreApi`, and provider/hooks exported by `react-action-guard` for public integration

### Changed

- 🔄 `useBlocker` now applies config updates to an already active blocker (without requiring remount)
- ♻️ `configureMiddleware(...)` is now idempotent for global middleware registration:
  - replaces previously configured `middleware-*` entries
  - preserves provider-level middlewares (e.g., `provider-middleware-*`)
- 🧼 `BlockerInfo` no longer exposes internal `timeoutId`
- 🔇 Core hooks/store runtime no longer emit default `console.*` side effects for scheduling, confirmable actions, middleware failures, or slow-block detection

### Fixed

- 🛡️ Analytics middleware is now SSR-safe (`ga`, `mixpanel`, `amplitude` become no-op when `window` is unavailable)
- 📚 Documentation updates across README and Storybook MDX:
  - corrected `useBlocker` signature/defaults and config update behavior
  - corrected `useIsBlocked` default scope semantics (`"global"`)
  - corrected type signatures in `useAsyncAction`, `useConditionalBlocker`, `useScheduledBlocker`
  - fixed Introduction middleware example to use `uiBlockingStoreApi`

## [0.7.0] - 2026-01-25

### Breaking Changes

- ⚠️ **Updated minimum peer dependency versions**:
  - React: `^18.0.0 || ^19.0.0` (removed React 17 support)
  - Zustand: `^5.0.0` (removed Zustand 4.x support)

### Added

- 🧩 **New Storybook components** for enhanced interactive documentation:
  - `BlockerItem` - Reusable component for displaying blocker details
  - `ConfirmDialog` - Confirmation dialog component with customizable styling
  - `ScopeSync` - CSS styles for multi-component scope coordination examples

### Changed

- ♻️ **Code quality improvements**:
  - Converted all `export const` function declarations to `export function` for consistency
  - Standardized component props destructuring pattern in story files
  - Migrated from `JSX` to `ReactElement` type imports for better type clarity
  - Converted utility arrow functions to function declarations (`normalizePriority`, `createMiddlewareContext`)
- 🏗️ **Type organization**: Moved `ShallowStoreBindings` interface to `uiBlockingStore.types.ts` for better structure
- 🔧 **ESLint configuration**: Added `curly: ["error", "all"]` rule to enforce explicit block statements
- 🎨 **Documentation**: Updated code samples in MDX files to reflect function declaration syntax
- 📦 **Dependencies**: Updated `@okyrychenko-dev/react-zustand-toolkit` to `^0.2.0`

### Fixed

- 📝 Cleaned up trailing whitespace in JSDoc comments across all files

## [0.6.1] - 2024-12-28

### Documentation

- 📚 **Comprehensive JSDoc documentation** (~90 examples across all hooks and middleware)
  - All hooks: `useBlocker`, `useIsBlocked`, `useBlockingInfo`, `useAsyncAction`, `useConfirmableBlocker`, `useScheduledBlocker`, `useConditionalBlocker`
  - All middleware: logger, analytics, performance, configuration
  - Context/Provider hooks with isolated store examples
- 🎯 **Examples demonstrate react-action-guard concepts**:
  - Scope-based isolation and coordination
  - `useIsBlocked`/`useBlockingInfo` patterns in separate components
  - Multi-component coordination without prop drilling
  - Priority-based blocking resolution
  - Real-world use cases (forms, navigation, async operations)
- 🔧 **Fixed JSDoc formatting** (removed literal `\n` escape sequences for cleaner TypeDoc generation)

## [0.6.0] - 2024-12-24

### Added

- 🧩 **New `updateBlocker` function** to update blocker metadata dynamically
  - Update scope, reason, and priority of existing blockers
  - Restart timeout by providing a new `timeout` value
  - Clear timeout by setting `timeout: 0`
  - If `timeout` is not changed, the timer continues as before (backward compatible)
- 🎯 **Middleware events for clear operations**:
  - `clearAllBlockers()` now emits `"clear"` middleware event with `count` field
  - `clearBlockersForScope()` now emits `"clear_scope"` middleware event with `scope` and `count` fields
- 📊 **Extended `MiddlewareContext` type**:
  - New optional `scope?: string` field for `clear_scope` action
  - New optional `count?: number` field for `clear` and `clear_scope` actions
- 🧹 **Logger middleware enhancements**:
  - Support for `"clear"` action → 🧹 emoji
  - Support for `"clear_scope"` action → 🎯 emoji
- ✅ **Priority validation**: Negative priority values are automatically normalized to 0
  - Ensures consistent priority sorting behavior
  - Prevents unexpected behavior with negative priorities
  - Documented in TypeScript types and README
- 📚 **Documentation improvements**:
  - Added "Clearing Blockers on Navigation" use case
  - Added "Managing Session Timeouts with Dynamic Updates" use case
  - Added interactive Storybook stories for new features
- 🧪 **Test coverage**: Added 7 new tests for priority validation and clear operations

### Changed

- 🧹 **Internal**: Refactored store actions to reduce code duplication
  - Added `normalizePriority()` helper function for consistent priority handling
  - Added `createMiddlewareContext()` factory for middleware event creation

### Removed

- 🧹 Removed debug `console.log` statements from `registerMiddleware` and `unregisterMiddleware`
  - Use logger middleware for observability instead

## [0.5.0]

### Added

- 📦 Added dependency on `@okyrychenko-dev/react-zustand-toolkit` for shared store utilities
- 🧰 Exported store toolkit helpers for advanced usage:
  - `createShallowStore`
  - `createStoreToolkit`
  - `createStoreProvider`
  - `createResolvedStoreHooks`

### Changed

- ♻️ Store creation now uses `react-zustand-toolkit` utilities
- 🧩 Internal store setup moved to a dedicated toolkit library for reuse and maintenance

## [0.4.0]

### Added

- ⏱️ **Timeout mechanism** - auto-remove blockers after specified time
  - New `timeout` option in `BlockerConfig` to auto-remove blockers
  - New `onTimeout` callback when blocker is auto-removed
  - New `"timeout"` action type in middleware
  - Works with `useBlocker`, `useAsyncAction`, and all other hooks
- 🏠 **Provider pattern** - isolated stores for SSR, testing, and micro-frontends
  - New `UIBlockingProvider` component for isolated store instances
  - New `useUIBlockingContext` hook to access context store
  - New `useIsInsideUIBlockingProvider` hook to check if inside provider
  - New `useUIBlockingStoreFromContext` hook for context store with selector
  - All hooks now support both global and context stores automatically

### Changed

- ⬆️ Updated peer dependencies to support React 19
  - React: `^18.0.0 || ^19.0.0`
  - Zustand: `^5.0.0`
- 🔧 All hooks now use resolved store APIs for Provider support

## [0.3.3] - 2025-12-01

### Added

- 🛠️ `configureMiddleware` helper function for easy middleware registration
- 📊 `useBlockingInfo` hook to get detailed blocking information (reason, priority, timestamp, etc.)

### Fixed

- 📝 Fixed README documentation to use correct middleware function names:
  - `analyticsMiddleware` → `createAnalyticsMiddleware`
  - `performanceMiddleware` → `createPerformanceMiddleware`
- 📚 Added missing `configureMiddleware` export that was referenced in documentation

## [0.3.0] - 2025-11-25

### Added

- 🚀 `createShallowStore` utility function for automatic shallow comparison in selectors
- 📦 Export `uiBlockingStoreApi` for direct store access without hooks

### Changed

- ⚡ **BREAKING**: `useUIBlockingStore` now requires a selector function instead of being called without arguments
- 🔧 Refactored `useUIBlockingStore` to use `createShallowStore` instead of direct `create()`
- 🎯 Updated all hooks to use selectors with shallow comparison:
  - `useBlocker`
  - `useAsyncAction`
  - `useScheduledBlocker`
  - `useConditionalBlocker`
- 🧪 Updated all tests to use `uiBlockingStoreApi.getState()` instead of `useUIBlockingStore.getState()`

### Performance

- ♻️ Reduced unnecessary re-renders by automatically applying shallow comparison to all selectors
- 🎯 Improved component performance when using multiple store subscriptions

### Migration Guide

**Before (0.2.x):**

```typescript
const { addBlocker, removeBlocker } = useUIBlockingStore();
```

**After (0.3.0):**

```typescript
// Option 1: Use selector (recommended for hooks)
const { addBlocker, removeBlocker } = useUIBlockingStore((state) => ({
  addBlocker: state.addBlocker,
  removeBlocker: state.removeBlocker,
}));

// Option 2: Use direct API access (for non-hook contexts)
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
uiBlockingStoreApi.getState().addBlocker("id", config);
```

## [0.2.3] - 2025-11-24

### Added

- 📚 Comprehensive Storybook documentation with interactive examples for all hooks
- 📖 Detailed MDX documentation files (3000+ lines total):
  - Introduction.mdx with library overview and quick start guide
  - Individual MDX files for each hook with usage examples and API reference
- 🧩 Reusable Storybook components for consistent presentation:
  - `StoryContainer` - Standardized container for all stories
  - `StatusDisplay` - Unified status display component
  - `AffectedElements` - Demo component showing blocked UI elements
  - `DebugPanel` - Real-time blocker state visualization
- 🛠️ Utility functions for stories:
  - `simulateAsyncOperation()` - Reusable async operation simulator
  - `formatErrorMessage()` - Type-safe error message formatter
- 🎨 Shared CSS styles (`shared.stories.css`) for consistent story styling
- 🔧 Integration with `clsx` library for className management (industry standard)

### Changed

- ♻️ Refactored all 6 story files to use shared components (reduced code duplication by ~20%)
- 📝 Updated ESLint configuration with import sorting rules
- 🏗️ Reorganized hooks folder structure for better maintainability
- 🎯 Stories now use `clsx` instead of custom `classNames` implementation

### Fixed

- ✅ Resolved React `act()` warnings in test suite
- 🐛 Fixed `useScheduledBlocker` hook implementation issues
- 🔧 Fixed ESLint errors in story files (type return annotations, async handlers)
- 🎨 Fixed CSS class concatenation using proper utilities

## [0.2.2] - 2025-11-23

### Added

- Documentation improvements in README

### Changed

- Updated project metadata

## [0.2.1] - 2025-11-22

### Added

- Advanced hooks implementation:
  - `useAsyncAction` - Wrap async operations with automatic UI blocking
  - `useConfirmableBlocker` - Confirmation dialogs with blocking
  - `useConditionalBlocker` - Condition-based blocking with polling
  - `useScheduledBlocker` - Time-based scheduled blocking
  - `useIsBlocked` - Check blocking state for any scope

### Changed

- Improved hook implementations with better TypeScript types
- Enhanced middleware system with context passing

### Fixed

- Cleaned up redundant files from repository

## [0.1.0] - 2025-11-16

### Added

- Initial release of React Action Guard
- Core blocking system with Zustand store
- Basic hooks:
  - `useBlocker` - Manual blocking control with priorities
  - `useUIBlockingStore` - Direct store access
- Scope-based blocking system (global, custom scopes, multiple scopes)
- Priority-based blocker management (higher values = higher priority)
- Middleware system for extensibility
- Built-in logger middleware
- TypeScript support with full type definitions
- Comprehensive test suite
- MIT License

[Unreleased]: https://github.com/okyrychenko/react-action-guard/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.7.0...v1.0.0
[0.7.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/okyrychenko/react-action-guard/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/okyrychenko/react-action-guard/compare/v0.1.0...v0.2.1
[0.1.0]: https://github.com/okyrychenko/react-action-guard/releases/tag/v0.1.0
