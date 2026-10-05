import type { GuardedActionState, GuardedFieldState } from "@okyrychenko-dev/react-action-guard-ui";
import type { CheckoutOperationTimelineEntry } from "../../checkout.types";

export interface UseCheckoutActionsInput {
  couponCode: string;
  isGatewaySlow: boolean;
  shouldFailNextPayment: boolean;
  onSaved: VoidFunction;
  onCouponApplied: (code: string) => void;
  onOrderPlaced: (orderId: string) => void;
  onPaymentFailureConsumed: VoidFunction;
  onTimelineEntry: (entry: CheckoutOperationTimelineEntry) => void;
}

export interface UseCheckoutActionsReturn {
  saveCartState: GuardedActionState;
  applyCouponState: GuardedActionState;
  placeOrderState: GuardedActionState;
  addressFieldState: GuardedFieldState;
  paymentRefFieldState: GuardedFieldState;
  couponFieldState: GuardedFieldState;
  isOperationPending: boolean;
  lastErrorMessage: string | null;
  handleSaveCart: VoidFunction;
  handleApplyCoupon: VoidFunction;
  handlePlaceOrder: VoidFunction;
  handleCancelOperation: VoidFunction;
}
