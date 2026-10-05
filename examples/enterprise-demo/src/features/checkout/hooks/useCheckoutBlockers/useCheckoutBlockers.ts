import { useEnterpriseBlocker, useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { useConditionalBlocker } from "@okyrychenko-dev/react-action-guard";
import type {
  UseCheckoutBlockersInput,
  UseCheckoutBlockersReturn,
} from "./useCheckoutBlockers.types";

export function useCheckoutBlockers({
  riskHold,
  inventoryReserved,
  hasUnsavedChanges,
  isOperationalLockActive,
}: UseCheckoutBlockersInput): UseCheckoutBlockersReturn {
  const isCheckoutBlocked = useEnterpriseIsBlocked("checkout");
  const isPaymentBlocked = useEnterpriseIsBlocked("payment");
  const isInventoryBlocked = useEnterpriseIsBlocked("inventory");
  const isNavigationBlocked = useEnterpriseIsBlocked("navigation");

  useEnterpriseBlocker(
    "unsaved-checkout-changes",
    {
      scope: "navigation",
      reason: "Checkout edits have not been saved",
      priority: 72,
    },
    hasUnsavedChanges
  );

  useEnterpriseBlocker(
    "ops-manual-lock",
    {
      scope: ["checkout", "payment"],
      reason: "Operations team paused checkout processing",
      priority: 88,
    },
    isOperationalLockActive
  );

  useEnterpriseBlocker(
    "risk-review-hold",
    {
      scope: ["checkout", "payment"],
      reason: "Risk review is required before payment capture",
      priority: 92,
    },
    riskHold
  );

  useConditionalBlocker("inventory-reservation-missing", {
    scope: "inventory",
    reason: "Inventory reservation must be restored before ordering",
    priority: 86,
    checkInterval: 200,
    state: inventoryReserved,
    condition: (value) => value !== true,
  });

  return { isCheckoutBlocked, isPaymentBlocked, isInventoryBlocked, isNavigationBlocked };
}
