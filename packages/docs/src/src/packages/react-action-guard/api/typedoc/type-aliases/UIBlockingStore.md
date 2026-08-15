[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / UIBlockingStore

# Type Alias: UIBlockingStore

> **UIBlockingStore** = `UIBlockingStoreState` & [`UIBlockingStoreActions`](../interfaces/UIBlockingStoreActions.md)

Defined in: [src/store/uiBlockingStore.types.ts:185](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L185)

Complete UI blocking store type combining state and actions.

This is the full store interface used by hooks like [useUIBlockingStore](../variables/useUIBlockingStore.md)
and accessible via [uiBlockingStoreApi](../variables/uiBlockingStoreApi.md). It combines all state properties
from UIBlockingStoreState with all action methods from [UIBlockingStoreActions](../interfaces/UIBlockingStoreActions.md).

## Example

Using the complete store
```ts
import { useUIBlockingStore } from '@okyrychenko-dev/react-action-guard';

function MyComponent() {
  const store = useUIBlockingStore();
  
  // Access state
  console.log(store.activeBlockers.size);
  
  // Call actions
  store.addBlocker('my-blocker', { scope: 'form' });
  
  return <div>...</div>;
}
```

## Since

1.0.0
