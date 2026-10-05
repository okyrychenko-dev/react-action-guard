import { Card, Chip, Separator } from "@heroui/react";
import {
  CartTable,
  CheckoutFooter,
  CheckoutForm,
  CheckoutStatus,
  CheckoutToggles,
  OperationTimeline,
} from "../components";
import { useCheckoutActions, useCheckoutBlockers, useCheckoutState } from "../hooks";
import type { ReactElement } from "react";

export function CheckoutWorkspace(): ReactElement {
  const state = useCheckoutState();
  const blockers = useCheckoutBlockers({
    riskHold: state.checkout.riskHold,
    inventoryReserved: state.checkout.inventoryReserved,
    hasUnsavedChanges: state.checkout.hasUnsavedChanges,
    isOperationalLockActive: state.isOperationalLockActive,
  });
  const actions = useCheckoutActions({
    couponCode: state.checkout.couponCode,
    isGatewaySlow: state.checkout.isGatewaySlow,
    shouldFailNextPayment: state.checkout.shouldFailNextPayment,
    onSaved: state.markSaved,
    onCouponApplied: state.markCouponApplied,
    onOrderPlaced: state.setLastOrderId,
    onPaymentFailureConsumed: state.consumePaymentFailure,
    onTimelineEntry: state.addTimelineEntry,
  });

  let headerChipColor: "warning" | "success" = "success";
  let headerChipLabel = "Ready";

  if (blockers.isCheckoutBlocked) {
    headerChipColor = "warning";
    headerChipLabel = "Guarded";
  }

  return (
    <Card aria-label="Checkout workspace">
      <Card.Header className="flex items-center justify-between gap-4">
        <div>
          <Card.Title className="m-0 mb-0.5 text-teal-600 text-[11px] font-bold tracking-widest uppercase">
            Enterprise checkout
          </Card.Title>
          <Card.Description className="m-0 text-slate-900 text-[17px] font-semibold">
            Order orchestration
          </Card.Description>
        </div>
        <Chip color={headerChipColor} variant="soft">
          {headerChipLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <CheckoutForm
          address={state.checkout.address}
          paymentReference={state.checkout.paymentReference}
          couponCode={state.checkout.couponCode}
          addressDisabled={actions.addressFieldState.disabled}
          paymentDisabled={actions.paymentRefFieldState.disabled}
          couponDisabled={actions.couponFieldState.disabled}
          onAddressChange={state.handleAddressChange}
          onPaymentChange={state.handlePaymentChange}
          onCouponChange={state.handleCouponChange}
        />
        <CartTable lines={state.checkout.lines} />
        <Separator />
        <CheckoutFooter
          subtotal={state.subtotal}
          lastOrderId={state.lastOrderId}
          saveCartDisabled={actions.saveCartState.disabled}
          applyCouponDisabled={actions.applyCouponState.disabled}
          placeOrderDisabled={actions.placeOrderState.disabled}
          isOperationPending={actions.isOperationPending}
          lastErrorMessage={actions.lastErrorMessage}
          onSaveCart={actions.handleSaveCart}
          onApplyCoupon={actions.handleApplyCoupon}
          onPlaceOrder={actions.handlePlaceOrder}
          onCancelOperation={actions.handleCancelOperation}
        />
        <CheckoutToggles
          riskHold={state.checkout.riskHold}
          inventoryMissing={!state.checkout.inventoryReserved}
          isOperationalLockActive={state.isOperationalLockActive}
          isGatewaySlow={state.checkout.isGatewaySlow}
          shouldFailNextPayment={state.checkout.shouldFailNextPayment}
          onRiskHoldChange={state.setRiskHold}
          onInventoryMissingChange={state.setInventoryMissing}
          onOpsLockChange={state.setOperationalLockActive}
          onGatewaySlowChange={state.setGatewaySlow}
          onFailNextPaymentChange={state.setShouldFailNextPayment}
        />
        <OperationTimeline entries={state.timeline} />
        <CheckoutStatus
          isPaymentBlocked={blockers.isPaymentBlocked}
          isInventoryBlocked={blockers.isInventoryBlocked}
          isNavigationBlocked={blockers.isNavigationBlocked}
        />
      </Card.Content>
    </Card>
  );
}
