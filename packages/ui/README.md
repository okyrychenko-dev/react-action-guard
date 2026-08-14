# @okyrychenko-dev/react-action-guard-ui

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Build accessible guarded buttons, fields, links, and groups on top of React Action Guard

`react-action-guard-ui` provides UI-agnostic hooks and state helpers for wiring blocking state into native controls, design systems, and component libraries without framework-specific adapters.

## Why Use It

- Convert `react-action-guard` blockers into accessible control state
- Share blocking scopes through `GuardedScopeProvider` or explicit hook props
- Build guarded buttons, fields, links, and groups without MUI, HeroUI, Radix, or router adapters
- Expose blocking reasons as visible text, helper text, descriptions, or hidden state
- Preserve custom component-library prop shapes with typed state mappers
- Use resolver utilities directly when a hook is not the right abstraction

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
# or
yarn add @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
# or
pnpm add @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) ^1.0.2 - The core UI blocking library
- [React](https://react.dev/) ^18.0.0 || ^19.0.0

Install any peer dependencies required by `@okyrychenko-dev/react-action-guard` according to your package manager's peer dependency behavior.

## Quick Start

Use `useAsyncAction` from the core package to create blockers, then use UI primitives to resolve control state.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";

function SaveButton() {
  const save = useAsyncAction("save-profile", "profile");
  const { buttonState } = useGuardedButton({
    scope: "profile",
    blockedState: "loading",
  });

  return (
    <button
      disabled={buttonState.disabled}
      aria-busy={buttonState.ariaBusy}
      aria-disabled={buttonState.ariaDisabled}
      onClick={() => save(api.saveProfile)}
    >
      {buttonState.loading ? "Saving..." : "Save"}
    </button>
  );
}
```

## Core Concepts

- `GuardedScopeProvider` lets descendant hooks inherit a blocking scope through React context
- Explicit `scope` props are useful for reusable controls, portals into separate React roots, and cross-domain UI
- `useTopBlocker` returns the highest-priority blocker affecting a scope
- `useGuardedAction`, `useGuardedButton`, `useGuardedField`, `useGuardedLink`, and `useGuardedGroup` convert blockers into UI-ready state
- State resolvers are pure helpers for custom hooks, tests, and non-React wrappers

Scope resolution priority:

```txt
explicit scope -> GuardedScopeProvider scope -> global
```

## Core Use Cases

### Disable or show loading for actions

Use `useGuardedAction` or `useGuardedButton` when a command, submit button, toolbar action, or menu item should react to active blockers.

### Guard form controls

Use `useGuardedField` for inputs, textareas, selects, checkboxes, switches, date pickers, and similar controls.

### Prevent blocked navigation

Use `useGuardedLink` when a link-like control should prevent navigation while a scope is blocked.

### Describe blocked regions

Use `useGuardedGroup` for forms, fieldsets, panels, cards, and sections that need container-level ARIA state or reason text.

## Scope Usage

### Provider Scope

Use `GuardedScopeProvider` when several controls belong to the same form, panel, or workflow. Child hooks can omit `scope`; they inherit it from React context.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import {
  GuardedScopeProvider,
  useGuardedButton,
  useGuardedField,
} from "@okyrychenko-dev/react-action-guard-ui";

function ProfileForm() {
  const save = useAsyncAction("save-profile", "profile");

  return (
    <GuardedScopeProvider scope="profile">
      <ProfileNameField />
      <SaveButton onSave={() => save(api.saveProfile)} />
    </GuardedScopeProvider>
  );
}

function ProfileNameField() {
  const { fieldState, reasonContent } = useGuardedField({
    blockedState: "readOnly",
    reasonMode: "helperText",
  });

  return (
    <>
      <input readOnly={fieldState.readOnly} aria-readonly={fieldState.ariaReadOnly} />
      {reasonContent ? <p>{reasonContent}</p> : null}
    </>
  );
}

function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const { buttonState } = useGuardedButton({ blockedState: "loading" });

  return (
    <button disabled={buttonState.disabled} aria-busy={buttonState.ariaBusy} onClick={onSave}>
      {buttonState.loading ? "Saving..." : "Save"}
    </button>
  );
}
```

`GuardedScopeProvider` works through normal React context, so it works across intermediate components as long as the guarded controls render below the provider in the same React tree. Normal React portals preserve context, but components mounted into a separate React root should use explicit scope.

### Explicit Scope

Pass `scope` directly when a control is reusable, rendered outside the provider subtree, or intentionally belongs to a different blocking domain.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton, useGuardedField } from "@okyrychenko-dev/react-action-guard-ui";

function ProfileForm() {
  const save = useAsyncAction("save-profile", "profile");

  return (
    <>
      <ProfileNameField scope="profile" />
      <SaveButton scope="profile" onSave={() => save(api.saveProfile)} />
    </>
  );
}

function ProfileNameField({ scope }: { scope: string }) {
  const { fieldState } = useGuardedField({
    scope,
    blockedState: "readOnly",
  });

  return <input readOnly={fieldState.readOnly} aria-readonly={fieldState.ariaReadOnly} />;
}

function SaveButton({ onSave, scope }: { onSave: () => Promise<void>; scope: string }) {
  const { buttonState } = useGuardedButton({ scope, blockedState: "loading" });

  return (
    <button disabled={buttonState.disabled} aria-busy={buttonState.ariaBusy} onClick={onSave}>
      Save
    </button>
  );
}
```

## API Reference

### Scope Context

#### `<GuardedScopeProvider scope>`

Provides a default guarded scope to descendants.

**Props:**

- `scope: string | readonly string[]` - Scope or scopes inherited by child guarded hooks
- `children: ReactNode` - Subtree that should inherit the scope

`GuardedFormScopeProvider` is an alias of `GuardedScopeProvider` for form-oriented APIs.

#### `useGuardedScope()`

Reads the nearest guarded scope context.

**Returns:** `string | readonly string[] | undefined`

#### `useResolvedGuardedScope(explicitScope?)`

Resolves scope using the package priority rule.

**Parameters:**

- `explicitScope?: string | readonly string[]`

**Returns:** explicit scope, inherited provider scope, or `undefined` so lower-level helpers can fall back to global.

### Hooks

#### `useTopBlocker(scope?)`

Returns blocker metadata for the highest-priority blocker affecting a scope.

**Parameters:**

- `scope?: string | readonly string[]` - Scope or scopes to inspect. Defaults to global behavior when omitted.

**Returns:**

- `status: "idle" | "blocked"`
- `isBlocked: boolean`
- `blockers: readonly BlockerInfo[]`
- `topBlocker: BlockerInfo | null`
- `reason: string | null`

#### `useGuardedAction(options?)`

Generic action-control hook for commands, menu items, toolbar actions, and clickable controls.

**Options:**

- `scope?: string | readonly string[]` - Blocking scope or scopes
- `blockedState?: "disabled" | "loading" | "none"` - How blocked state affects the control (default: `"disabled"`)
- `disabled?: boolean` - Existing disabled state to merge with blocking state
- `loading?: boolean` - Existing loading state to merge with blocking state
- `reasonMode?: "visible" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string` - Fallback reason when the blocker has none
- `reasonId?: string` - ID used for `aria-describedby` when `reasonMode="description"`
- `getActionState?: (state: GuardedActionState) => TActionState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, actionState, reasonContent, ariaDescribedBy }`

#### `useGuardedButton(options?)`

Button-oriented action hook. It accepts the same options as `useGuardedAction`, but uses `getButtonState` for custom mapping and returns `buttonState` instead of `actionState`.

**Options:**

- `scope?: string | readonly string[]` - Blocking scope or scopes
- `blockedState?: "disabled" | "loading" | "none"` - How blocked state affects the button (default: `"disabled"`)
- `disabled?: boolean` - Existing disabled state to merge with blocking state
- `loading?: boolean` - Existing loading state to merge with blocking state
- `reasonMode?: "visible" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string` - Fallback reason when the blocker has none
- `reasonId?: string` - ID used for `aria-describedby` when `reasonMode="description"`
- `getButtonState?: (state: GuardedActionState) => TButtonState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, buttonState, reasonContent, ariaDescribedBy }`

**Example:**

```tsx
const { buttonState, reasonContent } = useGuardedButton({
  scope: "checkout",
  blockedState: "loading",
  reasonMode: "visible",
});
```

#### `useGuardedField(options?)`

Field-control hook for inputs, textareas, selects, checkboxes, switches, date pickers, and similar controls.

**Options:**

- `scope?: string | readonly string[]`
- `blockedState?: "disabled" | "readOnly" | "loading" | "none"` - How blocked state affects the field (default: `"disabled"`)
- `disabled?: boolean`
- `readOnly?: boolean`
- `loading?: boolean`
- `reasonMode?: "helperText" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string`
- `reasonId?: string`
- `getFieldState?: (state: GuardedFieldState) => TFieldState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, fieldState, reasonContent, ariaDescribedBy }`

#### `useGuardedLink(options?)`

Link/navigation-control hook that prevents navigation while blocked.

**Options:**

- `scope?: string | readonly string[]`
- `disabled?: boolean`
- `removeFromTabOrder?: boolean` - Sets `tabIndex=-1` when blocked or disabled
- `stopPropagationWhenBlocked?: boolean` - Stops click propagation when blocked
- `onClick?: MouseEventHandler<TElement>` - Called only when navigation is allowed
- `reasonMode?: "visible" | "description" | "hidden"`
- `reasonFallback?: string`
- `reasonId?: string`

**Returns:** `{ blocker, isBlocked, linkState, onClick, reasonContent, ariaDescribedBy }`

#### `useGuardedGroup(options?)`

Group/container hook for forms, fieldsets, panels, cards, and sections.

**Options:**

- `scope?: string | readonly string[]`
- `reasonMode?: "visible" | "description" | "hidden"`
- `reasonFallback?: string`
- `reasonId?: string`

**Returns:** `{ blocker, isBlocked, groupState, reasonContent, ariaDescribedBy }`

`groupState.ariaDisabled` is descriptive only. It does not disable descendants automatically. Disable child controls individually, or use a native `<fieldset disabled>` when that is the desired behavior.

### State Resolvers

Use resolvers directly when you do not need React hooks or want to build your own wrapper hook.

- `normalizeGuardedScope(scope?)`
- `resolveGuardedActionState({ blockedState, isBlocked, disabled, loading })`
- `resolveGuardedFieldState({ blockedState, isBlocked, disabled, readOnly, loading })`
- `resolveGuardedLinkState({ isBlocked, disabled, removeFromTabOrder })`
- `resolveGuardedGroupState(isBlocked)`

### Styles

#### `visuallyHiddenClassName`

Class name for screen-reader-only text. Prefer this when your project has a no-inline-styles rule.

**Example:**

```tsx
import { visuallyHiddenClassName } from "@okyrychenko-dev/react-action-guard-ui";

<span className={visuallyHiddenClassName}>{reasonContent}</span>
```

Add the CSS once in your app stylesheet:

```css
.visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

#### `visuallyHiddenCss`

CSS text for the same class, useful when your styling system accepts injected global CSS.

#### `visuallyHiddenStyle`

Reusable React `CSSProperties` object for environments where a class is not practical. Prefer `visuallyHiddenClassName` for app code that enforces no inline styles.

**Example:**

```tsx
<span style={visuallyHiddenStyle}>{reasonContent}</span>
```

## TypeScript Support

The package is written in TypeScript and includes full type definitions.

```ts
import type {
  GuardedActionState,
  GuardedFieldState,
  GuardedLinkState,
  GuardedScope,
  UseGuardedButtonReturn,
  UseGuardedFieldReturn,
} from "@okyrychenko-dev/react-action-guard-ui";
```

Custom state mappers preserve their return type without type assertions:

```tsx
const { buttonState } = useGuardedButton({
  scope: "checkout",
  getButtonState: (state) => ({
    isDisabled: state.disabled,
    isLoading: state.loading,
    "aria-busy": state.ariaBusy,
  }),
});

// buttonState is typed as:
// { isDisabled: boolean; isLoading: boolean; "aria-busy": true | undefined }
```

## Package Philosophy

This package intentionally stops at UI primitives. It does not ship MUI, HeroUI, Radix, router, or design-system adapters because those APIs change independently and cannot cover every control a real app needs.

Instead, build small local wrappers around your own components. The library owns blocking semantics, priority, reasons, and ARIA state; your app owns component-library props and visuals.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm run test`)
2. Code is properly typed (`npm run typecheck`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT © Oleksii Kyrychenko
