# UI public reference

Import through the supported public entries described in the [integration guide](./).

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

Add `visuallyHiddenCss` once in your app stylesheet.

#### `visuallyHiddenCss`

CSS text for the same class, useful when your styling system accepts injected global CSS.

#### `visuallyHiddenStyle`

Reusable React `CSSProperties` object for environments where a class is not practical. Prefer `visuallyHiddenClassName` for app code that enforces no inline styles.

For executable examples, follow the integration guide and its linked workflow pages.
