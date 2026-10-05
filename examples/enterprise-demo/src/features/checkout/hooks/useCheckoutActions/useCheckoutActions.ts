import { useGuardedAction } from "@features/core/guard/scopes";
import { publishActionRejected, publishOrderPlaced } from "@features/core/sessionEvents";
import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton, useGuardedField } from "@okyrychenko-dev/react-action-guard-ui";
import { delay } from "@shared/utils";
import { useEffect, useRef, useState } from "react";
import {
  CHECKOUT_OPERATION_DELAY_MS,
  SLOW_PAYMENT_GATEWAY_DELAY_MS,
} from "../../checkout.constants";
import {
  createCheckoutOperationId,
  createPaymentGatewayError,
  isCheckoutOperationCancelled,
  waitForCheckoutOperation,
} from "./useCheckoutActions.utils";
import type { UseCheckoutActionsInput, UseCheckoutActionsReturn } from "./useCheckoutActions.types";

export function useCheckoutActions({
  couponCode,
  isGatewaySlow,
  shouldFailNextPayment,
  onSaved,
  onCouponApplied,
  onOrderPlaced,
  onPaymentFailureConsumed,
  onTimelineEntry,
}: UseCheckoutActionsInput): UseCheckoutActionsReturn {
  const store = useResolvedStoreApi();
  const [isOperationPending, setOperationPending] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const { buttonState: saveCartState } = useGuardedButton({ scope: "checkout" });
  const { buttonState: applyCouponState } = useGuardedButton({ scope: ["checkout", "payment"] });
  const { buttonState: placeOrderState } = useGuardedButton({
    scope: ["checkout", "payment", "inventory"],
  });

  const { fieldState: addressFieldState } = useGuardedField({ scope: "checkout" });
  const { fieldState: paymentRefFieldState } = useGuardedField({ scope: "payment" });
  const { fieldState: couponFieldState } = useGuardedField({ scope: "checkout" });

  const saveCart = useGuardedAction("save-cart", ["checkout", "navigation"]);
  const applyCoupon = useGuardedAction("apply-coupon", ["checkout", "payment"]);
  const placeOrder = useGuardedAction("place-order", ["checkout", "payment", "inventory"], {
    timeout: 5000,
  });

  const handleSaveCart = (): void => {
    const { isBlocked } = store.getState();
    if (isBlocked("checkout")) {
      publishActionRejected(store, "blocked");
      return;
    }
    void saveCart(async () => {
      await delay(CHECKOUT_OPERATION_DELAY_MS);
      if (isMountedRef.current) {
        onSaved();
      }
    });
  };

  const handleApplyCoupon = (): void => {
    const appliedCode = couponCode.trim().toUpperCase();

    if (appliedCode.length === 0) {
      return;
    }
    const { isBlocked } = store.getState();
    if (isBlocked(["checkout", "payment"])) {
      publishActionRejected(store, "blocked");
      return;
    }

    void applyCoupon(async () => {
      await delay(CHECKOUT_OPERATION_DELAY_MS);
      if (isMountedRef.current) {
        onCouponApplied(appliedCode);
      }
    });
  };

  const handlePlaceOrder = (): void => {
    if (abortControllerRef.current !== null) {
      publishActionRejected(store, "duplicate");
      return;
    }
    const { isBlocked } = store.getState();
    if (isBlocked(["checkout", "payment", "inventory"])) {
      publishActionRejected(store, "blocked");
      return;
    }

    const operationId = createCheckoutOperationId("payment");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setOperationPending(true);
    setLastErrorMessage(null);
    onTimelineEntry({
      id: operationId,
      label: "Payment authorization",
      detail: isGatewaySlow
        ? "Payment gateway is responding slowly."
        : "Payment gateway request started.",
      status: "pending",
      timestamp: Date.now(),
    });

    void placeOrder(async () => {
      try {
        await waitForCheckoutOperation(
          isGatewaySlow ? SLOW_PAYMENT_GATEWAY_DELAY_MS : CHECKOUT_OPERATION_DELAY_MS,
          controller.signal
        );

        if (shouldFailNextPayment) {
          onPaymentFailureConsumed();
          throw createPaymentGatewayError();
        }

        const orderId = `ENT-${Math.floor(10000 + Math.random() * 89999).toString()}`;
        if (!isMountedRef.current) {
          return;
        }

        onOrderPlaced(orderId);
        publishOrderPlaced(store, orderId);
        onTimelineEntry({
          id: `${operationId}-success`,
          label: "Order placed",
          detail: `Created order ${orderId}.`,
          status: "success",
          timestamp: Date.now(),
        });
      } catch (error) {
        if (isCheckoutOperationCancelled(error)) {
          if (!isMountedRef.current) {
            return;
          }

          onTimelineEntry({
            id: `${operationId}-cancelled`,
            label: "Payment cancelled",
            detail: "Pending payment authorization was cancelled by the operator.",
            status: "cancelled",
            timestamp: Date.now(),
          });
          return;
        }

        if (!isMountedRef.current) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Payment gateway failed unexpectedly.";
        setLastErrorMessage(message);
        onTimelineEntry({
          id: `${operationId}-error`,
          label: "Payment failed",
          detail: `${message} Retry is now available.`,
          status: "error",
          timestamp: Date.now(),
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        if (isMountedRef.current) {
          setOperationPending(false);
        }
      }
    });
  };

  const handleCancelOperation = (): void => {
    abortControllerRef.current?.abort();
  };

  return {
    saveCartState,
    applyCouponState,
    placeOrderState,
    addressFieldState,
    paymentRefFieldState,
    couponFieldState,
    isOperationPending,
    lastErrorMessage,
    handleSaveCart,
    handleApplyCoupon,
    handlePlaceOrder,
    handleCancelOperation,
  };
}
