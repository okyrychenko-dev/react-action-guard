[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / UIBlockingProviderProps

# Interface: UIBlockingProviderProps

Defined in: [src/context/UIBlockingContext.tsx:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/context/UIBlockingContext.tsx#L18)

Props for the [UIBlockingProvider](../functions/UIBlockingProvider.md) component.

Configures an isolated UI blocking store instance for a subtree of your app.
Useful for SSR, testing, micro-frontends, or any scenario where you need
independent blocking state.

## Since

0.6.0

## Properties

### children

> **children**: `ReactNode`

Defined in: [src/context/UIBlockingContext.tsx:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/context/UIBlockingContext.tsx#L19)

***

### middlewares?

> `optional` **middlewares**: readonly [`Middleware`](../type-aliases/Middleware.md)[]

Defined in: [src/context/UIBlockingContext.tsx:20](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/context/UIBlockingContext.tsx#L20)

Initial middlewares to register
