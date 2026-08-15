[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / MutationBlockingConfig

# Type Alias: MutationBlockingConfig

> **MutationBlockingConfig** = `MutationBlockingConfigWithoutError` \| `MutationBlockingConfigWithError`

Defined in: [src/hooks/useBlockingMutation.types.ts:67](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingMutation.types.ts#L67)

Discriminated union for mutation blocking configuration.
Type-safe configuration that prevents using reasonOnError when onError is false.

Use `onError: false` (or omit) to only block during mutation execution.
Use `onError: true` to also block when mutation fails.
