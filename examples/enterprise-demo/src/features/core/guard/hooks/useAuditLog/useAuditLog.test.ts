import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuditLog } from "./useAuditLog";

describe("useAuditLog", () => {
  it("should collect actual store events newest first", () => {
    const { result } = renderHook(() => useAuditLog());
    const { addBlocker } = uiBlockingStoreApi.getState();
    act(() => {
      addBlocker("blocker-1", { scope: "admin" });
      addBlocker("blocker-2", { scope: ["checkout", "payment"] });
    });
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0]?.blockerId).toBe("blocker-2");
    expect(result.current.events[0]?.scope).toBe("checkout, payment");
    expect(result.current.events[1]?.blockerId).toBe("blocker-1");
  });

  it("should keep only the latest audit events", () => {
    const { result } = renderHook(() => useAuditLog());
    const { addBlocker } = uiBlockingStoreApi.getState();
    act(() => {
      Array.from({ length: 14 }, (_, index) => index + 1).forEach((index) => {
        addBlocker(`blocker-${index.toString()}`, { scope: "admin" });
      });
    });
    expect(result.current.events).toHaveLength(12);
    expect(result.current.events[0]?.blockerId).toBe("blocker-14");
    expect(result.current.events[11]?.blockerId).toBe("blocker-3");
  });

  it("should clear collected events", () => {
    const { result } = renderHook(() => useAuditLog());
    const { addBlocker } = uiBlockingStoreApi.getState();
    act(() => addBlocker("blocker-1"));
    expect(result.current.events).toHaveLength(1);
    act(() => result.current.clearEvents());
    expect(result.current.events).toHaveLength(0);
  });
});
