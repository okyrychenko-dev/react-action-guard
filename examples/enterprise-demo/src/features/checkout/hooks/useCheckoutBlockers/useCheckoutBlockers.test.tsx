import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useCheckoutBlockers } from "./useCheckoutBlockers";

function BlockingWrapper({ children }: { children: ReactNode }): ReactNode {
  return <UIBlockingProvider>{children}</UIBlockingProvider>;
}

describe("useCheckoutBlockers", () => {
  it("should block navigation but keep checkout actions available for unsaved changes", async () => {
    const { result } = renderHook(
      () =>
        useCheckoutBlockers({
          riskHold: false,
          inventoryReserved: true,
          hasUnsavedChanges: true,
          isOperationalLockActive: false,
        }),
      { wrapper: BlockingWrapper }
    );

    await waitFor(() => {
      expect(result.current.isNavigationBlocked).toBe(true);
    });

    expect(result.current.isCheckoutBlocked).toBe(false);
    expect(result.current.isPaymentBlocked).toBe(false);
    expect(result.current.isInventoryBlocked).toBe(false);
  });

  it("should block checkout and payment for risk and operations holds", async () => {
    const { result } = renderHook(
      () =>
        useCheckoutBlockers({
          riskHold: true,
          inventoryReserved: true,
          hasUnsavedChanges: false,
          isOperationalLockActive: true,
        }),
      { wrapper: BlockingWrapper }
    );

    await waitFor(() => {
      expect(result.current.isCheckoutBlocked).toBe(true);
      expect(result.current.isPaymentBlocked).toBe(true);
    });

    expect(result.current.isInventoryBlocked).toBe(false);
  });

  it("should block inventory when reservation is missing", async () => {
    const { result } = renderHook(
      () =>
        useCheckoutBlockers({
          riskHold: false,
          inventoryReserved: false,
          hasUnsavedChanges: false,
          isOperationalLockActive: false,
        }),
      { wrapper: BlockingWrapper }
    );

    await waitFor(() => {
      expect(result.current.isInventoryBlocked).toBe(true);
    });

    expect(result.current.isCheckoutBlocked).toBe(false);
    expect(result.current.isPaymentBlocked).toBe(false);
    expect(result.current.isNavigationBlocked).toBe(false);
  });
});
