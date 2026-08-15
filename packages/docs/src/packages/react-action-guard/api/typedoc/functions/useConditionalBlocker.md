[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useConditionalBlocker

# Function: useConditionalBlocker()

> **useConditionalBlocker**\<`TState`\>(`blockerId`, `config`): `void`

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.ts:153](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.ts#L153)

Blocks UI based on a dynamic condition that is periodically evaluated.

Periodically checks a condition function and automatically adds or removes
a blocker based on the result. Useful for blocking based on application state,
network status, feature flags, or any other dynamic condition.

The condition function receives optional state and returns a boolean.
It's evaluated immediately on mount and then at the specified interval.
The blocker is added/removed automatically as the condition changes.

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Type Parameters

### TState

`TState` = `unknown`

Type of the state object passed to the condition function

## Parameters

### blockerId

`string`

Unique identifier for this conditional blocker

### config

[`ConditionalBlockerConfig`](../interfaces/ConditionalBlockerConfig.md)\<`TState`\>

Configuration for conditional blocking

## Returns

`void`

## Examples

Block based on network status
```tsx
function OfflineBlocker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useConditionalBlocker('offline', {
    condition: () => !isOnline,
    state: { isOnline },
    checkInterval: 500, // Check every 500ms
    scope: 'global',
    reason: 'No internet connection. Please check your network.',
    priority: 95
  });
  
  return <App />;
}
```

Block based on feature flag
```tsx
function FeatureFlagBlocker() {
  const featureFlags = useFeatureFlags();
  
  useConditionalBlocker('feature-disabled', {
    condition: (state) => !state.featureFlags.newFeatureEnabled,
    state: { featureFlags },
    checkInterval: 5000, // Check every 5 seconds
    scope: 'new-feature',
    reason: 'This feature is currently disabled',
    priority: 70
  });
  
  return <NewFeature />;
}
```

Block during API rate limit
```tsx
function RateLimitBlocker() {
  const [requestCount, setRequestCount] = useState(0);
  const [resetTime, setResetTime] = useState<number | null>(null);
  
  useConditionalBlocker('rate-limit', {
    condition: (state) => {
      if (!state.resetTime) {
        return false;
      }
      return Date.now() < state.resetTime && state.requestCount >= 100;
    },
    state: { requestCount, resetTime },
    checkInterval: 1000,
    scope: 'api',
    reason: 'API rate limit reached. Please wait.',
    priority: 90
  });
  
  return <Dashboard />;
}
```

Block based on form validation
```tsx
function FormValidationBlocker() {
  const { formState } = useFormContext();
  
  useConditionalBlocker('invalid-form', {
    condition: (state) => !state.isValid && state.isDirty,
    state: formState,
    checkInterval: 500,
    scope: 'form-submit',
    reason: 'Please fix form errors before submitting',
    priority: 60
  });
  
  return <Form />;
}
```

Without state parameter (simple condition)
```tsx
useConditionalBlocker('low-battery', {
  condition: () => {
    // Check battery level if available
    if ('getBattery' in navigator) {
      return navigator.getBattery().then(b => b.level < 0.05);
    }
    return false;
  },
  checkInterval: 30000, // Check every 30 seconds
  scope: 'heavy-operations',
  reason: 'Battery level too low for this operation',
  priority: 80
});
```

## See

 - [useBlocker](useBlocker.md) for simple conditional blocking with boolean
 - [useScheduledBlocker](useScheduledBlocker.md) for time-based blocking
 - [ConditionalBlockerConfig](../interfaces/ConditionalBlockerConfig.md) for configuration options

## Since

0.6.0
