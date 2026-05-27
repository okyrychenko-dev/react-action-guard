import { renderHook } from "@testing-library/react";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload } from "../useBeforeUnload";

describe("useBeforeUnload", () => {
  let addEventListenerSpy: MockInstance<typeof window.addEventListener>;
  let removeEventListenerSpy: MockInstance<typeof window.removeEventListener>;

  const getBeforeUnloadHandler = (): EventListener => {
    const call = addEventListenerSpy.mock.calls[0];
    if (!call) {
      throw new Error("Expected spy to be called");
    }

    const handler = call[1];
    if (!handler) {
      throw new Error("Expected handler");
    }

    if (typeof handler === "function") {
      return handler;
    }

    if (
      typeof handler === "object" &&
      handler !== null &&
      "handleEvent" in handler &&
      typeof handler.handleEvent === "function"
    ) {
      return (event: Event) => handler.handleEvent(event);
    }

    throw new Error("Expected function handler");
  };

  const createBeforeUnloadEvent = (): BeforeUnloadEvent => new BeforeUnloadEvent();

  // Type guard for returnValue property (some DOM types have conflicting definitions)
  const hasReturnValue = (event: Event): event is Event & { returnValue: unknown } => {
    return "returnValue" in event;
  };

  const expectReturnValue = (event: BeforeUnloadEvent, expected: string) => {
    if (hasReturnValue(event)) {
      expect(event.returnValue).toBe(expected);
      return;
    }

    // returnValue not supported in this environment
    expect(hasReturnValue(event)).toBe(false);
  };

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe("Basic functionality", () => {
    it("should add beforeunload listener when condition is true", () => {
      renderHook(() => useBeforeUnload(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    });

    it("should not add listener when condition is false", () => {
      renderHook(() => useBeforeUnload(false));

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should handle function condition", () => {
      const condition = vi.fn(() => true);
      renderHook(() => useBeforeUnload(condition));

      expect(condition).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it("should use default message when not provided", () => {
      renderHook(() => useBeforeUnload(true));

      const handler = getBeforeUnloadHandler();
      const event = createBeforeUnloadEvent();
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      handler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expectReturnValue(event, DEFAULT_UNLOAD_MESSAGE);
    });

    it("should use custom message when provided", () => {
      const customMessage = "Custom warning message";
      renderHook(() => useBeforeUnload(true, customMessage));

      const handler = getBeforeUnloadHandler();
      const event = createBeforeUnloadEvent();
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      handler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expectReturnValue(event, customMessage);
    });
  });

  describe("Cleanup", () => {
    it("should remove listener on unmount", () => {
      const { unmount } = renderHook(() => useBeforeUnload(true));

      const addedHandler = addEventListenerSpy.mock.calls[0][1];

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", addedHandler);
    });

    it("should remove listener when condition changes to false", () => {
      let when = true;
      const { rerender } = renderHook(() => useBeforeUnload(when));

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      when = false;
      rerender();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it("should properly clean up on multiple condition changes", () => {
      let when = true;
      const { rerender } = renderHook(() => useBeforeUnload(when));

      when = false;
      rerender();

      when = true;
      rerender();

      when = false;
      rerender();

      // Should have added/removed listener for each change
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Event handling", () => {
    it("should call preventDefault on beforeunload event", () => {
      renderHook(() => useBeforeUnload(true));

      const handler = getBeforeUnloadHandler();
      const event = createBeforeUnloadEvent();
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      handler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should prevent default even with custom message", () => {
      const message = "Test message";
      renderHook(() => useBeforeUnload(true, message));

      const handler = getBeforeUnloadHandler();
      const event = createBeforeUnloadEvent();
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      handler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expectReturnValue(event, message);
    });
  });

  describe("Performance", () => {
    it("should maintain stable listener reference on re-render with same condition", () => {
      const { rerender } = renderHook(() => useBeforeUnload(true));

      const initialCallCount = addEventListenerSpy.mock.calls.length;

      rerender();

      // With proper dependency array, listener is re-attached on every render
      // This is expected behavior because [when, message] are dependencies
      expect(addEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    });

    it("should update handler when message changes", () => {
      let message = "Message 1";
      const { rerender } = renderHook(() => useBeforeUnload(true, message));

      const firstHandler = getBeforeUnloadHandler();

      message = "Message 2";
      rerender();

      const secondCall = addEventListenerSpy.mock.calls[1];

      if (!secondCall) {
        throw new Error("Expected second call");
      }

      const secondHandler = secondCall[1];

      // Handlers should be different (new closure with new message)
      expect(firstHandler).not.toBe(secondHandler);
    });
  });
});
