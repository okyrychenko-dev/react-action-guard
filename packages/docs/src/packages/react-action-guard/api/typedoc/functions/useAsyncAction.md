[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useAsyncAction

# Function: useAsyncAction()

> **useAsyncAction**\<`T`\>(`actionId`, `scope?`, `options?`): (`asyncFn`) => `Promise`\<`T`\>

Defined in: [src/hooks/useAsyncAction/useAsyncAction.ts:142](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useAsyncAction/useAsyncAction.ts#L142)

Wraps async functions with automatic UI blocking during execution.

Creates a wrapper function that automatically:
1. Adds a blocker before executing the async function
2. Executes the async function
3. Removes the blocker after completion (success or failure)

Each invocation generates a unique blocker ID (actionId-counter), allowing
multiple concurrent executions of the same action without ID conflicts.
The blocker is removed even if the async function throws an error.

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Type Parameters

### T

`T` = `unknown`

The return type of the async function being wrapped

## Parameters

### actionId

`string`

Base identifier for the action. Used in blocker ID and default reason.
                  Example: "saveForm", "fetchData", "submitOrder"

### scope?

Scope(s) to block during execution. Can be a single scope or array.
               Defaults to "global" if not specified.

`string` | readonly `string`[]

### options?

[`UseAsyncActionOptions`](../interfaces/UseAsyncActionOptions.md)

Optional configuration

## Returns

Wrapper function that accepts an async function and returns a Promise with the same type

> (`asyncFn`): `Promise`\<`T`\>

### Parameters

#### asyncFn

() => `Promise`\<`T`\>

### Returns

`Promise`\<`T`\>

## Examples

Basic form submission
```tsx
function MyForm() {
  const executeWithBlocking = useAsyncAction('saveForm', 'form');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await executeWithBlocking(async () => {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      return response.json();
    });
    
    alert('Form saved!');
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

With timeout and error handling
```tsx
const executeWithBlocking = useAsyncAction(
  'fetchData',
  ['global', 'data'],
  {
    timeout: 30000, // 30 seconds
    onTimeout: (blockerId) => {
      console.warn(`Operation ${blockerId} timed out`);
    }
  }
);

const loadData = async () => {
  try {
    const data = await executeWithBlocking(async () => {
      return await fetchDataFromAPI();
    });
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    // Blocker is automatically removed even on error
  }
};
```

Multiple concurrent actions
```tsx
function FileUploader() {
  const uploadWithBlocking = useAsyncAction('upload', 'uploads');
  
  const uploadFiles = async (files) => {
    // Each upload gets unique blocker ID (upload-1, upload-2, etc.)
    const promises = files.map(file =>
      uploadWithBlocking(() => uploadFile(file))
    );
    
    await Promise.all(promises);
  };
  
  return <...>;
}
```

Type-safe return value
```tsx
interface UserData {
  id: string;
  name: string;
}

function UserProfile() {
  const executeWithBlocking = useAsyncAction<UserData>('fetchUser', 'user');
  
  const loadUser = async (userId: string) => {
    const userData = await executeWithBlocking(async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json(); // TypeScript knows this is UserData
    });
    
    // userData is typed as UserData
    console.log(userData.name);
  };
  
  return <...>;
}
```

## See

 - [useBlocker](useBlocker.md) for manual blocker management
 - [useIsBlocked](useIsBlocked.md) to check blocking state
 - [UseAsyncActionOptions](../interfaces/UseAsyncActionOptions.md) for available options

## Since

0.6.0
