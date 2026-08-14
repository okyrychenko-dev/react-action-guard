import { afterEach, describe, expect, it, vi } from "vitest";
import { handleConfirmation } from "../utils/handleConfirmation";

describe("handleConfirmation", () => {
  const originalConfirm = window.confirm;

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it("should use window.confirm when no custom handler is provided", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    window.confirm = vi.fn(() => true);

    const result = handleConfirmation("Leave?", undefined, { onConfirm, onCancel });

    expect(result).toBe("confirmed");
    expect(window.confirm).toHaveBeenCalledWith("Leave?");
    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should return cancelled when window.confirm is false", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    window.confirm = vi.fn(() => false);

    const result = handleConfirmation("Leave?", undefined, { onConfirm, onCancel });

    expect(result).toBe("cancelled");
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should handle sync custom confirmation", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const customHandler = vi.fn(() => true);

    const result = handleConfirmation("Leave?", customHandler, { onConfirm, onCancel });

    expect(result).toBe("confirmed");
    expect(customHandler).toHaveBeenCalledWith("Leave?");
    expect(onConfirm).toHaveBeenCalled();
  });

  it("should handle sync custom cancellation", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const customHandler = vi.fn(() => false);

    const result = handleConfirmation("Leave?", customHandler, { onConfirm, onCancel });

    expect(result).toBe("cancelled");
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should return pending for async custom handler", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const customHandler = vi.fn(() => Promise.resolve(true));

    const result = handleConfirmation("Leave?", customHandler, { onConfirm, onCancel });

    expect(result).toBe("pending");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
