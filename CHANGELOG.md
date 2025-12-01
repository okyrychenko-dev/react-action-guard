# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Priority-based blocker management (0-100 scale)
- Middleware system for extensibility
- Built-in logger middleware
- TypeScript support with full type definitions
- Comprehensive test suite
- MIT License

[Unreleased]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.3...HEAD
[0.3.3]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/okyrychenko/react-action-guard/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/okyrychenko/react-action-guard/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/okyrychenko/react-action-guard/compare/v0.1.0...v0.2.1
[0.1.0]: https://github.com/okyrychenko/react-action-guard/releases/tag/v0.1.0
