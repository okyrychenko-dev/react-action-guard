# Basic Usage Examples

Real-world examples demonstrating common use cases for React Action Guard.

## Form Blocking

### Simple Form Submission

```tsx
import { useBlocker, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function UserForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Block form while submitting
  useBlocker('form-submit', {
    scope: 'form',
    reason: 'Submitting form...',
    priority: 10,
  }, isSubmitting);
  
  const isBlocked = useIsBlocked('form');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      alert('Success!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isBlocked}
        placeholder="Name"
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={isBlocked}
        placeholder="Email"
      />
      
      <button type="submit" disabled={isBlocked}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Form with Timeout

```tsx
function FormWithTimeout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useBlocker('form-submit', {
    scope: 'form',
    reason: 'Submitting form...',
    timeout: 30000, // 30 second timeout
    onTimeout: (id) => {
      console.warn('Form submission timed out');
      setIsSubmitting(false);
      alert('Request timed out. Please try again.');
    }
  }, isSubmitting);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Submit failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## Data Loading

### Simple Data Fetch

```tsx
import { useAsyncAction, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function UserList() {
  const [users, setUsers] = useState([]);
  const execute = useAsyncAction('fetch-users', 'content');
  const isLoading = useIsBlocked('content');
  
  const loadUsers = () => execute(async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  });
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  if (isLoading) {
    return <div>Loading users...</div>;
  }
  
  return (
    <div>
      <button onClick={loadUsers} disabled={isLoading}>
        Refresh
      </button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Data Fetch with Error Handling

```tsx
function DataFetcher() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const execute = useAsyncAction('fetch-data', 'global');
  
  const fetchData = async () => {
    setError(null);
    
    try {
      await execute(async () => {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      });
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData}>Load Data</button>
      {error && <div className="error">{error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Navigation Blocking

### Unsaved Changes Warning

```tsx
import { useConfirmableBlocker } from '@okyrychenko-dev/react-action-guard';

function EditForm() {
  const [formData, setFormData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  
  const {
    execute,
    isDialogOpen,
    confirmConfig,
    onConfirm,
    onCancel,
  } = useConfirmableBlocker('unsaved-changes', {
    scope: 'navigation',
    reason: 'Unsaved changes',
    priority: 100,
    confirmMessage: 'You have unsaved changes. Do you want to discard them?',
    confirmTitle: 'Unsaved Changes',
    confirmButtonText: 'Discard Changes',
    cancelButtonText: 'Keep Editing',
    onConfirm: () => {
      setFormData(initialData);
      setHasChanges(false);
      navigate('/');
    },
  });
  
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    await saveData(formData);
    setHasChanges(false);
  };
  
  return (
    <>
      <form>
        <input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <button type="button" onClick={handleSave}>Save</button>
        <button type="button" onClick={execute} disabled={!hasChanges}>
          Cancel
        </button>
      </form>
      
      {isDialogOpen && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </>
  );
}
```

## Multiple Scopes

### Blocking Form and Navigation

```tsx
function CheckoutForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Block both form and navigation during checkout
  useBlocker('checkout-process', {
    scope: ['form', 'navigation'],
    priority: 100,
    reason: 'Processing payment...',
  }, isProcessing);
  
  const isFormBlocked = useIsBlocked('form');
  const isNavBlocked = useIsBlocked('navigation');
  
  const processCheckout = async () => {
    setIsProcessing(true);
    try {
      await processPayment();
      await createOrder();
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div>
      <form>
        <input disabled={isFormBlocked} />
        <button onClick={processCheckout} disabled={isFormBlocked}>
          Complete Purchase
        </button>
      </form>
      
      <nav>
        <Link disabled={isNavBlocked}>Back</Link>
      </nav>
    </div>
  );
}
```

## Priority System

### Managing Multiple Operations

```tsx
function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Low priority background sync
  useBlocker('background-sync', {
    scope: 'global',
    priority: 5,
    reason: 'Syncing data...',
  }, isSyncing);
  
  // Medium priority save
  useBlocker('save-data', {
    scope: 'global',
    priority: 10,
    reason: 'Saving...',
  }, isSaving);
  
  // High priority payment
  useBlocker('process-payment', {
    scope: 'global',
    priority: 100,
    reason: 'Processing payment...',
  }, isProcessing);
  
  // Show highest priority blocker
  const blockers = useBlockingInfo('global');
  const topBlocker = blockers[0];
  
  return (
    <div>
      {topBlocker && (
        <div className="status-bar">
          {topBlocker.reason} (Priority: {topBlocker.priority})
        </div>
      )}
      
      <button onClick={() => setIsSyncing(true)}>Sync</button>
      <button onClick={() => setIsSaving(true)}>Save</button>
      <button onClick={() => setIsProcessing(true)}>Pay</button>
    </div>
  );
}
```

## Loading Overlay

### Global Loading Indicator

```tsx
function App() {
  const isGloballyBlocked = useIsBlocked('global');
  const blockers = useBlockingInfo('global');
  const topBlocker = blockers[0];
  
  return (
    <div>
      {isGloballyBlocked && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>{topBlocker?.reason || 'Loading...'}</p>
        </div>
      )}
      
      <YourApp />
    </div>
  );
}
```

### Scope-Specific Overlay

```tsx
function FormWithOverlay() {
  const isBlocked = useIsBlocked('form');
  const blockers = useBlockingInfo('form');
  
  return (
    <div className="form-container">
      {isBlocked && (
        <div className="form-overlay">
          <Spinner />
          <p>{blockers[0]?.reason}</p>
        </div>
      )}
      
      <form>{/* form fields */}</form>
    </div>
  );
}
```

## Conditional Blocking

### Network Status Blocker

```tsx
import { useConditionalBlocker } from '@okyrychenko-dev/react-action-guard';

function NetworkMonitor() {
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
  
  useConditionalBlocker('network-status', {
    scope: ['form', 'api'],
    reason: 'No internet connection',
    priority: 1000,
    condition: () => !isOnline,
    checkInterval: 2000,
  });
  
  return (
    <div>
      {!isOnline && (
        <div className="offline-banner">
          You are offline. Some features are unavailable.
        </div>
      )}
      <App />
    </div>
  );
}
```

## Multi-Step Form

### Wizard with Blocking

```tsx
function Wizard() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Block navigation between steps while saving
  useBlocker(`wizard-step-${step}`, {
    scope: 'navigation',
    reason: `Saving step ${step}...`,
  }, isSaving);
  
  const isNavBlocked = useIsBlocked('navigation');
  
  const saveAndNext = async () => {
    setIsSaving(true);
    try {
      await saveStep(step);
      setStep(step + 1);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <h2>Step {step} of 3</h2>
      
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      
      <button onClick={() => setStep(step - 1)} disabled={isNavBlocked || step === 1}>
        Previous
      </button>
      <button onClick={saveAndNext} disabled={isNavBlocked || isSaving}>
        {isSaving ? 'Saving...' : 'Next'}
      </button>
    </div>
  );
}
```

## Status Display

### Active Blockers List

```tsx
function BlockerStatus() {
  const blockers = useBlockingInfo('global');
  
  if (blockers.length === 0) {
    return null;
  }
  
  return (
    <div className="blocker-status">
      <h3>Active Operations ({blockers.length})</h3>
      <ul>
        {blockers.map((blocker) => (
          <li key={blocker.id}>
            <strong>{blocker.reason}</strong>
            <span className="priority">Priority: {blocker.priority}</span>
            <span className="time">
              {Math.floor((Date.now() - blocker.timestamp) / 1000)}s ago
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices Summary

1. **Use specific scopes** - Don't block 'global' unless necessary
2. **Add timeouts** - Prevent infinite blocking
3. **Show feedback** - Display blocker reason to users
4. **Handle errors** - Always cleanup in try/finally
5. **Use priorities** - Higher for critical operations
6. **Test edge cases** - Network failures, timeouts, concurrent operations

## Next Steps

- [Advanced Patterns](./advanced-patterns) - Complex use cases
- [API Reference: Hooks](../api/hooks) - Complete hook documentation
- [Middleware System](../guides/middleware-system) - Track blocker events
