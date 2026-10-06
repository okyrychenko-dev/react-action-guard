export interface UseCheckoutBlockersInput {
  riskHold: boolean;
  inventoryReserved: boolean;
  hasUnsavedChanges: boolean;
  isOperationalLockActive: boolean;
}

export interface UseCheckoutBlockersReturn {
  isCheckoutBlocked: boolean;
  isPaymentBlocked: boolean;
  isInventoryBlocked: boolean;
  isNavigationBlocked: boolean;
}
