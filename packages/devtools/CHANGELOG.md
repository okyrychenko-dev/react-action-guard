# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-07-25

### Added

- Timeline toolbar can now copy the filtered events to the clipboard or download them as a JSON
  file (with export metadata), making bug reports easy to attach.
- UI preferences (panel minimized state, active tab, and filters) are persisted to `localStorage`
  and restored across reloads. Prop-owned state (`defaultOpen`, `maxEvents`) and recorded events
  are never persisted.
- Active blockers that stay open longer than a configurable threshold are flagged as **Stuck** with
  a warning badge — a quick signal for a missing `unblock()`. Configure via the new
  `stuckThresholdMs` prop on `ActionGuardDevtools` (default: 10000ms).
- New **Stats** tab summarizing the recorded history: total events, per-action counts,
  average/maximum durations, and the most frequent scopes. The aggregation is exposed publicly as
  the `selectEventStats` selector (with the `DevtoolsEventStats` type).
- Styles are now published as a dedicated `./styles.css` export
  (`@okyrychenko-dev/react-action-guard-devtools/styles.css`). Import it once in your app — see the
  Quick Start.

### Changed

- Refactored devtools store selectors onto reusable memoization helpers (`createMemoizedSelector` /
  `createMemoizedSingleInputSelector`), replacing module-level cache state.
- Multiple `ActionGuardDevtools` instances observing the same blocking store now share one
  reference-counted middleware registration. Events are recorded once, and unmounting one instance
  no longer disconnects the others.
- Timeline selection is cleared when the selected event is hidden by a filter or removed after the
  event limit is reduced.
- `package.json` `sideEffects` now allows CSS files (instead of a blanket `false`) so the stylesheet
  is not tree-shaken away by consumer bundlers.
- Updated `@okyrychenko-dev/react-action-guard` compatibility to `^1.0.5` and
  `@okyrychenko-dev/react-zustand-toolkit` to `^0.4.2`.

### Performance

- `addEvent` no longer rescans the full event history to revalidate the timeline selection; it now
  only checks whether the selected event was evicted from the buffer (O(1)).
- Store consumers subscribe only to the state slices they use, reducing avoidable rerenders.

## [0.2.4] - 2026-05-28

### Fixed

- Devtools middleware no longer reports a stale `duration` for blockers removed after a `clear` / `clear_scope`; tracked timestamps are cleared together with the blockers.
- `defaultOpen` is treated as an initial value and no longer resets the panel's open state when other props (e.g. `maxEvents`) change.
- Keyboard shortcuts are now ignored when focus is in `<select>` or `contentEditable` elements (previously only `<input>` / `<textarea>`).
- `setMaxEvents` normalizes invalid input (values ≤ 0 clamp to 1, non-finite values fall back to the default).

### Changed

- Consolidated scope/time/duration formatters into a single internal `src/utils` module.
- Timeline selection is cleared when the selected event is filtered out, not only when it is evicted from the event buffer.

### Removed

- Removed the unused `source` field from the `DevtoolsEvent` type (it was never populated).

## [0.2.3] - 2026-05-27

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.4` line.
- Updated the toolkit dependency and override to `react-zustand-toolkit@^0.4.1`.

## [0.2.2] - 2026-05-09

### Changed

- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.3` line.
- Prepared package metadata for the coordinated `react-action-guard` stability release.

## [0.2.1] - 2026-04-18

### Changed

- Synced local package metadata with `react-zustand-toolkit@0.4.0`
- Raised `@okyrychenko-dev/react-action-guard` compatibility to the `1.0.2` line

## [0.2.0] - 2026-01-25

### Breaking Changes

- ⚠️ **Updated minimum peer dependency versions**:
  - React: `^18.0.0 || ^19.0.0` (removed React 17 support)
- ⬆️ **Updated peer dependency**: `@okyrychenko-dev/react-action-guard` from `^0.6.0` to `^0.7.0`

### Changed

- 🏗️ **Type organization**: Moved `DevtoolsKeyboardAction` and `DevtoolsKeyboardResult` types to `ActionGuardDevtools.types.ts`
- 🔧 **ESLint configuration**: Added `curly: ["error", "all"]` rule
- 📦 **Dependencies**: Updated `@okyrychenko-dev/react-zustand-toolkit` to `^0.2.0`

## [0.1.3] - 2024-12-28

### Documentation

- 📚 **Comprehensive JSDoc documentation** for ActionGuardDevtools component
  - Detailed component description with all features (timeline, filtering, keyboard shortcuts)
  - Props documentation with defaults (position, defaultOpen, maxEvents, showInProduction, store)
  - Performance notes (production behavior, automatic cleanup)
  - 5 usage examples: basic setup, custom position, isolated stores, production override, keyboard shortcuts
- 📝 **devtoolsMiddleware documentation** with integration examples
- 📖 **README improvements** with quick start guide and production safety notes

## [0.1.2] - 2024-12-24

### Changed

- ⬆️ Updated peer dependency: `@okyrychenko-dev/react-action-guard` from `^0.5.0` to `^0.6.0`
  - Support for new middleware events (`clear`, `clear_scope`)
  - Automatically tracks clear operations in timeline
  - Compatible with priority validation and enhanced timeout handling

### Added

- 🧹 Timeline visualization for `clear` and `clear_scope` events
  - Clear events help debug bulk blocker removal operations
  - Scope-specific clears are clearly distinguished with color coding
  - Duration tracking for clear operations
- 🧪 Added 2 new tests for clear event recording

### Removed

- ❌ Removed support for deprecated `cancel` action type

## [0.1.1] - 2024-12-23

### Fixed

- 📚 Documentation improvements
- 🐛 Minor bug fixes

## [0.1.0] - 2024-12-22

### Added

- Initial public release
- Real-time timeline visualization of blocking events
- Active blockers view with priority sorting
- Search by blocker ID or reason
- Event history with configurable limits
- Pause/resume functionality for event recording
- Keyboard shortcuts (Esc, Space, C)
- Detailed event inspection with duration tracking
- Customizable panel positioning (left/right)
- Automatic middleware registration
- Production safety (disabled by default in production)
- TypeScript support with full type definitions
- Zustand-based state management
- Clean, minimalistic UI
- Zero-config setup

### Features

- **Timeline View**: Visual timeline showing all add/remove/update events
- **Active Blockers**: Real-time view of currently active blockers
- **Filtering**: Search by blocker ID or reason
- **Event Details**: Expandable event cards with full configuration
- **Duration Tracking**: Automatic calculation of blocker lifetimes
- **Scope Indicators**: Visual tags for affected scopes
- **Minimizable Panel**: Collapse to show just active blocker count
- **Color Coding**: Green (add), red (remove), yellow (update)

### Technical

- Built with React and TypeScript
- Uses Zustand for state management
- Tree-shakeable exports
- Supports ESM and CommonJS
- Source maps included
- Comprehensive JSDoc documentation

[Unreleased]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/okyrychenko-dev/react-action-guard-devtools/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/okyrychenko-dev/react-action-guard-devtools/releases/tag/v0.1.0
