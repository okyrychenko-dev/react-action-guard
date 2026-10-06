import { Button, Chip } from "@heroui/react";
import { formatCurrency } from "../checkout.utils";
import type { ReactElement } from "react";

interface CheckoutFooterProps {
  subtotal: number;
  lastOrderId: string | null;
  saveCartDisabled: boolean;
  applyCouponDisabled: boolean;
  placeOrderDisabled: boolean;
  isOperationPending: boolean;
  lastErrorMessage: string | null;
  onSaveCart: VoidFunction;
  onApplyCoupon: VoidFunction;
  onPlaceOrder: VoidFunction;
  onCancelOperation: VoidFunction;
}

export function CheckoutFooter(props: CheckoutFooterProps): ReactElement {
  const {
    subtotal,
    lastOrderId,
    saveCartDisabled,
    applyCouponDisabled,
    placeOrderDisabled,
    isOperationPending,
    lastErrorMessage,
    onSaveCart,
    onApplyCoupon,
    onPlaceOrder,
    onCancelOperation,
  } = props;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="m-0 text-slate-500 text-[13px]">Subtotal</p>
        <strong className="block text-slate-900 text-3xl font-bold leading-tight">
          {formatCurrency(subtotal)}
        </strong>
        {isOperationPending && !placeOrderDisabled && (
          <p role="status">
            Payment is still running. The blocker timed out; cancel the request or wait for
            completion.
          </p>
        )}
        {lastOrderId && (
          <p className="m-0 text-emerald-700 text-[13px] mt-1.5">Created order {lastOrderId}</p>
        )}
        {lastErrorMessage && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Chip color="danger" variant="soft" size="sm">
              Payment failed
            </Chip>
            <span className="text-danger-700 text-[13px]">{lastErrorMessage}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2.5 items-center">
        <Button variant="secondary" onPress={onSaveCart} isDisabled={saveCartDisabled}>
          Save cart
        </Button>
        <Button variant="secondary" onPress={onApplyCoupon} isDisabled={applyCouponDisabled}>
          Apply coupon
        </Button>
        <Button
          variant="primary"
          onPress={onPlaceOrder}
          isDisabled={placeOrderDisabled || isOperationPending}
        >
          {lastErrorMessage ? "Retry order" : "Place order"}
        </Button>
        <Button variant="secondary" onPress={onCancelOperation} isDisabled={!isOperationPending}>
          Cancel pending
        </Button>
      </div>
    </div>
  );
}
