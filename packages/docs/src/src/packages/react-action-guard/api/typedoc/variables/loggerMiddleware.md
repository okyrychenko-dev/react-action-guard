[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / loggerMiddleware

# Variable: loggerMiddleware

> `const` **loggerMiddleware**: [`Middleware`](../type-aliases/Middleware.md)

Defined in: [src/middleware/loggerMiddleware.ts:59](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/loggerMiddleware.ts#L59)

Built-in middleware for logging all blocking actions to the console.

Logs every blocker action (add, remove, update, timeout, clear) with emoji
indicators and formatted data. Useful for debugging blocking behavior during
development. Automatically disabled in production builds for performance.

Output format: `[UIBlocking] 🔒 blocker-id {scope: "form", reason: "..."}`

Emoji indicators:
- 🔒 Add
- 🔓 Remove
- 🔄 Update
- ⏰ Timeout
- 🧹 Clear/ClearScope

## Examples

Register logger middleware
```ts
import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

// Enable logging for all blocking actions
configureMiddleware([loggerMiddleware]);
```

Console output examples
```
[UIBlocking] 🔒 save-form {scope: "form", reason: "Saving...", priority: 50}
[UIBlocking] 🔄 save-form {scope: "form", reason: "Almost done..."}
[UIBlocking] 🔓 save-form {reason: "Saving..."}
[UIBlocking] ⏰ api-timeout {timeout: 30000}
```

Production check pattern
```ts
import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';
\n * const middlewares = [];
\n * if (process.env.NODE_ENV !== 'production') {
  middlewares.push(loggerMiddleware);
}
\n * configureMiddleware(middlewares);
```

## See

 - [configureMiddleware](../functions/configureMiddleware.md) for registering middleware
 - [Middleware](../type-aliases/Middleware.md) for middleware function signature
 - [MiddlewareContext](../interfaces/MiddlewareContext.md) for available context data

## Since

1.0.0
