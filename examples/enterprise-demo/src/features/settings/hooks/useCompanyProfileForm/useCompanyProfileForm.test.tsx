import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "@test/renderWithProviders";
import { useCompanyProfileForm } from "./useCompanyProfileForm";

describe("useCompanyProfileForm", () => {
  it("should expose the initial profile form state", () => {
    const { result } = renderHook(() => useCompanyProfileForm(), {
      wrapper: TestProviders,
    });

    expect(result.current.companyName).toBe("Acme Corp");
    expect(result.current.taxId).toBe("US-123-456-789");
    expect(result.current.businessAddress).toBe("100 Main St, San Francisco, CA 94105");
    expect(result.current.statusLabel).toBe("Open");
    expect(result.current.statusColor).toBe("success");
  });

  it("should update profile fields", () => {
    const { result } = renderHook(() => useCompanyProfileForm(), {
      wrapper: TestProviders,
    });

    act(() => {
      result.current.setCompanyName("Enterprise Co");
      result.current.setTaxId("US-987-654-321");
      result.current.setBusinessAddress("200 Market St");
    });

    expect(result.current.companyName).toBe("Enterprise Co");
    expect(result.current.taxId).toBe("US-987-654-321");
    expect(result.current.businessAddress).toBe("200 Market St");
  });

  it("should guard checkout scope while saving changes", async () => {
    const { result } = renderHook(() => useCompanyProfileForm(), {
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
