import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useActionBlocker } from "../../hooks";
import { uiBlockingStoreApi } from "../../store";
import type { Middleware } from "../middleware.types";

describe("blocking observation integration", () => {
  it("should observe hook registration and cleanup without exposing timer handles", () => {
    const { observeBlockingEvents, clearAllBlockers } = uiBlockingStoreApi.getState();
    const observer = vi.fn<Middleware>();
    const release = observeBlockingEvents(observer);
    const { unmount } = renderHook(() =>
      useActionBlocker("observed", { scope: "form", timeout: 1000 })
    );

    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({ action: "add", blockerId: "observed" })
    );
    observer.mockClear();
    unmount();
    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({ action: "remove", blockerId: "observed" })
    );
    expect(observer.mock.calls[0]?.[0].config).not.toHaveProperty("timeoutId");
    release();
    clearAllBlockers();
  });
});
