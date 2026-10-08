import { renderHook } from "@testing-library/react";
import { useRouter } from "next/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../../core";
import { useNavigationBlocker } from "../usePagesRouterBlocker";
import { createMockRouter } from "./test-helpers";
import type { MockRouter, RouterEventHandler } from "./test-helpers";
import type { Mock } from "vitest";

// Mock dependencies
vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../core")>();

  return {
    ...actual,
    useShouldBlock: vi.fn(),
    useBeforeUnload: vi.fn(),
  };
});

const mockUseRouter = vi.mocked(useRouter);
const mockUseShouldBlock = vi.mocked(useShouldBlock);
const mockUseBeforeUnload = vi.mocked(useBeforeUnload);

describe("useNavigationBlocker (Next.js Pages Router)", () => {
  let mockRouter: MockRouter;
  let onMock: Mock<(event: string, handler: RouterEventHandler) => void>;
  let offMock: Mock<(event: string, handler: RouterEventHandler) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShouldBlock.mockReturnValue(false);

    mockRouter = createMockRouter();
    onMock = mockRouter.events.on;
    offMock = mockRouter.events.off;
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe("Basic functionality", () => {
    it("should integrate with useShouldBlock", () => {
      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Test message",
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(true, undefined);
    });

    it("should pass scope to useShouldBlock", () => {
      renderHook(() =>
        useNavigationBlocker({
          scope: "test-scope",
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(undefined, "test-scope");
    });

    it("should call useBeforeUnload when blockBrowserUnload is true", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          blockBrowserUnload: true,
          message: "Test message",
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, "Test message");
    });
  });

  describe("Next.js router events", () => {
    it("should register routeChangeStart listener when blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(onMock).toHaveBeenCalledWith("routeChangeStart", expect.any(Function));
    });

    it("should not register listener when not blocking", () => {
      mockUseShouldBlock.mockReturnValue(false);

      renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(onMock).not.toHaveBeenCalled();
    });

    it("should cleanup listener on unmount", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { unmount } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      const handler = onMock.mock.calls[0][1];

      unmount();

      expect(offMock).toHaveBeenCalledWith("routeChangeStart", handler);
    });

    it("should cleanup and re-register when blocking state changes", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(onMock).not.toHaveBeenCalled();

      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      expect(onMock).toHaveBeenCalled();
    });
  });

  describe("Blocking behavior", () => {
    it("should return isBlocking: false when not blocking", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(result.current.isBlocking).toBe(false);
    });

    it("should return isBlocking: true when blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(result.current.isBlocking).toBe(true);
    });
  });

  describe("Message handling", () => {
    it("should use default message for browser unload", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, DEFAULT_UNLOAD_MESSAGE);
    });

    it("should use custom message", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Custom message",
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, "Custom message");
    });
  });

  describe("Custom confirmation", () => {
    it("should re-attempt navigation after async confirmation", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const onAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => confirmPromise);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm navigation?",
          onConfirm,
          onAllow,
        })
      );

      const handler = onMock.mock.calls[0][1];

      expect(() => handler("/next")).toThrow("Route change aborted by user");
      expect(mockRouter.events.emit).toHaveBeenCalledWith("routeChangeError");

      vi.mocked(mockRouter.push).mockImplementation(async () => {
        expect(() => handler("/next")).not.toThrow();

        return true;
      });

      resolveConfirm(true);
      await confirmPromise;
      await Promise.resolve();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/next");

      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(() => handler("/next")).toThrow("Route change aborted by user");
      expect(onConfirm).toHaveBeenCalledTimes(2);
    });
  });

  it("should retain a pending attempt across inline callback and equivalent scope rerenders", async () => {
    mockUseShouldBlock.mockReturnValue(true);

    let resolveConfirm: (value: boolean) => void = () => undefined;
    const promise = new Promise<boolean>((resolve) => {
      resolveConfirm = resolve;
    });
    const onAllow = vi.fn();
    const { rerender } = renderHook(() =>
      useNavigationBlocker({
        when: () => true,
        scope: ["editor", "navigation"],
        message: "Leave?",
        onConfirm: () => promise,
        onAllow: () => onAllow(),
      })
    );
    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/next")).toThrow();
    rerender();
    resolveConfirm(true);
    await promise;
    await Promise.resolve();

    expect(mockRouter.push).toHaveBeenCalledExactlyOnceWith("/next");
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it.each(["detach", "disable", "message", "scope", "router"])(
    "should invalidate pending confirmation on %s",
    async (change) => {
      mockUseShouldBlock.mockReturnValue(true);

      let resolveConfirm: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onAllow = vi.fn();
      let message = "Leave?";
      let scope = "editor";
      const { rerender, unmount } = renderHook(() =>
        useNavigationBlocker({ message, scope, onConfirm: () => promise, onAllow })
      );
      const handler = onMock.mock.calls[0][1];
      const originalRouter = mockRouter;

      expect(() => handler("/old")).toThrow();

      if (change === "detach") {
        unmount();
      } else {
        if (change === "disable") {
          mockUseShouldBlock.mockReturnValue(false);
        } else if (change === "message") {
          message = "Different protection";
        } else if (change === "scope") {
          scope = "checkout";
        } else {
          mockRouter = createMockRouter();
          mockUseRouter.mockReturnValue(mockRouter);
        }
        rerender();
      }

      resolveConfirm(true);
      await promise;
      await Promise.resolve();

      expect(originalRouter.push).not.toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(onAllow).not.toHaveBeenCalled();
    }
  );

  it("should resume only the latest attempt when promises finish out of order", async () => {
    mockUseShouldBlock.mockReturnValue(true);

    let resolveFirst: (value: boolean) => void = () => undefined;
    let resolveSecond: (value: boolean) => void = () => undefined;
    const first = new Promise<boolean>((resolve) => {
      resolveFirst = resolve;
    });
    const second = new Promise<boolean>((resolve) => {
      resolveSecond = resolve;
    });
    const onConfirm = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const onAllow = vi.fn();

    renderHook(() => useNavigationBlocker({ message: "Leave?", onConfirm, onAllow }));

    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/old")).toThrow();
    expect(() => handler("/current")).toThrow();
    resolveSecond(true);
    await second;
    resolveFirst(true);
    await first;
    await Promise.resolve();

    expect(mockRouter.push).toHaveBeenCalledExactlyOnceWith("/current");
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it.each(["cancel", "reject"])("should not resume after confirmation %s", async (outcome) => {
    mockUseShouldBlock.mockReturnValue(true);

    let finish: VoidFunction = () => undefined;
    const promise = new Promise<boolean>((resolve, reject) => {
      finish = () => {
        if (outcome === "reject") {
          reject(new Error("Dismissed"));
        } else {
          resolve(false);
        }
      };
    });
    const onAllow = vi.fn();

    renderHook(() =>
      useNavigationBlocker({ message: "Leave?", onConfirm: () => promise, onAllow })
    );

    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/next")).toThrow();
    finish();
    await promise.catch(() => false);
    await Promise.resolve();

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(onAllow).not.toHaveBeenCalled();
  });

  it.each([true, false])("should preserve synchronous confirmation %s", (confirmed) => {
    mockUseShouldBlock.mockReturnValue(true);

    const onAllow = vi.fn();
    const onBlock = vi.fn();

    renderHook(() =>
      useNavigationBlocker({ message: "Leave?", onConfirm: () => confirmed, onAllow, onBlock })
    );

    const handler = onMock.mock.calls[0][1];

    if (confirmed) {
      expect(() => handler("/next")).not.toThrow();
      expect(onAllow).toHaveBeenCalledTimes(1);
    } else {
      expect(() => handler("/next")).toThrow("Route change aborted by user");
      expect(onAllow).not.toHaveBeenCalled();
    }
    expect(onBlock).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("should block silently without asking for confirmation", () => {
    mockUseShouldBlock.mockReturnValue(true);

    const onConfirm = vi.fn();
    const onAllow = vi.fn();

    renderHook(() => useNavigationBlocker({ onConfirm, onAllow }));

    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/next")).toThrow("Route change blocked");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onAllow).not.toHaveBeenCalled();
    expect(mockRouter.events.emit).toHaveBeenCalledWith("routeChangeError");
  });

  it.each(["complete", "reject", "different URL"])(
    "should clear unused replay permission after %s",
    async (outcome) => {
      mockUseShouldBlock.mockReturnValue(true);

      let finishPush: VoidFunction = () => undefined;
      const pushPromise = new Promise<boolean>((resolve, reject) => {
        finishPush = () => {
          if (outcome === "reject") {
            reject(new Error("Push failed"));
          } else {
            resolve(true);
          }
        };
      });

      vi.mocked(mockRouter.push).mockReturnValue(pushPromise);

      const onConfirm = vi.fn().mockResolvedValue(true);
      const onAllow = vi.fn();

      renderHook(() => useNavigationBlocker({ message: "Leave?", onConfirm, onAllow }));

      const handler = onMock.mock.calls[0][1];

      expect(() => handler("/next")).toThrow();
      await Promise.resolve();
      if (outcome === "different URL") {
        onConfirm.mockReturnValue(new Promise<boolean>(() => undefined));
        expect(() => handler("/other")).toThrow();
      } else {
        finishPush();
        await pushPromise.catch(() => false);
      }

      expect(() => handler("/next")).toThrow();
      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(outcome === "different URL" ? 3 : 2);
    }
  );

  it.each([true, false])(
    "should let a synchronous answer %s supersede an async prompt",
    async (confirmed) => {
      mockUseShouldBlock.mockReturnValue(true);

      let resolveFirst: (value: boolean) => void = () => undefined;
      const first = new Promise<boolean>((resolve) => {
        resolveFirst = resolve;
      });
      const onConfirm = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(confirmed);
      const onAllow = vi.fn();

      renderHook(() => useNavigationBlocker({ message: "Leave?", onConfirm, onAllow }));

      const handler = onMock.mock.calls[0][1];

      expect(() => handler("/old")).toThrow();
      if (confirmed) {
        expect(() => handler("/current")).not.toThrow();
      } else {
        expect(() => handler("/current")).toThrow();
      }
      resolveFirst(true);
      await first;
      await Promise.resolve();

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(onAllow).toHaveBeenCalledTimes(confirmed ? 1 : 0);
    }
  );

  it("should notify the current callback without discarding a pending attempt", async () => {
    mockUseShouldBlock.mockReturnValue(true);

    let resolveConfirm: (value: boolean) => void = () => undefined;
    const promise = new Promise<boolean>((resolve) => {
      resolveConfirm = resolve;
    });
    const previousAllow = vi.fn();
    const currentAllow = vi.fn();
    let onAllow = previousAllow;
    let scope = ["editor", "navigation"];
    const { rerender } = renderHook(() =>
      useNavigationBlocker({
        scope,
        message: "Leave?",
        onConfirm: () => promise,
        onAllow,
      })
    );
    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/next")).toThrow();
    onAllow = currentAllow;
    scope = ["navigation", "editor", "editor"];
    rerender();
    resolveConfirm(true);
    await promise;
    await Promise.resolve();

    expect(mockRouter.push).toHaveBeenCalledExactlyOnceWith("/next");
    expect(previousAllow).not.toHaveBeenCalled();
    expect(currentAllow).toHaveBeenCalledTimes(1);
  });

  it.each(["replacement", "detach"])("should not replay if onAllow causes %s", async (action) => {
    mockUseShouldBlock.mockReturnValue(true);

    const onConfirm = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockReturnValue(new Promise<boolean>(() => undefined));
    const onAllow = vi.fn(() => {
      if (action === "detach") {
        unmount();
      } else {
        const handler = onMock.mock.calls[0][1];

        expect(() => handler("/replacement")).toThrow();
      }
    });
    const { unmount } = renderHook(() =>
      useNavigationBlocker({
        message: "Leave?",
        onConfirm,
        onAllow,
      })
    );
    const handler = onMock.mock.calls[0][1];

    expect(() => handler("/old")).toThrow();

    await Promise.resolve();
    await Promise.resolve();

    expect(onAllow).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it.each(["onBlock", "onConfirm"])(
    "should abort synchronous approval superseded by %s",
    (callback) => {
      mockUseShouldBlock.mockReturnValue(true);

      let replaced = false;
      const onAllow = vi.fn();

      function replaceNavigation(): void {
        replaced = true;

        const handler = onMock.mock.calls[0][1];

        expect(() => handler("/replacement")).not.toThrow();
      }

      renderHook(() =>
        useNavigationBlocker({
          message: "Leave?",
          onBlock: () => {
            if (callback === "onBlock" && !replaced) {
              replaceNavigation();
            }
          },
          onConfirm: () => {
            if (callback === "onConfirm" && !replaced) {
              replaceNavigation();
            }

            return true;
          },
          onAllow,
        })
      );

      const handler = onMock.mock.calls[0][1];

      expect(() => handler("/old")).toThrow("Route change aborted by user");
      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(mockRouter.events.emit).toHaveBeenCalledExactlyOnceWith("routeChangeError");
      expect(mockRouter.push).not.toHaveBeenCalled();
    }
  );

  describe("Performance", () => {
    it("should update listener when message changes", () => {
      mockUseShouldBlock.mockReturnValue(true);

      let message = "Message 1";

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: true,
          message,
        })
      );

      const firstHandler = onMock.mock.calls[0][1];

      message = "Message 2";
      rerender();

      const secondHandler = onMock.mock.calls[1][1];

      // Should have different handlers (new closure)
      expect(firstHandler).not.toBe(secondHandler);
    });
  });

  describe("Edge cases", () => {
    it("should handle navigation without message", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          // No message
        })
      );

      // Should still register listener
      expect(onMock).toHaveBeenCalled();
    });

    it("should handle scope array", () => {
      renderHook(() =>
        useNavigationBlocker({
          scope: ["scope1", "scope2"],
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(undefined, ["scope1", "scope2"]);
    });
  });
});
