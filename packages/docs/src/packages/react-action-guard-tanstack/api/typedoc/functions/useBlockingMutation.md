[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingMutation

# Function: useBlockingMutation()

> **useBlockingMutation**\<`TData`, `TError`, `TVariables`, `TContext`\>(`options`): `UseMutationResult`\<`TData`, `TError`, `TVariables`, `TContext`\>

Defined in: [src/hooks/useBlockingMutation.ts:207](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingMutation.ts#L207)

A drop-in replacement for TanStack Query's `useMutation` with automatic UI blocking.

This hook wraps TanStack Query's `useMutation` and automatically blocks the UI during
mutation execution. Unlike queries, mutations typically block during the pending state
by default (priority: 30) since they represent user actions that should prevent
concurrent operations.

Optionally, you can also block during error states to keep the UI blocked during
automatic retries or while displaying error messages.

Works with both the global UI blocking store and isolated provider instances.

## Type Parameters

### TData

`TData` = `unknown`

The type of data returned by the mutation

### TError

`TError` = `Error`

The type of error that can be thrown (default: Error)

### TVariables

`TVariables` = `void`

The type of variables passed to the mutation (default: void)

### TContext

`TContext` = `unknown`

The type of context for optimistic updates (default: unknown)

## Parameters

### options

[`UseBlockingMutationOptions`](../interfaces/UseBlockingMutationOptions.md)\<`TData`, `TError`, `TVariables`, `TContext`\>

Combined TanStack Query mutation options and blocking configuration

## Returns

`UseMutationResult`\<`TData`, `TError`, `TVariables`, `TContext`\>

Mutation result object from TanStack Query (same as `useMutation`)

## Examples

Multi-component coordination - one mutation, many reactions
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Component A: Mutation triggers blocking
function SaveButton() {
  const mutation = useBlockingMutation({
    mutationFn: saveUserData,
    blockingConfig: {
      scope: 'user-edit',
      reasonOnPending: 'Saving changes...',
      priority: 50,
    }
  });
  
  // mutation.mutate(data) blocks 'user-edit' scope
  return null;
}

// Components B, C, D all react automatically
function FormInputs() {
  const isBlocked = useIsBlocked('user-edit');
  // Disable all inputs during save
  return null;
}

function CancelButton() {
  const isBlocked = useIsBlocked('user-edit');
  // Disable cancel during save
  return null;
}

function NavigationWarning() {
  const isBlocked = useIsBlocked('user-edit');
  // Show "Save in progress..." if user tries to navigate
  return null;
}

// No prop drilling needed! 🎯
```

Priority system - mutations block with higher priority
```ts
import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

// Mutation default priority: 30 (higher than queries: 10)
function ProcessPayment() {
  const mutation = useBlockingMutation({
    mutationFn: processPayment,
    blockingConfig: {
      scope: 'checkout',
      reasonOnPending: 'Processing payment...',
      priority: 100, // HIGHEST priority - blocks everything
    }
  });
  return null;
}

// Even high-priority queries are blocked
function LoadCheckoutData() {
  const query = useBlockingQuery({
    queryKey: ['checkout'],
    queryFn: fetchCheckout,
    blockingConfig: {
      scope: 'checkout',
      priority: 80, // Lower than payment mutation
    }
  });
  // Query won't block if payment is processing
  return null;
}

// Check which blocker is active
function StatusDisplay() {
  const blockers = useBlockingInfo('checkout');
  const topBlocker = blockers[0]; // Sorted by priority
  
  // topBlocker.reason === "Processing payment..." (priority 100)
  // Lower priority blockers are hidden
  
  return null;
}
```

Error handling - block during retries
```ts
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function CriticalUpdate() {
  const mutation = useBlockingMutation({
    mutationFn: updateCriticalData,
    retry: 3,
    retryDelay: 1000,
    blockingConfig: {
      scope: 'critical-update',
      reasonOnPending: 'Updating...',
      reasonOnError: 'Update failed, retrying...',
      onError: true, // Keep blocking during retries ✅
      priority: 80,
    }
  });
  return null;
}

function UpdateStatus() {
  const blockers = useBlockingInfo('critical-update');
  
  if (blockers.length > 0) {
    // Shows "Updating..." then "Update failed, retrying..."
    // User understands what's happening vs stuck UI
    return null;
  }
  return null;
}
```

Multiple scopes - coordinate entire app during critical operation
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function CheckoutSubmit() {
  const mutation = useBlockingMutation({
    mutationFn: submitOrder,
    blockingConfig: {
      // Block EVERYTHING during checkout
      scope: ['checkout', 'navigation', 'forms', 'actions'],
      reasonOnPending: 'Processing your order...',
      priority: 100,
      timeout: 60000,
    }
  });
  return null;
}

// Different parts of app check their relevant scopes
function Header() {
  const navBlocked = useIsBlocked('navigation');
  // Disable all navigation
  return null;
}

function SideCart() {
  const actionsBlocked = useIsBlocked('actions');
  // Disable cart modifications
  return null;
}

function CheckoutForm() {
  const formsBlocked = useIsBlocked('forms');
  // Disable all form inputs
  return null;
}

// One mutation coordinates entire app! 🎯
```

## See

 - [TanStack Query useMutation docs](https://tanstack.com/query/latest/docs/react/reference/useMutation)
 - [useBlockingQuery](useBlockingQuery.md) for queries with blocking
 - [useBlockingInfiniteQuery](useBlockingInfiniteQuery.md) for infinite queries with blocking

## Since

0.6.0
