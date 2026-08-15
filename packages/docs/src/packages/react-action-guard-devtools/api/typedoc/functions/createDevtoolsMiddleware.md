[**React Action Guard DevTools API v0.1.2**](../README.md)

***

[React Action Guard DevTools API](../README.md) / createDevtoolsMiddleware

# Function: createDevtoolsMiddleware()

> **createDevtoolsMiddleware**(): `Middleware`

Defined in: [src/middleware/devtoolsMiddleware.ts:57](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/middleware/devtoolsMiddleware.ts#L57)

Creates the devtools middleware that captures and records UI blocking events.

This middleware intercepts all blocking events (add, remove, timeout, clear) and
forwards them to the devtools store for visualization in the ActionGuardDevtools panel.

The middleware calculates the duration of each blocker by tracking when it was added
and when it was removed/timed out, providing insights into how long UI was blocked.

**Note:** This middleware is automatically registered when you use the `ActionGuardDevtools`
component. You typically don't need to call this function directly unless you're manually
managing middleware registration.

## Returns

`Middleware`

Middleware function that can be registered with `configureMiddleware` or `registerMiddleware`

## Examples

Manual middleware registration (advanced usage)
```tsx
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';
import { createDevtoolsMiddleware, DEVTOOLS_MIDDLEWARE_NAME } from '@okyrychenko-dev/react-action-guard-devtools';

// Register manually
const middleware = createDevtoolsMiddleware();
uiBlockingStoreApi.getState().registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);

// Cleanup
uiBlockingStoreApi.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
```

Automatic registration (recommended)
```tsx
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

// Middleware registered automatically when component mounts
function App() {
  return (
    <>
      <YourApp />
      <ActionGuardDevtools />
    </>
  );
}
```

## See

 - [ActionGuardDevtools](ActionGuardDevtools.md) for automatic middleware registration
 - [Middleware documentation](https://github.com/okyrychenko-dev/react-action-guard#middleware)

## Since

0.6.0
