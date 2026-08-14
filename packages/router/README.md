# @okyrychenko-dev/react-action-guard-router

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-router.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-router)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-router.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Router integration for React Action Guard - navigation blocking for React Router, Remix, TanStack Router, and Next.js

## Features

- 🛣️ **Multi-Router Support** - React Router v6+, Remix, TanStack Router, Next.js Pages Router, and best-effort App Router support
- 🎯 **Scope-Based Blocking** - Synchronize navigation blocking with UI blocking scopes
- 🚦 **Condition-Based Blocking** - Block based on boolean conditions or functions
- 💬 **Custom Dialog Support** - `useDialogState` helper for async confirmation dialogs
- 🌐 **Browser Protection** - Prevents tab close/refresh with `beforeunload` events
- 🔄 **Sync & Async Handlers** - Support for both synchronous and Promise-based confirmations
- 📦 **Tree-Shakeable** - Import only the router adapter you need
- 🔒 **TypeScript-Friendly** - Strong editor support and typed router adapters
- 🧹 **Auto Cleanup** - Automatic listener cleanup on component unmount

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-router @okyrychenko-dev/react-action-guard
# or
yarn add @okyrychenko-dev/react-action-guard-router @okyrychenko-dev/react-action-guard
# or
pnpm add @okyrychenko-dev/react-action-guard-router @okyrychenko-dev/react-action-guard
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) ^1.0.1 - The core UI blocking library
- [React](https://react.dev/) ^18.0.0 || ^19.0.0
- One of:
  - [react-router-dom](https://reactrouter.com/) ^6.0.0 - For React Router or Remix
  - [@tanstack/react-router](https://tanstack.com/router) ^1.0.0 - For TanStack Router
  - [next](https://nextjs.org/) ^13.4.0 - For Next.js Pages Router and best-effort App Router support
- [Zustand](https://zustand-demo.pmnd.rs/) - State management (peer dependency of react-action-guard)

## Quick Start

### Basic Usage with react-action-guard

The most powerful pattern - synchronize navigation blocking with UI blocking:

```tsx
import { useBlocker } from '@okyrychenko-dev/react-action-guard';
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';

function PaymentForm() {
  const [isProcessing, setIsProcessing] = useState(false);

  // Block UI during payment processing
  useBlocker('payment-processing', {
    scope: 'checkout',
    reason: 'Processing payment...',
  }, isProcessing);

  // Block navigation when the same scope is active
  useNavigationBlocker({
    scope: 'checkout',
    message: 'Payment is processing. Please wait.',
  });

  // When isProcessing = true, both UI and navigation are blocked
}
```

### Simple Condition-Based Blocking

For basic usage without react-action-guard scopes:

```tsx
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';

function EditForm() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useNavigationBlocker({
    when: hasUnsavedChanges,
    message: 'You have unsaved changes. Leave anyway?',
  });
}
```

## API Reference

### Hooks

#### `useNavigationBlocker(options)`

Blocks navigation in router applications based on conditions or scope state.

**Parameters:**

- `options: UseNavigationBlockerOptions`
  - `when?: boolean | (() => boolean)` - Condition to activate blocking
  - `scope?: string | string[]` - Scope(s) from react-action-guard to monitor
  - `message?: string` - Confirmation dialog message
  - `onConfirm?: (message: string) => boolean | PromiseLike<boolean>` - Custom confirmation handler, called once per blocked navigation attempt
  - `onBlock?: () => void` - Callback when navigation is blocked
  - `onAllow?: () => void` - Callback when navigation is allowed
  - `blockBrowserUnload?: boolean` - Block tab close/refresh (default: `true`)

**Returns:** `{ isBlocking: boolean; isIntercepting?: boolean }`

- `isBlocking` - Blocking condition is armed for this adapter
- `isIntercepting?: boolean` - Active interception state when the router can expose it

**Available in:**
- `@okyrychenko-dev/react-action-guard-router/react-router` - React Router v6+ & Remix
- `@okyrychenko-dev/react-action-guard-router/tanstack-router` - TanStack Router
- `@okyrychenko-dev/react-action-guard-router/nextjs` - Next.js Pages & App Router

**Examples:**

```tsx
// Scope-based blocking
useNavigationBlocker({
  scope: 'form',
  message: 'You have unsaved changes',
});

// Condition-based blocking
useNavigationBlocker({
  when: hasChanges,
  message: 'Discard changes?',
  onBlock: () => console.log('Navigation blocked'),
  onAllow: () => console.log('Navigation allowed'),
});

// Multiple scopes
useNavigationBlocker({
  scope: ['form', 'validation'],
  message: 'Form is being validated',
});

// Function condition
useNavigationBlocker({
  when: () => formIsDirty() || hasUnsavedData(),
  message: 'You have unsaved work',
});
```

#### `useDialogState<TMessage = string>()`

Helper hook for managing custom confirmation dialogs.

**Parameters:** None

**Returns:**
- `dialogState: DialogState<TMessage> | null` - Current dialog state
  - `message: TMessage` - The message passed to confirm
  - `isOpen: boolean` - Whether dialog is open
  - `resolve: (value: boolean) => void` - Internal resolver
- `confirm: (message: TMessage) => Promise<boolean>` - Show dialog, returns Promise
- `onConfirm: () => void` - Resolve dialog with `true`
- `onCancel: () => void` - Resolve dialog with `false`

**Example:**

```tsx
import { useNavigationBlocker, useDialogState } from '@okyrychenko-dev/react-action-guard-router/react-router';

function MyComponent() {
  const [hasChanges, setHasChanges] = useState(false);
  const { dialogState, confirm, onConfirm, onCancel } = useDialogState();

  useNavigationBlocker({
    when: hasChanges,
    onConfirm: confirm,  // Returns Promise<boolean>
  });

  return (
    <>
      <form>...</form>
      {dialogState && (
        <CustomDialog
          message={dialogState.message}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </>
  );
}
```

**Custom message types:**

```tsx
interface CustomMessage {
  title: string;
  body: string;
  severity: 'warning' | 'error';
}

const { dialogState, confirm } = useDialogState<CustomMessage>();

useNavigationBlocker({
  when: isDirty,
  onConfirm: () => confirm({
    title: 'Unsaved Changes',
    body: 'Your work will be lost',
    severity: 'warning',
  }),
});
```

#### `usePrompt(message, when)` (React Router only)

Simple API similar to React Router v5's `usePrompt`.

**Parameters:**
- `message: string` - Confirmation message
- `when: boolean` - Condition to activate blocking

**Example:**

```tsx
import { usePrompt } from '@okyrychenko-dev/react-action-guard-router/react-router';

function MyForm() {
  const [hasChanges, setHasChanges] = useState(false);
  usePrompt('You have unsaved changes', hasChanges);
}
```

#### `useBeforeUnload(when, message?)`

Standalone hook for blocking browser unload events (tab close, refresh).

**Parameters:**
- `when: boolean` - Condition to activate blocking
- `message?: string` - Optional custom message (default: "Are you sure you want to leave?")

**Example:**

```tsx
import { useBeforeUnload } from '@okyrychenko-dev/react-action-guard-router';

function MyComponent() {
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  useBeforeUnload(hasUnsavedWork, 'You have unsaved work');
}
```

This utility works independently of any router and can be used in any React application.

---

## Router-Specific Notes

### React Router (& Remix)

Full support with React Router v6's `useBlocker` hook.

```tsx
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';

function MyComponent() {
  useNavigationBlocker({
    when: isDirty,
    message: 'Discard changes?',
  });
}
```

> **Note:** Remix uses React Router v6 internally, so the React Router adapter works seamlessly in Remix applications.
> `isIntercepting` is available here because React Router exposes blocker state directly.

### TanStack Router

Full support with TanStack Router's history blocking.

```tsx
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/tanstack-router';

function MyComponent() {
  useNavigationBlocker({
    when: isDirty,
    message: 'Discard changes?',
  });
}
```

Async `onConfirm` is supported and evaluated once per blocked navigation attempt.

### Next.js Pages Router

Full support with Next.js router events.

```tsx
// pages/edit.tsx
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';

function EditPage() {
  useNavigationBlocker({
    when: isDirty,
    message: 'Discard changes?',
  });
}
```

**Async `onConfirm` behavior:**  
Pages Router does not allow pausing transitions. When you return a Promise from `onConfirm`, the hook cancels the current navigation and re-attempts it via `router.push(url)` if confirmed. This may not preserve original transition options (e.g., `shallow`, `scroll`, `locale`).

### Next.js App Router

Best-effort support only. Browser unload protection works, but App Router does not expose an official navigation-blocking API.

```tsx
// app/edit/page.tsx
'use client';

import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';

function EditPage() {
  useNavigationBlocker({
    when: isDirty,
    message: 'You have unsaved changes',
  });
}
```

**App Router Limitations:**
- ✅ Browser back/forward/close/refresh are blocked
- ❌ `<Link>` component navigation is NOT blocked
- ❌ `router.push()` is NOT blocked

For full navigation blocking support, use Pages Router.

## Adapter Capabilities

| Adapter | `isBlocking` meaning | `isIntercepting` | Async `onConfirm` | Caveats |
| --- | --- | --- | --- | --- |
| React Router | Blocking condition is armed | Yes | Yes | Best semantic fidelity |
| TanStack Router | Blocking condition is armed | No | Yes | Depends on history.block integration |
| Next.js Pages Router | Blocking condition is armed | No | Yes | Re-attempts confirmed navigation with `router.push(url)` |
| Next.js App Router | Blocking condition is armed | No | Best effort only | No official blocker API from Next.js |

---

## Use Cases

### Form Validation

```tsx
function SignupForm() {
  const [formData, setFormData] = useState({});
  const isDirty = Object.keys(formData).length > 0;

  useNavigationBlocker({
    when: isDirty,
    message: 'Your signup progress will be lost. Continue?',
  });
}
```

### Multi-Step Wizard

```tsx
function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Block UI during submission
  useBlocker('wizard-submit', {
    scope: 'wizard',
    reason: 'Submitting form...',
  }, isSubmitting);

  // Block navigation during submission OR if wizard incomplete
  useNavigationBlocker({
    scope: 'wizard',
    when: currentStep < 5,
    message: `You're on step ${currentStep}/5. Exit wizard?`,
  });
}
```

### E-Commerce Checkout

```tsx
import { useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';

function CheckoutPage() {
  const paymentMutation = useBlockingMutation({
    mutationFn: processPayment,
    blockingConfig: { scope: 'checkout' },
  });

  useNavigationBlocker({
    scope: 'checkout',
    message: 'Payment is processing. Leaving will cancel the transaction.',
  });
}
```

### File Upload with Progress

```tsx
function FileUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  useNavigationBlocker({
    when: isUploading,
    message: `Upload ${uploadProgress}% complete. Cancel upload?`,
    onBlock: () => pauseUpload(),
  });
}
```

---

## TypeScript

TypeScript-friendly API surface:

```typescript
import type {
  // Core types
  UseNavigationBlockerOptions,
  NavigationBlockerReturn,
  DialogState,
  ConfirmationResult,
  ConfirmationCallbacks,
} from '@okyrychenko-dev/react-action-guard-router';

// Router-specific types
import type { UseNavigationBlockerOptions } from '@okyrychenko-dev/react-action-guard-router/react-router';
```

**Typed scopes with `react-action-guard`:**

```tsx
import { createTypedHooks } from '@okyrychenko-dev/react-action-guard';

type AppScopes = 'form' | 'checkout' | 'navigation';
const { useBlocker } = createTypedHooks<AppScopes>();

function MyComponent() {
  useBlocker('id', { scope: 'form' });  // ✅ Typed in the core package

  useNavigationBlocker({
    scope: 'form',  // ✅ Reuses the same scope values cleanly
    message: 'Leave form?',
  });
}
```

---

## Bundle Size

Tree-shakeable by router adapter. Import only what you need:

```tsx
// Only React Router code is bundled
import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';
```

**Approximate sizes (minified):**
- Core utilities: ~2 KB
- React Router adapter: ~2.5 KB
- TanStack Router adapter: ~2.5 KB
- Next.js adapter: ~3 KB

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build the package
npm run build

# Type checking
npm run typecheck

# Lint
npm run lint

# Fix lint errors
npm run lint:fix
```

---

## Related Packages

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) - Core UI blocking library
- [@okyrychenko-dev/react-action-guard-tanstack](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack) - TanStack Query integration
- [@okyrychenko-dev/react-action-guard-devtools](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools) - DevTools extension

---

## Contributing

Contributions are welcome! Please ensure:

1. Tests pass (`npm run test:run`)
2. Code is properly typed (`npm run typecheck`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

---

## License

MIT © [Oleksii Kyrychenko](https://github.com/okyrychenko-dev)
