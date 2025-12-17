import { act, render, renderHook, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBlocker } from "../../hooks/useBlocker";
import { useIsBlocked } from "../../hooks/useIsBlocked";
import { uiBlockingStoreApi } from "../../store/uiBlockingStore.store";
import {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "../UIBlockingContext";
import { useResolvedStore, useResolvedStoreWithSelector } from "../useResolvedStore";

describe("UIBlockingProvider", () => {
  beforeEach(() => {
    // Clean up global store between tests
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  describe("useIsInsideUIBlockingProvider", () => {
    it("should return false when outside provider", () => {
      const { result } = renderHook(() => useIsInsideUIBlockingProvider());
      expect(result.current).toBe(false);
    });

    it("should return true when inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );
      const { result } = renderHook(() => useIsInsideUIBlockingProvider(), { wrapper });
      expect(result.current).toBe(true);
    });
  });

  describe("useUIBlockingContext", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUIBlockingContext());
      }).toThrow("useUIBlockingContext must be used within UIBlockingProvider");

      consoleSpy.mockRestore();
    });

    it("should return store when inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );
      const { result } = renderHook(() => useUIBlockingContext(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.getState).toBeDefined();
      expect(result.current.getState().addBlocker).toBeDefined();
    });
  });

  describe("useResolvedStore", () => {
    it("should return global store when outside provider", () => {
      const { result } = renderHook(() => useResolvedStore());
      expect(result.current).toBe(uiBlockingStoreApi);
    });

    it("should return context store when inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );
      const { result } = renderHook(() => useResolvedStore(), { wrapper });
      // Context store should be different from global store
      expect(result.current).not.toBe(uiBlockingStoreApi);
      expect(result.current.getState).toBeDefined();
    });
  });

  describe("Store isolation", () => {
    it("should isolate state between provider and global store", () => {
      const TestComponent = () => {
        useBlocker("provider-blocker", { scope: "test", reason: "Provider test" });
        const isBlocked = useIsBlocked("test");
        return <div data-testid="blocked">{isBlocked ? "blocked" : "not-blocked"}</div>;
      };

      // Add blocker to global store
      act(() => {
        uiBlockingStoreApi.getState().addBlocker("global-blocker", {
          scope: "global-scope",
          reason: "Global test",
        });
      });

      // Render component inside provider
      render(
        <UIBlockingProvider>
          <TestComponent />
        </UIBlockingProvider>
      );

      // Provider should show its own blocker
      expect(screen.getByTestId("blocked")).toHaveTextContent("blocked");

      // Global store should still have its own blocker
      expect(uiBlockingStoreApi.getState().isBlocked("global-scope")).toBe(true);

      // Global store should NOT have provider's blocker
      expect(uiBlockingStoreApi.getState().isBlocked("test")).toBe(false);
    });

    it("should isolate state between multiple providers", () => {
      const BlockerDisplay = ({ testId }: { testId: string }) => {
        const isBlocked = useIsBlocked("shared-scope");
        return <div data-testid={testId}>{isBlocked ? "blocked" : "not-blocked"}</div>;
      };

      const Provider1Content = () => {
        useBlocker("blocker-1", { scope: "shared-scope", reason: "Provider 1" });
        return <BlockerDisplay testId="provider-1" />;
      };

      render(
        <>
          <UIBlockingProvider>
            <Provider1Content />
          </UIBlockingProvider>
          <UIBlockingProvider>
            <BlockerDisplay testId="provider-2" />
          </UIBlockingProvider>
        </>
      );

      // Provider 1 should be blocked (has blocker)
      expect(screen.getByTestId("provider-1")).toHaveTextContent("blocked");

      // Provider 2 should NOT be blocked (isolated store)
      expect(screen.getByTestId("provider-2")).toHaveTextContent("not-blocked");
    });
  });

  describe("useUIBlockingStoreFromContext", () => {
    it("should select state from context store", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );

      const { result } = renderHook(
        () => useUIBlockingStoreFromContext((state) => state.activeBlockers),
        { wrapper }
      );

      expect(result.current).toBeInstanceOf(Map);
      expect(result.current.size).toBe(0);
    });

    it("should throw when used outside provider", () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUIBlockingStoreFromContext((state) => state.activeBlockers));
      }).toThrow("useUIBlockingContext must be used within UIBlockingProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("useResolvedStoreWithSelector", () => {
    it("should work with global store outside provider", () => {
      act(() => {
        uiBlockingStoreApi.getState().addBlocker("test", { scope: "global" });
      });

      const { result } = renderHook(() =>
        useResolvedStoreWithSelector((state) => state.isBlocked("global"))
      );

      expect(result.current).toBe(true);
    });

    it("should work with context store inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );

      const { result } = renderHook(
        () => useResolvedStoreWithSelector((state) => state.isBlocked("test")),
        { wrapper }
      );

      expect(result.current).toBe(false);
    });
  });

  describe("Provider options", () => {
    it("should accept enableDevtools option", () => {
      // Should not throw
      const { unmount } = render(
        <UIBlockingProvider enableDevtools={false}>
          <div>Test</div>
        </UIBlockingProvider>
      );
      unmount();
    });

    it("should accept devtoolsName option", () => {
      // Should not throw
      const { unmount } = render(
        <UIBlockingProvider devtoolsName="CustomName">
          <div>Test</div>
        </UIBlockingProvider>
      );
      unmount();
    });

    it("should accept middlewares option", () => {
      const middleware = vi.fn();

      render(
        <UIBlockingProvider middlewares={[middleware]}>
          <TestBlockerComponent />
        </UIBlockingProvider>
      );

      // Middleware should have been called when blocker was added
      expect(middleware).toHaveBeenCalled();
    });
  });

  describe("Store stability", () => {
    it("should maintain same store instance across re-renders", () => {
      const stores: Array<ReturnType<typeof useResolvedStore>> = [];

      const StoreCapture = () => {
        const store = useResolvedStore();
        stores.push(store);
        return null;
      };

      const { rerender } = render(
        <UIBlockingProvider>
          <StoreCapture />
        </UIBlockingProvider>
      );

      rerender(
        <UIBlockingProvider>
          <StoreCapture />
        </UIBlockingProvider>
      );

      expect(stores.length).toBe(2);
      expect(stores[0]).toBe(stores[1]);
    });
  });
});

// Helper component for middleware test
function TestBlockerComponent() {
  useBlocker("test-blocker", { scope: "test", reason: "Test" });
  return <div>Test</div>;
}
