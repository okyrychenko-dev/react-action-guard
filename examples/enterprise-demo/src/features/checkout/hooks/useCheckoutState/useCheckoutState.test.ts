import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCheckoutState } from "./useCheckoutState";

describe("useCheckoutState", () => {
  it("should expose the initial checkout state and derived subtotal", () => {
    const { result } = renderHook(() => useCheckoutState());

    expect(result.current.checkout.hasUnsavedChanges).toBe(false);
    expect(result.current.checkout.inventoryReserved).toBe(true);
    expect(result.current.lastOrderId).toBeNull();
    expect(result.current.isOperationalLockActive).toBe(false);
    expect(result.current.subtotal).toBe(3_166);
  });

  it("should mark profile edits as unsaved and save them", () => {
    const { result } = renderHook(() => useCheckoutState());

    act(() => {
      result.current.handleAddressChange("101 Enterprise Way");
      result.current.handlePaymentChange("PO-2026-05");
    });

    expect(result.current.checkout.address).toBe("101 Enterprise Way");
    expect(result.current.checkout.paymentReference).toBe("PO-2026-05");
    expect(result.current.checkout.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.markSaved();
    });

    expect(result.current.checkout.hasUnsavedChanges).toBe(false);
  });

  it("should update operational checkout flags", () => {
    const { result } = renderHook(() => useCheckoutState());

    act(() => {
      result.current.setRiskHold(true);
      result.current.setInventoryMissing(true);
      result.current.setOperationalLockActive(true);
      result.current.setLastOrderId("ent-1001");
    });

    expect(result.current.checkout.riskHold).toBe(true);
    expect(result.current.checkout.inventoryReserved).toBe(false);
    expect(result.current.isOperationalLockActive).toBe(true);
    expect(result.current.lastOrderId).toBe("ent-1001");
  });

  it("should apply a coupon and clear unsaved state", () => {
    const { result } = renderHook(() => useCheckoutState());

    act(() => {
      result.current.handleAddressChange("Unsaved address");
      result.current.markCouponApplied("ENTERPRISE20");
    });

    expect(result.current.checkout.couponCode).toBe("ENTERPRISE20");
    expect(result.current.checkout.hasUnsavedChanges).toBe(false);
  });
});
