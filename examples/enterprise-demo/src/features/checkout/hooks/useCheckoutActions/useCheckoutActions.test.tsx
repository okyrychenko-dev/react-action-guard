import { StrictMode } from "react";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "@test/renderWithProviders";
import type { CheckoutOperationTimelineEntry } from "../../checkout.types";
import { useCheckoutActions } from "./useCheckoutActions";

function StrictProviders({ children }: { children: ReactNode }): ReactNode {
  return (
    <StrictMode>
      <TestProviders>{children}</TestProviders>
    </StrictMode>
  );
}

describe("useCheckoutActions", () => {
  afterEach(() => vi.useRealTimers());

  it("should retain the running payment after blocker timeout, cancel it explicitly and allow retry in Strict Mode", async () => {
    vi.useFakeTimers();
    const onOrderPlaced = vi.fn();
    const onTimelineEntry = vi.fn();
    const { result, rerender } = renderHook(
      ({ slow }) =>
        useCheckoutActions({
          couponCode: "",
          isGatewaySlow: slow,
          shouldFailNextPayment: false,
          onSaved: vi.fn(),
          onCouponApplied: vi.fn(),
          onOrderPlaced,
          onPaymentFailureConsumed: vi.fn(),
          onTimelineEntry,
        }),
      { initialProps: { slow: true }, wrapper: StrictProviders }
    );
    act(() => result.current.handlePlaceOrder());
    expect(result.current.placeOrderState.disabled).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(5001));
    expect(result.current.placeOrderState.disabled).toBe(false);
    expect(result.current.isOperationPending).toBe(true);
    expect(onOrderPlaced).not.toHaveBeenCalled();
    act(() => result.current.handlePlaceOrder());
    expect(onTimelineEntry).toHaveBeenCalledTimes(1);
    await act(async () => result.current.handleCancelOperation());
    expect(result.current.isOperationPending).toBe(false);
    expect(onOrderPlaced).not.toHaveBeenCalled();
    expect(onTimelineEntry).toHaveBeenCalledWith(expect.objectContaining({ status: "cancelled" }));
    rerender({ slow: false });
    act(() => result.current.handlePlaceOrder());
    await act(() => vi.advanceTimersByTimeAsync(450));
    expect(onOrderPlaced).toHaveBeenCalledTimes(1);
    expect(result.current.isOperationPending).toBe(false);
  });
  it("should ignore an empty coupon instead of applying a hidden default", async () => {
    const onCouponApplied = vi.fn();

    const { result } = renderHook(
      () =>
        useCheckoutActions({
          couponCode: "  ",
          isGatewaySlow: false,
          shouldFailNextPayment: false,
          onSaved: vi.fn(),
          onCouponApplied,
          onOrderPlaced: vi.fn(),
          onPaymentFailureConsumed: vi.fn(),
          onTimelineEntry: vi.fn(),
        }),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.handleApplyCoupon();
    });

    expect(onCouponApplied).not.toHaveBeenCalled();
  });

  it("should prevent duplicate place order submissions while one is pending", async () => {
    const onOrderPlaced = vi.fn();

    const { result } = renderHook(
      () =>
        useCheckoutActions({
          couponCode: "",
          isGatewaySlow: false,
          shouldFailNextPayment: false,
          onSaved: vi.fn(),
          onCouponApplied: vi.fn(),
          onOrderPlaced,
          onPaymentFailureConsumed: vi.fn(),
          onTimelineEntry: vi.fn(),
        }),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.handlePlaceOrder();
      result.current.handlePlaceOrder();
    });

    await waitFor(() => {
      expect(onOrderPlaced).toHaveBeenCalledTimes(1);
    });
  });

  it("should record payment failure and consume fail-next scenario", async () => {
    const onPaymentFailureConsumed = vi.fn();
    const onTimelineEntry = vi.fn<(entry: CheckoutOperationTimelineEntry) => void>();

    const { result } = renderHook(
      () =>
        useCheckoutActions({
          couponCode: "",
          isGatewaySlow: false,
          shouldFailNextPayment: true,
          onSaved: vi.fn(),
          onCouponApplied: vi.fn(),
          onOrderPlaced: vi.fn(),
          onPaymentFailureConsumed,
          onTimelineEntry,
        }),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.handlePlaceOrder();
    });

    await waitFor(() => {
      expect(result.current.lastErrorMessage).toBe(
        "Payment gateway returned a transient authorization error."
      );
    });

    expect(onPaymentFailureConsumed).toHaveBeenCalledTimes(1);
    expect(onTimelineEntry).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Payment failed", status: "error" })
    );
  });

  it("should cancel a pending slow payment operation", async () => {
    const onTimelineEntry = vi.fn<(entry: CheckoutOperationTimelineEntry) => void>();

    const { result } = renderHook(
      () =>
        useCheckoutActions({
          couponCode: "",
          isGatewaySlow: true,
          shouldFailNextPayment: false,
          onSaved: vi.fn(),
          onCouponApplied: vi.fn(),
          onOrderPlaced: vi.fn(),
          onPaymentFailureConsumed: vi.fn(),
          onTimelineEntry,
        }),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.handlePlaceOrder();
    });

    await waitFor(() => {
      expect(result.current.isOperationPending).toBe(true);
    });

    act(() => {
      result.current.handleCancelOperation();
    });

    await waitFor(() => {
      expect(result.current.isOperationPending).toBe(false);
    });

    expect(onTimelineEntry).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Payment cancelled", status: "cancelled" })
    );
  });
});
