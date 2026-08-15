[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useConfirmableBlocker

# Function: useConfirmableBlocker()

> **useConfirmableBlocker**(`blockerId`, `config`): [`UseConfirmableBlockerReturn`](../interfaces/UseConfirmableBlockerReturn.md)

Defined in: [src/hooks/useConfirmableBlocker/useConfirmableBlocker.ts:141](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConfirmableBlocker/useConfirmableBlocker.ts#L141)

Creates a blocker that requires user confirmation before executing an action.

Manages a confirmation dialog and blocking state for actions that need user approval.
The blocker is active during both the confirmation dialog display and action execution.

Workflow:
1. Call `execute()` to show confirmation dialog (blocker activated)
2. User confirms → `onConfirm` callback runs (blocker remains active)
3. Action completes → blocker removed
4. User cancels → blocker removed, optional `onCancel` callback runs

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Parameters

### blockerId

`string`

Unique identifier for this confirmable blocker

### config

[`ConfirmableBlockerConfig`](../interfaces/ConfirmableBlockerConfig.md)

Configuration for the confirmable action

## Returns

[`UseConfirmableBlockerReturn`](../interfaces/UseConfirmableBlockerReturn.md)

Object containing:
- `execute`: Function to trigger the confirmation dialog
- `isDialogOpen`: Boolean indicating if confirmation dialog is visible
- `isExecuting`: Boolean indicating if the confirmed action is executing
- `confirmConfig`: Dialog configuration (title, message, button texts)
- `onConfirm`: Function to call when user confirms
- `onCancel`: Function to call when user cancels

## Examples

Delete confirmation with custom dialog
```tsx
function DeleteButton({ itemId, itemName }) {
  const confirmableDelete = useConfirmableBlocker('delete-item', {
    confirmMessage: `Are you sure you want to delete "${itemName}"?`,
    confirmTitle: 'Delete Item',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Keep',
    scope: ['form', 'navigation'],
    priority: 80,
    onConfirm: async () => {
      await deleteItem(itemId);
      showToast('Item deleted successfully');
    },
    onCancel: () => {
      console.log('Delete cancelled');
    }
  });
  
  return (
    <>
      <button onClick={confirmableDelete.execute}>
        Delete
      </button>
      
      {confirmableDelete.isDialogOpen && (
        <ConfirmDialog
          {...confirmableDelete.confirmConfig}
          onConfirm={confirmableDelete.onConfirm}
          onCancel={confirmableDelete.onCancel}
          isLoading={confirmableDelete.isExecuting}
        />
      )}
    </>
  );
}
```

Simple confirmation with default dialog
```tsx
function LogoutButton() {
  const confirmLogout = useConfirmableBlocker('logout', {
    confirmMessage: 'Are you sure you want to log out?',
    scope: 'global',
    onConfirm: async () => {
      await api.logout();
      navigate('/login');
    }
  });
  
  return (
    <>
      <button onClick={confirmLogout.execute}>Logout</button>
      
      {confirmLogout.isDialogOpen && (
        <Dialog
          title={confirmLogout.confirmConfig.title}
          message={confirmLogout.confirmConfig.message}
          onConfirm={confirmLogout.onConfirm}
          onCancel={confirmLogout.onCancel}
        />
      )}
    </>
  );
}
```

With loading state during execution
```tsx
function SaveButton() {
  const confirmSave = useConfirmableBlocker('save-changes', {
    confirmMessage: 'Save all changes?',
    scope: 'form',
    onConfirm: async () => {
      await saveAllChanges();
    }
  });
  
  return (
    <button 
      onClick={confirmSave.execute}
      disabled={confirmSave.isExecuting}
    >
      {confirmSave.isExecuting ? 'Saving...' : 'Save All'}
    </button>
  );
}
```

## See

 - [useBlocker](useBlocker.md) for simple blocking without confirmation
 - [ConfirmableBlockerConfig](../interfaces/ConfirmableBlockerConfig.md) for configuration options
 - [UseConfirmableBlockerReturn](../interfaces/UseConfirmableBlockerReturn.md) for return value structure

## Since

1.0.0
