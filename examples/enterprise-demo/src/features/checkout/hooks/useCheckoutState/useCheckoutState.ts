import { useMemo, useState } from "react";
import { INITIAL_CHECKOUT_STATE } from "../../checkout.constants";
import { calculateSubtotal } from "../../checkout.utils";
import type { CheckoutState } from "../../checkout.types";
import type { UseCheckoutStateReturn } from "./useCheckoutState.types";

export function useCheckoutState(): UseCheckoutStateReturn {
  const [checkout, setCheckout] = useState<CheckoutState>(INITIAL_CHECKOUT_STATE);
  const [timeline, setTimeline] = useState<UseCheckoutStateReturn["timeline"]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isOperationalLockActive, setOperationalLockActive] = useState(false);
  const subtotal = useMemo(() => calculateSubtotal(checkout.lines), [checkout.lines]);

  const handleAddressChange = (value: string): void => {
    setCheckout((current) => ({ ...current, address: value, hasUnsavedChanges: true }));
  };

  const handlePaymentChange = (value: string): void => {
    setCheckout((current) => ({ ...current, paymentReference: value, hasUnsavedChanges: true }));
  };

  const handleCouponChange = (value: string): void => {
    setCheckout((current) => ({ ...current, couponCode: value }));
  };

  const markSaved = (): void => {
    setCheckout((current) => ({ ...current, hasUnsavedChanges: false }));
  };

  const markCouponApplied = (appliedCode: string): void => {
    setCheckout((current) => ({ ...current, couponCode: appliedCode, hasUnsavedChanges: false }));
  };

  const setRiskHold = (value: boolean): void => {
    setCheckout((current) => ({ ...current, riskHold: value }));
  };

  const setInventoryMissing = (isMissing: boolean): void => {
    setCheckout((current) => ({ ...current, inventoryReserved: !isMissing }));
  };

  const setGatewaySlow = (value: boolean): void => {
    setCheckout((current) => ({ ...current, isGatewaySlow: value }));
  };

  const setShouldFailNextPayment = (value: boolean): void => {
    setCheckout((current) => ({ ...current, shouldFailNextPayment: value }));
  };

  const consumePaymentFailure = (): void => {
    setCheckout((current) => ({ ...current, shouldFailNextPayment: false }));
  };

  const addTimelineEntry = (entry: UseCheckoutStateReturn["timeline"][number]): void => {
    setTimeline((current) => [entry, ...current].slice(0, 6));
  };

  return {
    checkout,
    timeline,
    lastOrderId,
    isOperationalLockActive,
    subtotal,
    handleAddressChange,
    handlePaymentChange,
    handleCouponChange,
    markSaved,
    markCouponApplied,
    setLastOrderId,
    setRiskHold,
    setInventoryMissing,
    setGatewaySlow,
    setShouldFailNextPayment,
    consumePaymentFailure,
    addTimelineEntry,
    setOperationalLockActive,
  };
}
