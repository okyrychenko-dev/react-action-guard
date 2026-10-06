import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "@test/renderWithProviders";
import { usePaymentSettings } from "./usePaymentSettings";

describe("usePaymentSettings", () => {
  it("should expose the initial payment settings", () => {
    const { result } = renderHook(() => usePaymentSettings(), {
      wrapper: TestProviders,
    });

    expect(result.current.gatewayUrl).toBe("https://api.payments.example.com/v2");
    expect(result.current.apiKey).toBe("sk_live_••••••••••••••••");
    expect(result.current.statusLabel).toBe("Open");
    expect(result.current.statusColor).toBe("success");
  });

  it("should update payment settings", () => {
    const { result } = renderHook(() => usePaymentSettings(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.setGatewayUrl("https://payments.example.test/v3");
      result.current.setApiKey("sk_test_new");
    });

    expect(result.current.gatewayUrl).toBe("https://payments.example.test/v3");
    expect(result.current.apiKey).toBe("sk_test_new");
  });

  it("should guard payment scope while saving changes", async () => {
    const { result } = renderHook(() => usePaymentSettings(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.saveChanges();
    });

    await waitFor(() => {
      expect(result.current.statusLabel).toBe("Guarded");
      expect(result.current.statusColor).toBe("warning");
    });
  });
});
