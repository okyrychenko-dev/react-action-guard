[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useConfirmableBlocker

# Function: useConfirmableBlocker()

> **useConfirmableBlocker**(`blockerId`, `config`): [`UseConfirmableBlockerReturn`](../interfaces/UseConfirmableBlockerReturn.md)

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.ts#L17)

Creates a blocker that requires user confirmation before executing an action.

## Parameters

### blockerId

`string`

### config

[`ConfirmableBlockerConfig`](../interfaces/ConfirmableBlockerConfig.md)

## Returns

[`UseConfirmableBlockerReturn`](../interfaces/UseConfirmableBlockerReturn.md)

## Since

0.6.0

## See

 - [useActionBlocker](useActionBlocker.md) for simple blocking without confirmation
 - [ConfirmableBlockerConfig](../interfaces/ConfirmableBlockerConfig.md) for configuration options
 - [UseConfirmableBlockerReturn](../interfaces/UseConfirmableBlockerReturn.md) for return value structure
