import { useDashboardMetrics } from "@features/dashboard/hooks";
import { useCheckoutActions } from "@features/checkout/hooks";
import { useAdminActions } from "@features/admin/hooks";
import { usePaymentGatewayValidation } from "@features/integrations/hooks";
import { useEnterpriseBlocker, useEnterpriseIsBlocked } from "@features/core";
import { useAuditLog } from "@features/core/guard/hooks";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "./AppProviders";

function Consumer() {
  const blocked = useEnterpriseIsBlocked("checkout");
  const { events } = useAuditLog();
  return (
    <output>
      {blocked ? "Blocked" : "Ready"} / {events.length} events
    </output>
  );
}

function Instance({ name }: { name: string }) {
  const [active, setActive] = useState(false);
  useEnterpriseBlocker("instance-lock", { scope: "checkout" }, active);
  return (
    <section aria-label={name}>
      <button onClick={() => setActive(true)}>Lock</button>
      <div>
        <Consumer />
      </div>
    </section>
  );
}

describe("Demo session ownership", () => {
  afterEach(() => vi.useRealTimers());

  it("should keep completed order notifications and metrics inside their provider root", async () => {
    vi.useFakeTimers();
    function OrderInstance({ name }: { name: string }) {
      const { ordersPlaced } = useDashboardMetrics();
      const actions = useCheckoutActions({
        couponCode: "",
        isGatewaySlow: false,
        shouldFailNextPayment: false,
        onSaved: vi.fn(),
        onCouponApplied: vi.fn(),
        onOrderPlaced: vi.fn(),
        onPaymentFailureConsumed: vi.fn(),
        onTimelineEntry: vi.fn(),
      });
      return (
        <section aria-label={name}>
          <button onClick={actions.handlePlaceOrder}>Pay</button>
          <output>{ordersPlaced} orders</output>
        </section>
      );
    }
    render(<AppProviders>{() => <OrderInstance name="First" />}</AppProviders>);
    render(<AppProviders>{() => <OrderInstance name="Second" />}</AppProviders>);
    fireEvent.click(within(screen.getByRole("region", { name: "First" })).getByText("Pay"));
    await act(() => vi.advanceTimersByTimeAsync(450));
    expect(screen.getByRole("region", { name: "First" })).toHaveTextContent("1 orders");
    expect(screen.getByRole("region", { name: "Second" })).toHaveTextContent("0 orders");
  });

  it.each(["save", "coupon", "payment", "refund", "query"])(
    "should keep a fresh reset session clean when old %s work settles",
    async (operation) => {
      vi.useFakeTimers();
      const onSaved = vi.fn();
      const onCouponApplied = vi.fn();
      const onOrderPlaced = vi.fn();
      function PendingWork() {
        const actions = useCheckoutActions({
          couponCode: "SALE",
          isGatewaySlow: true,
          shouldFailNextPayment: false,
          onSaved,
          onCouponApplied,
          onOrderPlaced,
          onPaymentFailureConsumed: vi.fn(),
          onTimelineEntry: vi.fn(),
        });
        const admin = useAdminActions();
        const query = usePaymentGatewayValidation();
        const { events } = useAuditLog();
        const blocked = useEnterpriseIsBlocked(["checkout", "payment"]);
        return (
          <>
            <button onClick={actions.handleSaveCart}>save</button>
            <button onClick={actions.handleApplyCoupon}>coupon</button>
            <button onClick={actions.handlePlaceOrder}>payment</button>
            <button onClick={admin.refundAction.execute}>refund</button>
            <button
              onClick={() => {
                void admin.refundAction.onConfirm();
              }}
            >
              approve
            </button>
            <button
              onClick={() => {
                void query.refetch();
              }}
            >
              query
            </button>
            <output>
              {blocked ? "Busy" : "Ready"} / {events.length} events
            </output>
          </>
        );
      }
      render(
        <AppProviders>
          {({ demoKey, onReset }) => (
            <div key={demoKey}>
              <button onClick={onReset}>Reset</button>
              <PendingWork />
            </div>
          )}
        </AppProviders>
      );
      fireEvent.click(screen.getByText(operation));
      if (operation === "refund") {
        fireEvent.click(screen.getByText("approve"));
      }
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(screen.getByRole("status")).toHaveTextContent("Busy");
      fireEvent.click(screen.getByText("Reset"));
      await act(() => vi.advanceTimersByTimeAsync(7000));
      expect(screen.getByRole("status")).toHaveTextContent("Ready / 0 events");
      expect(onSaved).not.toHaveBeenCalled();
      expect(onCouponApplied).not.toHaveBeenCalled();
      expect(onOrderPlaced).not.toHaveBeenCalled();
    }
  );
  it("should isolate blockers and nested audit consumers between two roots and reset only the selected root", () => {
    render(
      <AppProviders>
        {({ demoKey, onReset }) => (
          <div key={demoKey}>
            <button onClick={onReset}>Reset first</button>
            <Instance name="First" />
          </div>
        )}
      </AppProviders>
    );
    render(
      <AppProviders>{({ demoKey }) => <Instance key={demoKey} name="Second" />}</AppProviders>
    );
    const first = within(screen.getByRole("region", { name: "First" }));
    const second = within(screen.getByRole("region", { name: "Second" }));
    fireEvent.click(first.getByText("Lock"));
    expect(first.getByText("Blocked / 1 events")).toBeInTheDocument();
    expect(second.getByText("Ready / 0 events")).toBeInTheDocument();
    fireEvent.click(second.getByText("Lock"));
    fireEvent.click(screen.getByText("Reset first"));
    expect(screen.getByRole("region", { name: "First" })).toHaveTextContent("Ready / 0 events");
    expect(second.getByText("Blocked / 1 events")).toBeInTheDocument();
  });
});
