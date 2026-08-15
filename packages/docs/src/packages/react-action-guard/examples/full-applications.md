# Full Application Examples

Complete, production-ready application examples demonstrating React Action Guard in real-world scenarios.

## Shopping Cart Application

A complete e-commerce shopping cart with checkout flow.

### Store Setup

```typescript
// stores/cart.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity > 0
      ? state.items.map(i => i.id === id ? { ...i, quantity } : i)
      : state.items.filter(i => i.id !== id)
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  
  clear: () => set({ items: [] }),
  
  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
```

### Cart Component

```tsx
// components/ShoppingCart.tsx
import { useBlocker, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function ShoppingCart() {
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Block cart while updating
  useBlocker('cart-update', {
    scope: 'cart',
    reason: 'Updating cart...',
    priority: 10,
  }, isUpdating !== null);
  
  const isBlocked = useIsBlocked('cart');
  
  const handleQuantityChange = async (id: string, quantity: number) => {
    setIsUpdating(id);
    try {
      // Sync with backend
      await api.updateCartItem(id, quantity);
      updateQuantity(id, quantity);
    } catch (error) {
      showNotification('Failed to update cart', 'error');
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handleRemove = async (id: string) => {
    setIsUpdating(id);
    try {
      await api.removeCartItem(id);
      removeItem(id);
      showNotification('Item removed', 'success');
    } finally {
      setIsUpdating(null);
    }
  };
  
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                isUpdating={isUpdating === item.id}
                onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                onRemove={() => handleRemove(item.id)}
                disabled={isBlocked}
              />
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button
              className="checkout-btn"
              disabled={isBlocked}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CartItem({ item, isUpdating, onQuantityChange, onRemove, disabled }) {
  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''}`}>
      <img src={item.image} alt={item.name} />
      
      <div className="item-details">
        <h3>{item.name}</h3>
        <p>${item.price.toFixed(2)}</p>
      </div>
      
      <div className="item-quantity">
        <button
          onClick={() => onQuantityChange(item.quantity - 1)}
          disabled={disabled || isUpdating}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          disabled={disabled || isUpdating}
        >
          +
        </button>
      </div>
      
      <div className="item-subtotal">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
      
      <button
        className="remove-btn"
        onClick={onRemove}
        disabled={disabled || isUpdating}
      >
        ×
      </button>
      
      {isUpdating && <div className="updating-overlay"><Spinner /></div>}
    </div>
  );
}
```

### Checkout Flow

```tsx
// components/Checkout.tsx
import { useBlocker, useIsBlocked, useAsyncAction } from '@okyrychenko-dev/react-action-guard';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'complete';

function Checkout() {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const { items, total, clear } = useCartStore();
  
  const processPayment = useAsyncAction('process-payment', [' checkout', 'navigation'], {
    priority: 100,
    timeout: 60000,
    reason: 'Processing payment...',
    onTimeout: () => {
      showNotification('Payment timeout. Please try again.', 'error');
    },
  });
  
  const isBlocked = useIsBlocked('checkout');
  
  const handleSubmitShipping = async (info: ShippingInfo) => {
    setShippingInfo(info);
    setStep('payment');
  };
  
  const handleSubmitPayment = async (info: PaymentInfo) => {
    setPaymentInfo(info);
    setStep('review');
  };
  
  const handlePlaceOrder = async () => {
    if (!shippingInfo || !paymentInfo) {
      return;
    }
    
    await processPayment(async () => {
      const order = await api.createOrder({
        items,
        shipping: shippingInfo,
        payment: paymentInfo,
        total,
      });
      
      // Clear cart
      clear();
      
      // Navigate to success
      setStep('complete');
      
      return order;
    });
  };
  
  return (
    <div className="checkout">
      <CheckoutProgress current Step={step} />
      
      {step === 'shipping' && (
        <ShippingForm
          onSubmit={handleSubmitShipping}
          disabled={isBlocked}
        />
      )}
      
      {step === 'payment' && (
        <PaymentForm
          onSubmit={handleSubmitPayment}
          onBack={() => setStep('shipping')}
          disabled={isBlocked}
        />
      )}
      
      {step === 'review' && (
        <OrderReview
          items={items}
          shipping={shippingInfo!}
          payment={paymentInfo!}
          total={total}
          onEdit={(editStep) => setStep(editStep)}
          onConfirm={handlePlaceOrder}
          disabled={isBlocked}
        />
      )}
      
      {step === 'complete' && (
        <OrderComplete />
      )}
    </div>
  );
}
```

## Multi-Step Form Wizard

Complete wizard with validation and state management.

```tsx
// components/UserOnboarding.tsx
import { useBlocker, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

interface WizardData {
  personal: PersonalInfo | null;
  account: AccountInfo | null;
  preferences: PreferencesInfo | null;
}

function UserOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    personal: null,
    account: null,
    preferences: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const totalSteps = 3;
  
  // Block while saving
  useBlocker('wizard-save', {
    scope: 'wizard',
    reason: `Saving step ${currentStep}...`,
    priority: 50,
    timeout: 30000,
  }, isSaving);
  
  // Block navigation if unsaved changes
  useBlocker('unsaved-changes', {
    scope: 'navigation',
    reason: 'You have unsaved changes',
    priority: 80,
  }, hasUnsavedChanges);
  
  const isBlocked = useIsBlocked('wizard');
  
  const saveStep = async (stepData: any) => {
    setIsSaving(true);
    try {
      await api.saveWizardStep(currentStep, stepData);
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      showNotification('Failed to save. Please try again.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNext = async () => {
    let stepData;
    
    switch (currentStep) {
      case 1:
        stepData = data.personal;
        break;
      case 2:
        stepData = data.account;
        break;
      case 3:
        stepData = data.preferences;
        break;
    }
    
    if (!stepData) {
      return;
    }
    
    const saved = await saveStep(stepData);
    if (saved && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else if (saved && currentStep === totalSteps) {
      await completeOnboarding();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setHasUnsavedChanges(false);
    }
  };
  
  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      await api.completeOnboarding(data);
      navigate('/dashboard');
      showNotification('Onboarding complete!', 'success');
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateData = <K extends keyof WizardData>(
    key: K,
    value: WizardData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };
  
  return (
    <div className="wizard">
      <WizardHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        titles={['Personal Info', 'Account Setup', 'Preferences']}
      />
      
      <div className="wizard-content">
        {currentStep === 1 && (
          <PersonalInfoStep
            data={data.personal}
            onChange={(info) => updateData('personal', info)}
            disabled={isBlocked}
          />
        )}
        
        {currentStep === 2 && (
          <AccountSetupStep
            data={data.account}
            onChange={(info) => updateData('account', info)}
            disabled={isBlocked}
          />
        )}
        
        {currentStep === 3 && (
          <PreferencesStep
            data={data.preferences}
            onChange={(info) => updateData('preferences', info)}
            disabled={isBlocked}
          />
        )}
      </div>
      
      <div className="wizard-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isBlocked}
        >
          Previous
        </button>
        
        <div className="step-indicators">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`indicator ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={isBlocked || !canProceed(currentStep, data)}
        >
          {currentStep === totalSteps ? 'Complete' : 'Next'}
        </button>
      </div>
      
      {hasUnsavedChanges && (
        <div className="unsaved-warning">
          <ExclamationIcon />
          <span>You have unsaved changes</span>
        </div>
      )}
      
      {isSaving && (
        <div className="saving-overlay">
          <Spinner />
          <p>Saving your progress...</p>
        </div>
      )}
    </div>
  );
}

function canProceed(step: number, data: WizardData): boolean {
  switch (step) {
    case 1:
      return data.personal !== null && isValidPersonal Info(data.personal);
    case 2:
      return data.account !== null && isValidAccountInfo(data.account);
    case 3:
      return data.preferences !== null;
    default:
      return false;
  }
}
```

## Dashboard with Real-Time Updates

Complete dashboard with live data and concurrent operations.

```tsx
// components/Dashboard.tsx
import { useBlockingQuery, useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useBlockingInfo, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function Dashboard() {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  
  // Load multiple data sources
  const statsQuery = useBlockingQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Refresh every 30s
    blockingConfig: {
      scope: 'dashboard-stats',
      reasonOnLoading: 'Loading statistics...',
      onLoading: true,
      onFetching: false, // Don't block on refresh
    },
  });
  
  const activityQuery = useBlockingQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchActivity,
    refetchInterval: 10000,
    blockingConfig: {
      scope: 'dashboard-activity',
      reasonOnLoading: 'Loading activity...',
      onLoading: true,
      onFetching: false,
    },
  });
  
  const notificationsQuery = useBlockingQuery({
    queryKey: ['dashboard', 'notifications'],
    queryFn: fetchNotifications,
    blockingConfig: {
      scope: 'dashboard-notifications',
      reasonOnLoading: 'Loading notifications...',
      onLoading: true,
    },
  });
  
  const refreshMutation = useBlockingMutation({
    mutationFn: () => refreshAllData(),
    blockingConfig: {
      scope: 'dashboard',
      reasonOnLoading: 'Refreshing dashboard...',
      priority: 30,
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showNotification('Dashboard refreshed', 'success');
    },
  });
  
  const isDashboardBlocked = useIsBlocked('dashboard');
  const blockers = useBlockingInfo('dashboard');
  
  const handleRefresh = () => {
    refreshMutation.mutate();
  };
  
  return (
    <div className="dashboard">
      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={refreshMutation.isPending}
        disabled={isDashboardBlocked}
      />
      
      {blockers.length > 0 && (
        <LoadingBanner message={blockers[0].reason} />
      )}
      
      <div className="dashboard-grid">
        <StatsWidget
          data={statsQuery.data}
          isLoading={statsQuery.isLoading}
          error={statsQuery.error}
        />
        
        <ActivityWidget
          data={activityQuery.data}
          isLoading={activityQuery.isLoading}
          error={activityQuery.error}
        />
        
        <NotificationsWidget
          data={notificationsQuery.data}
          isLoading={notificationsQuery.isLoading}
          error={notificationsQuery.error}
          onMarkAsRead={markNotificationAsRead}
        />
        
        <QuickActionsWidget
          disabled={isDashboardBlocked}
        />
      </div>
    </div>
  );
}

function QuickActionsWidget({ disabled }: { disabled: boolean }) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  const executeAction = useAsyncAction('quick-action', 'dashboard', {
    priority: 50,
    timeout: 30000,
  });
  
  const actions = [
    { id: 'export', label: 'Export Data', icon: DownloadIcon },
    { id: 'report', label: 'Generate Report', icon: FileIcon },
    { id: 'backup', label: 'Backup', icon: BackupIcon },
  ];
  
  const handleAction = async (actionId: string) => {
    setActiveAction(actionId);
    
    await executeAction(async () => {
      switch (actionId) {
        case 'export':
          await exportData();
          break;
        case 'report':
          await generateReport();
          break;
        case 'backup':
          await createBackup();
          break;
      }
      
      showNotification('Action completed', 'success');
    });
    
    setActiveAction(null);
  };
  
  return (
    <div className="quick-actions-widget">
      <h3>Quick Actions</h3>
      <div className="actions">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={disabled || activeAction !== null}
            className={activeAction === action.id ? 'active' : ''}
          >
            <action.icon />
            <span>{action.label}</span>
            {activeAction === action.id && <Spinner size="small" />}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## File Upload Manager

Concurrent file uploads with progress tracking.

```tsx
// components/FileUploadManager.tsx
import { useBlocker, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

function FileUploadManager() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const maxConcurrent = 3;
  
  // Block uploads section while any upload is active
  const activeUploads = tasks.filter(t => t.status === 'uploading');
  
  useBlocker('file-uploads', {
    scope: 'uploads',
    reason: `Uploading ${activeUploads.length} file(s)...`,
    priority: 40,
  }, activeUploads.length > 0);
  
  const handleFileSelect = (files: FileList) => {
    const newTasks: UploadTask[] = Array.from(files).map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
    }));
    
    setTasks(prev => [...prev, ...newTasks]);
    
    // Start uploads
    newTasks.forEach(task => {
      if (activeUploads.length < maxConcurrent) {
        startUpload(task.id);
      }
    });
  };
  
  const startUpload = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return;
    }
    
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'uploading' } : t
    ));
    
    try {
      await uploadFile(task.file, (progress) => {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, progress } : t
        ));
      });
      
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'complete', progress: 100 } : t
      ));
    } catch (error) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'error', error: error.message } : t
      ));
    }
    
    // Start next pending upload
    const nextPending = tasks.find(t => t.status === 'pending');
    if (nextPending) {
      startUpload(nextPending.id);
    }
  };
  
  const cancelUpload = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  return (
    <div className="upload-manager">
      <div className="upload-zone">
        <input
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
        <p>Drop files here or click to select</p>
      </div>
      
      <div className="upload-list">
        {tasks.map(task => (
          <UploadTaskItem
            key={task.id}
            task={task}
            onCancel={() => cancelUpload(task.id)}
          />
        ))}
      </div>
      
      {activeUploads.length > 0 && (
        <div className="upload-summary">
          Uploading {activeUploads.length} of {tasks.length} files
        </div>
      )}
    </div>
  );
}
```

## Next Steps

- [Advanced Patterns](./advanced-patterns) - More complex patterns
- [API Reference](../api/hooks) - Complete API documentation
- [Best Practices](/guides/best-practices) - Recommended patterns
