import type { CheckoutOperationTimelineEntry, CheckoutState } from "../../checkout.types";

export interface UseCheckoutStateReturn {
  checkout: CheckoutState;
  timeline: ReadonlyArray<CheckoutOperationTimelineEntry>;
  lastOrderId: string | null;
  isOperationalLockActive: boolean;
  subtotal: number;
  handleAddressChange: (value: string) => void;
  handlePaymentChange: (value: string) => void;
  handleCouponChange: (value: string) => void;
  markSaved: VoidFunction;
  markCouponApplied: (appliedCode: string) => void;
  setLastOrderId: (id: string) => void;
  setRiskHold: (value: boolean) => void;
  setInventoryMissing: (isMissing: boolean) => void;
  setGatewaySlow: (value: boolean) => void;
  setShouldFailNextPayment: (value: boolean) => void;
  consumePaymentFailure: VoidFunction;
  addTimelineEntry: (entry: CheckoutOperationTimelineEntry) => void;
  setOperationalLockActive: (value: boolean) => void;
}
