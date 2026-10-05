import * as financeApi from "../../admin.api";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "@test/renderWithProviders";
import { useAdminActions } from "./useAdminActions";

describe("useAdminActions", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should invoke one finance operation under rapid confirmation and none on cancel", async () => {
    vi.useFakeTimers();
    const refund = vi.spyOn(financeApi, "refundEnterpriseOrder");
    const { result } = renderHook(() => useAdminActions(), { wrapper: TestProviders });
    act(() => {
      result.current.refundAction.execute();
      result.current.refundAction.execute();
    });
    act(() => result.current.refundAction.onCancel());
    expect(refund).not.toHaveBeenCalled();
    act(() => result.current.refundAction.execute());
    const confirm = result.current.refundAction.onConfirm;
    await act(async () => {
      void confirm();
      void confirm();
      result.current.refundAction.execute();
    });
    expect(refund).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(result.current.actionResult).toBe("Refund approved and audit event recorded");
    expect(refund).toHaveBeenCalledTimes(1);
    act(() => result.current.refundAction.execute());
    await act(async () => {
      void result.current.refundAction.onConfirm();
    });
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(refund).toHaveBeenCalledTimes(2);
  });

  it("should abort an approved refund when its owner unmounts", async () => {
    vi.useFakeTimers();
    const refund = vi.spyOn(financeApi, "refundEnterpriseOrder");
    const { result, unmount } = renderHook(() => useAdminActions(), { wrapper: TestProviders });
    act(() => result.current.refundAction.execute());
    await act(async () => {
      void result.current.refundAction.onConfirm();
    });
    const call = refund.mock.calls.at(0);
    if (!call) {
      throw new Error("Refund operation was not invoked.");
    }
    const [signal] = call;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(refund).toHaveBeenCalledTimes(1);
  });

  it("should clear local team lock state when checkout blockers are cleared", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useAdminActions(), { wrapper: TestProviders });

    act(() => {
      result.current.handleSimulateTeamMember();
    });

    expect(result.current.isTeamLockActive).toBe(true);

    act(() => {
      result.current.handleClearCheckout();
    });

    expect(result.current.isTeamLockActive).toBe(false);

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isTeamLockActive).toBe(false);
  });
});
