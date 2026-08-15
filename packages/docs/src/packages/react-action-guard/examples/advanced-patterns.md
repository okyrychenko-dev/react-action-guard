# Advanced Patterns

Advanced usage patterns and techniques for React Action Guard.

## Table of Contents

[[toc]]

## Confirmable Actions

### Delete Confirmation Pattern

```tsx
import { useConfirmableBlocker } from '@okyrychenko-dev/react-action-guard';

interface DeleteButtonProps {
  itemId: string;
  itemName: string;
  onDeleted: () => void;
}

function DeleteButton({ itemId, itemName, onDeleted }: DeleteButtonProps) {
  const {
    execute,
    isDialogOpen,
    isExecuting,
    confirmConfig,
    onConfirm,
    onCancel,
  } = useConfirmableBlocker(`delete-${itemId}`, {
    scope: ['global', 'data-table'],
    priority: 100,
    confirmMessage: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    confirmTitle: 'Delete Item',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    onConfirm: async () => {
      await api.deleteItem(itemId);
      showNotification('Item deleted successfully', 'success');
      onDeleted();
    },
    onCancel: () => {
      analytics.track('delete_cancelled', { itemId });
    },
  });
  
  return (
    <>
      <button
        onClick={execute}
        className="btn-danger"
        disabled={isExecuting}
      >
        {isExecuting ? 'Deleting...' : 'Delete'}
      </button>
      
      {isDialogOpen && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          onConfirm={onConfirm}
          onCancel={onCancel}
          destructive
        />
      )}
    </>
  );
}
```

### Multi-Step Confirmation

```tsx
function DangerousAction() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'verify' | 'executing'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  
  useBlocker('dangerous-action', {
    scope: 'global',
    priority: 1000,
    reason: 'Executing dangerous action...',
  }, step === 'executing');
  
  const execute = async () => {
    // Step 1: Initial confirmation
    setStep('confirm');
  };
  
  const handleConfirm = () => {
    // Step 2: Request verification
    sendVerificationEmail();
    setStep('verify');
  };
  
  const handleVerify = async () => {
    if (verificationCode === expectedCode) {
      setStep('executing');
      try {
        await performDangerousAction();
        showNotification('Action completed', 'success');
        setStep('idle');
      } catch (error) {
        showNotification('Action failed', 'error');
        setStep('idle');
      }
    } else {
      showNotification('Invalid verification code', 'error');
    }
  };
  
  return (
    <>
      <button onClick={execute}>Execute Dangerous Action</button>
      
      {step === 'confirm' && (
        <ConfirmDialog
          title="Confirm Action"
          message="This is a dangerous action. Are you sure?"
          onConfirm={handleConfirm}
          onCancel={() => setStep('idle')}
        />
      )}
      
      {step === 'verify' && (
        <VerificationDialog
          message="Enter the verification code sent to your email"
          value={verificationCode}
          onChange={setVerificationCode}
          onVerify={handleVerify}
          onCancel={() => setStep('idle')}
        />
      )}
    </>
  );
}
```

## Scheduled Blocking

### Maintenance Window

```tsx
function MaintenanceScheduler() {
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<{
    start: Date;
    duration: number;
  } | null>(null);
  
  // Block during scheduled maintenance
  useScheduledBlocker('maintenance-window', {
    scope: 'global',
    priority: 1000,
    reason: 'System maintenance in progress. Service will resume shortly.',
    schedule: maintenanceSchedule ? {
      start: maintenanceSchedule.start,
      duration: maintenanceSchedule.duration,
    } : { start: new Date(0), duration: 0 }, // Inactive
    onScheduleStart: () => {
      console.log('Maintenance started');
      showNotification('Maintenance mode active', 'info', { duration: null });
      
      // Disconnect websockets
      websocket.disconnect();
      
      // Save any pending data
      savePendingData();
    },
    onScheduleEnd: () => {
      console.log('Maintenance completed');
      showNotification('System is back online', 'success');
      
      // Reconnect
      websocket.connect();
      
      // Refresh data
      queryClient.invalidateQueries();
    },
  });
  
  // Admin function to schedule maintenance
  const scheduleMaintenance = (startTime: Date, durationMs: number) => {
    setMaintenanceSchedule({
      start: startTime,
      duration: durationMs,
    });
    
    // Notify users
    showNotification(
      `Maintenance scheduled for ${startTime.toLocaleString()}`,
      'warning'
    );
  };
  
  return <AdminPanel onSchedule={scheduleMaintenance} />;
}
```

### Business Hours Enforcement

```tsx
function BusinessHoursGuard() {
  const isBusinessHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Monday-Friday, 9 AM - 5 PM
    const isWeekday = day >= 1 && day <= 5;
    const isDuringHours = hour >= 9 && hour < 17;
    
    return isWeekday && isDuringHours;
  };
  
  useConditionalBlocker('business-hours', {
    scope: ['transactions', 'payments'],
    priority: 90,
    reason: 'Service available Monday-Friday, 9 AM - 5 PM',
    condition: () => !isBusinessHours(),
    checkInterval: 60000, // Check every minute
  });
  
  return (
    <div>
      {!isBusinessHours() && (
        <Banner type="warning">
          Transaction services are only available during business hours
          (Monday-Friday, 9 AM - 5 PM)
        </Banner>
      )}
      <TransactionPanel />
    </div>
  );
}
```

## Conditional Blocking

### Network Status Monitoring

```tsx
function NetworkAwareApp() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');
  
  // Monitor online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionQuality();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check connection quality
  const checkConnectionQuality = async () => {
    try {
      const start = Date.now();
      await fetch('/api/ping', { method: 'HEAD' });
      const latency = Date.now() - start;
      
      setConnectionQuality(latency < 1000 ? 'good' : 'poor');
    } catch {
      setConnectionQuality('offline');
    }
  };
  
  // Block based on connection
  useConditionalBlocker('network-status', {
    scope: ['api', 'data-sync'],
    priority: 100,
    reason: connectionQuality === 'offline'
      ? 'No internet connection'
      : 'Poor connection - some features disabled',
    condition: () => connectionQuality !== 'good',
    checkInterval: 5000,
  });
  
  return (
    <div>
      <NetworkStatusBanner quality={connectionQuality} />
      <App />
    </div>
  );
}
```

### Feature Flag Blocking

```tsx
function FeatureFlagGuard() {
  const { features, isLoading } = useFeatureFlags();
  
  useConditionalBlocker('feature-disabled', {
    scope: 'premium-features',
    priority: 80,
    reason: 'Premium features are not available on your plan',
    condition: () => !features?.premiumEnabled,
    checkInterval: 30000, // Check every 30 seconds
  });
  
  useConditionalBlocker('maintenance-mode', {
    scope: 'global',
    priority: 1000,
    reason: 'System is under maintenance',
    condition: () => features?.maintenanceMode === true,
    checkInterval: 10000,
  });
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return <App />;
}
```

## Dynamic Priority Management

### Context-Aware Priorities

```tsx
function SmartBlocker() {
  const { user } = useAuth();
  const { isCriticalTime } = useBusinessContext();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate priority based on context
  const priority = useMemo(() => {
    let basePriority = 10;
    
    // Admin users get higher priority
    if (user?.role === 'admin') {
      basePriority += 20;
    }
    
    // Critical business hours get higher priority
    if (isCriticalTime) {
      basePriority += 30;
    }
    
    // Premium users get boost
    if (user?.isPremium) {
      basePriority += 10;
    }
    
    return Math.min(basePriority, 100); // Cap at 100
  }, [user, isCriticalTime]);
  
  useBlocker('smart-operation', {
    scope: 'operations',
    priority,
    reason: `Processing (priority: ${priority})...`,
  }, isProcessing);
  
  return <OperationButton onClick={() => setIsProcessing(true)} />;
}
```

### Priority Escalation

```tsx
function EscalatingBlocker() {
  const [isBlocking, setIsBlocking] = useState(false);
  const [priority, setPriority] = useState(10);
  const startTimeRef = useRef<number>(0);
  
  // Escalate priority over time
  useEffect(() => {
    if (!isBlocking) {
      setPriority(10);
      return;
    }
    
    startTimeRef.current = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const seconds = elapsed / 1000;
      
      // Increase priority every 5 seconds
      const newPriority = Math.min(10 + Math.floor(seconds / 5) * 10, 100);
      setPriority(newPriority);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isBlocking]);
  
  useBlocker('escalating-operation', {
    scope: 'global',
    priority,
    reason: `Important operation (priority escalating: ${priority})`,
  }, isBlocking);
  
  return (
    <div>
      <button onClick={() => setIsBlocking(true)}>
        Start Operation
      </button>
      {isBlocking && <div>Priority: {priority}</div>}
    </div>
  );
}
```

## Middleware Patterns

### Request Tracking Middleware

```tsx
const requestTrackingMiddleware: Middleware = (() => {
  const activeRequests = new Map<string, number>();
  
  return (context) => {
    const { action, blockerId, timestamp } = context;
    
    if (action === 'add') {
      activeRequests.set(blockerId, timestamp);
      
      // Track in analytics
      analytics.track('request_started', {
        blocker_id: blockerId,
        scope: context.config?.scope,
      });
    }
    
    if (action === 'remove' || action === 'timeout') {
      const startTime = activeRequests.get(blockerId);
      if (startTime) {
        const duration = timestamp - startTime;
        activeRequests.delete(blockerId);
        
        // Track completion
        analytics.track('request_completed', {
          blocker_id: blockerId,
          duration_ms: duration,
          completed_via: action,
        });
        
        // Alert on slow requests
        if (duration > 10000) {
          console.warn(`Slow request detected: ${blockerId} took ${duration}ms`);
          Sentry.captureMessage(`Slow blocker: ${blockerId}`, {
            level: 'warning',
            extra: { duration, blockerId },
          });
        }
      }
    }
  };
})();

configureMiddleware([requestTrackingMiddleware]);
```

### State Persistence Middleware

```tsx
const persistenceMiddleware: Middleware = (() => {
  let debounceTimer: NodeJS.Timeout;
  
  return (context) => {
    // Debounce saves
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = uiBlockingStoreApi.getState();
      const blockers = Array.from(state.blockers.values());
      
      // Only persist certain blockers
      const persistable = blockers.filter(b =>
        b.scope !== 'temp' && !b.id.startsWith('ephemeral-')
      );
      
      try {
        localStorage.setItem(
          'ui-blocking-state',
          JSON.stringify(persistable)
        );
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    }, 500);
  };
})();

// Restore on app init
function restorePersistedState() {
  try {
    const saved = localStorage.getItem('ui-blocking-state');
    if (!saved) {
      return;
    }
    
    const blockers = JSON.parse(saved);
    const store = uiBlockingStoreApi.getState();
    
    blockers.forEach((blocker: any) => {
      // Only restore recent blockers (within last hour)
      const age = Date.now() - blocker.timestamp;
      if (age < 3600000) {
        store.addBlocker(blocker.id, {
          scope: blocker.scope,
          reason: blocker.reason,
          priority: blocker.priority,
        });
      }
    });
  } catch (error) {
    console.error('Failed to restore state:', error);
  }
}
```

### Circuit Breaker Middleware

```tsx
const createCircuitBreakerMiddleware = (
  maxFailures: number = 5,
  resetTimeout: number = 60000
): Middleware => {
  const failures = new Map<string, number>();
  const openCircuits = new Set<string>();
  
  return (context) => {
    const { action, blockerId } = context;
    
    // Track timeouts as failures
    if (action === 'timeout') {
      const count = (failures.get(blockerId) || 0) + 1;
      failures.set(blockerId, count);
      
      if (count >= maxFailures) {
        // Open circuit
        openCircuits.add(blockerId);
        
        console.error(`Circuit breaker opened for: ${blockerId}`);
        Sentry.captureMessage(`Circuit breaker: ${blockerId}`, {
          level: 'error',
          extra: { failures: count },
        });
        
        // Reset after timeout
        setTimeout(() => {
          openCircuits.delete(blockerId);
          failures.delete(blockerId);
          console.log(`Circuit breaker reset for: ${blockerId}`);
        }, resetTimeout);
      }
    }
    
    // Reset on successful completion
    if (action === 'remove') {
      failures.delete(blockerId);
    }
  };
};

const circuitBreaker = createCircuitBreakerMiddleware(5, 60000);
configureMiddleware([circuitBreaker]);

// Check circuit state before operations
function useCircuitBreaker(operationId: string) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const store = uiBlockingStoreApi.getState();
    const unsubscribe = store.subscribe(() => {
      // Check if circuit is open (implementation depends on middleware)
      // This is a simplified example
    });
    
    return unsubscribe;
  }, [operationId]);
  
  return { isCircuitOpen: isOpen };
}
```

## Performance Optimization

### Batched Updates

```tsx
function BatchedOperations() {
  const [operations, setOperations] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Single blocker for all batched operations
  useBlocker('batch-operations', {
    scope: 'data-processing',
    reason: `Processing ${operations.length} operations...`,
    priority: 50,
  }, isProcessing);
  
  const processBatch = async () => {
    if (operations.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    try {
      // Process all at once
      await Promise.all(
        operations.map(op => processOperation(op))
      );
      
      setOperations([]);
      showNotification(`Processed ${operations.length} operations`, 'success');
    } catch (error) {
      showNotification('Batch processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const addOperation = (op: string) => {
    setOperations(prev => [...prev, op]);
  };
  
  return (
    <div>
      <button onClick={() => addOperation('op-' + Date.now())}>
        Add Operation
      </button>
      <button
        onClick={processBatch}
        disabled={operations.length === 0 || isProcessing}
      >
        Process Batch ({operations.length})
      </button>
    </div>
  );
}
```

### Selective Scope Blocking

```tsx
function OptimizedDataTable() {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Only block the specific row being edited
  useBlocker(`row-edit-${editingRowId}`, {
    scope: `row-${editingRowId}`,
    reason: 'Saving changes...',
  }, isSaving && editingRowId !== null);
  
  const saveRow = async (rowId: string) => {
    setIsSaving(true);
    try {
      await api.updateRow(rowId, data);
      setEditingRowId(null);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <table>
      {rows.map(row => {
        const isBlocked = useIsBlocked(`row-${row.id}`);
        
        return (
          <tr key={row.id}>
            <td>
              <input
                value={row.name}
                disabled={isBlocked}
                onChange={(e) => updateRow(row.id, e.target.value)}
              />
            </td>
            <td>
              <button
                onClick={() => saveRow(row.id)}
                disabled={isBlocked}
              >
                Save
              </button>
            </td>
          </tr>
        );
      })}
    </table>
  );
}
```

## Error Recovery

### Retry with Exponential Backoff

```tsx
function RetryableOperation() {
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxAttempts = 3;
  
  useBlocker('retryable-operation', {
    scope: 'api',
    reason: attempt > 0
      ? `Retrying... (attempt ${attempt + 1}/${maxAttempts})`
      : 'Processing...',
    priority: 20 + (attempt * 10), // Increase priority with retries
    timeout: 30000 * Math.pow(2, attempt), // Exponential timeout
    onTimeout: () => {
      if (attempt < maxAttempts - 1) {
        // Retry with backoff
        const backoff = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          setAttempt(prev => prev + 1);
          setIsRetrying(true);
        }, backoff);
      } else {
        showNotification('Operation failed after multiple attempts', 'error');
        setAttempt(0);
      }
    },
  }, isRetrying);
  
  const execute = async () => {
    setAttempt(0);
    setIsRetrying(true);
    
    try {
      await dangerousOperation();
      setIsRetrying(false);
      showNotification('Success!', 'success');
    } catch (error) {
      // Will trigger timeout and retry
      console.error('Operation failed:', error);
    }
  };
  
  return (
    <button onClick={execute} disabled={isRetrying}>
      {isRetrying ? `Retrying...` : 'Execute'}
    </button>
  );
}
```

## Next Steps

- [Full Application Examples](./full-applications) - Complete app implementations
- [API Reference](../api/hooks) - Complete API documentation
- [Best Practices](/guides/best-practices) - Recommended patterns
