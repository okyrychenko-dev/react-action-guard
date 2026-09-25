import { act, render, renderHook, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useActionBlocker } from "../../hooks/useActionBlocker";
import { useBlockingInfo } from "../../hooks/useBlockingInfo";
import { useIsBlocked } from "../../hooks/useIsBlocked";
import { uiBlockingStoreApi } from "../../store/uiBlockingStore.store";
import {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "../UIBlockingContext";
import { useResolvedStoreApi, useResolvedValue } from "../useResolvedStore";

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
      }).toThrow("UIBlocking store hooks must be used within a UIBlockingProvider");

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

  describe("useOptionalUIBlockingContext", () => {
    it("should return null when used outside provider", () => {
      const { result } = renderHook(() => useOptionalUIBlockingContext());

      expect(result.current).toBeNull();
    });

    it("should return the nearest store when used inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );
      const { result } = renderHook(() => useOptionalUIBlockingContext(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current).not.toBe(uiBlockingStoreApi);
    });
  });

  describe("useResolvedStoreApi", () => {
    it("should return global store when outside provider", () => {
      const { result } = renderHook(() => useResolvedStoreApi());

      expect(result.current).toBe(uiBlockingStoreApi);
    });

    it("should return context store when inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );
      const { result } = renderHook(() => useResolvedStoreApi(), { wrapper });

      // Context store should be different from global store
      expect(result.current).not.toBe(uiBlockingStoreApi);
      expect(result.current.getState).toBeDefined();
    });
  });

  describe("Store isolation", () => {
    it("should isolate state between provider and global store", () => {
      const TestComponent = () => {
        useActionBlocker("provider-blocker", { scope: "test", reason: "Provider test" });
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
        useActionBlocker("blocker-1", { scope: "shared-scope", reason: "Provider 1" });

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

    it("should resolve the nearest nested provider store", () => {
      const stores: Array<ReturnType<typeof useResolvedStoreApi>> = [];

      function StoreCapture(): null {
        stores.push(useResolvedStoreApi());

        return null;
      }

      render(
        <UIBlockingProvider>
          <StoreCapture />
          <UIBlockingProvider>
            <StoreCapture />
          </UIBlockingProvider>
        </UIBlockingProvider>
      );

      expect(stores).toHaveLength(2);
      expect(stores[0]).not.toBe(stores[1]);
      expect(stores[0]).not.toBe(uiBlockingStoreApi);
      expect(stores[1]).not.toBe(uiBlockingStoreApi);
    });
  });

  it("should publish isolated immutable snapshots to provider React hooks", () => {
    const providerStores: Array<ReturnType<typeof useResolvedStoreApi>> = [];

    function Capture(): null {
      providerStores.push(useResolvedStoreApi());

      return null;
    }

    function Info({ testId }: { testId: string }) {
      const blockers = useBlockingInfo("form");

      return <div data-testid={testId}>{blockers.map(({ reason }) => reason).join(",")}</div>;
    }

    render(
      <>
        <Info testId="global-info" />
        <UIBlockingProvider>
          <Capture />
          <Info testId="provider-info" />
        </UIBlockingProvider>
      </>
    );

    const providerStore = providerStores[0];

    expect(providerStore).toBeDefined();
    act(() => {
      const { addBlocker } = providerStore.getState();

      addBlocker("provider", { scope: "form", reason: "Provider" });
    });

    expect(screen.getByTestId("provider-info")).toHaveTextContent("Provider");
    expect(screen.getByTestId("global-info")).toBeEmptyDOMElement();
    const { blockingSnapshot: providerSnapshot } = providerStore.getState();
    const { blockingSnapshot: globalSnapshot } = uiBlockingStoreApi.getState();

    expect(Object.isFrozen(providerSnapshot)).toBe(true);
    expect(globalSnapshot).toHaveLength(0);
  });

  it("should publish equivalent global and provider snapshots", () => {
    const { result } = renderHook(() => useUIBlockingContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      ),
    });
    const providerStore = result.current;
    const globalStore = uiBlockingStoreApi;

    act(() => {
      const { addBlocker: addGlobal } = globalStore.getState();
      const { addBlocker: addProvider } = providerStore.getState();
      const config = { scope: "form", reason: "Saving", timestamp: 1 };

      addGlobal("same", config);
      addProvider("same", config);
    });

    const { blockingSnapshot: globalAdded } = globalStore.getState();
    const { blockingSnapshot: providerAdded } = providerStore.getState();

    expect(providerAdded).toEqual(globalAdded);
    expect(providerAdded).not.toBe(globalAdded);

    act(() => {
      const { updateBlocker: updateGlobal } = globalStore.getState();
      const { updateBlocker: updateProvider } = providerStore.getState();

      updateGlobal("same", { reason: "Finishing" });
      updateProvider("same", { reason: "Finishing" });
    });

    const { blockingSnapshot: globalUpdated } = globalStore.getState();
    const { blockingSnapshot: providerUpdated } = providerStore.getState();

    expect(providerUpdated).toEqual(globalUpdated);
  });

  it("should start a new lifecycle when provider identity changes", () => {
    function Info() {
      const blockers = useBlockingInfo("form");

      return (
        <div data-testid="provider-info">{blockers.map(({ reason }) => reason).join(",")}</div>
      );
    }

    function AddButton() {
      const store = useUIBlockingContext();

      function handleClick(): void {
        const { addBlocker } = store.getState();

        addBlocker("owned", { scope: "form", reason: "Old provider" });
      }

      return <button onClick={handleClick}>Add</button>;
    }

    const { rerender } = render(
      <UIBlockingProvider key="old">
        <AddButton />
        <Info />
      </UIBlockingProvider>
    );

    act(() => screen.getByRole("button", { name: "Add" }).click());
    expect(screen.getByTestId("provider-info")).toHaveTextContent("Old provider");

    rerender(
      <UIBlockingProvider key="new">
        <AddButton />
        <Info />
      </UIBlockingProvider>
    );

    expect(screen.getByTestId("provider-info")).toBeEmptyDOMElement();
  });

  describe("useUIBlockingStoreFromContext", () => {
    it("should return the full context store when used without a selector", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );

      const { result } = renderHook(() => useUIBlockingStoreFromContext(), { wrapper });

      expect(result.current.activeBlockers).toBeInstanceOf(Map);
      expect(result.current.addBlocker).toBeTypeOf("function");
    });

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
        renderHook(() => useUIBlockingStoreFromContext((state) => state.isBlocked("test")));
      }).toThrow("UIBlocking store hooks must be used within a UIBlockingProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("useResolvedValue", () => {
    it("should work with global store outside provider", () => {
      act(() => {
        uiBlockingStoreApi.getState().addBlocker("test", { scope: "global" });
      });

      const { result } = renderHook(() => useResolvedValue((state) => state.isBlocked("global")));

      expect(result.current).toBe(true);
    });

    it("should work with context store inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UIBlockingProvider>{children}</UIBlockingProvider>
      );

      const { result } = renderHook(() => useResolvedValue((state) => state.isBlocked("test")), {
        wrapper,
      });

      expect(result.current).toBe(false);
    });
  });

  describe("Provider options", () => {
    it("should accept middlewares option", () => {
      const middleware = vi.fn();

      const { getByTestId } = render(
        <UIBlockingProvider middlewares={[middleware]}>
          <TestBlockerComponent />
        </UIBlockingProvider>
      );

      // Wait for component to render and blocker to be registered
      expect(getByTestId("blocker-test")).toBeInTheDocument();

      // Middleware should have been called when blocker was added
      expect(middleware).toHaveBeenCalled();
    });

    it("should keep middleware configuration stable for one provider lifetime", () => {
      const initialMiddleware = vi.fn();
      const updatedMiddleware = vi.fn();

      const { rerender } = render(
        <UIBlockingProvider middlewares={[initialMiddleware]}>
          <AddBlockerButton blockerId="first" />
        </UIBlockingProvider>
      );

      act(() => {
        screen.getByRole("button", { name: "Add blocker" }).click();
      });
      initialMiddleware.mockClear();

      rerender(
        <UIBlockingProvider middlewares={[updatedMiddleware]}>
          <AddBlockerButton blockerId="second" />
        </UIBlockingProvider>
      );

      act(() => {
        screen.getByRole("button", { name: "Add blocker" }).click();
      });

      expect(initialMiddleware).toHaveBeenCalledOnce();
      expect(updatedMiddleware).not.toHaveBeenCalled();
    });

    it("should apply middleware configuration to a new keyed provider lifetime", () => {
      const initialMiddleware = vi.fn();
      const replacementMiddleware = vi.fn();

      const { rerender } = render(
        <UIBlockingProvider key="initial" middlewares={[initialMiddleware]}>
          <AddBlockerButton blockerId="first" />
        </UIBlockingProvider>
      );

      rerender(
        <UIBlockingProvider key="replacement" middlewares={[replacementMiddleware]}>
          <AddBlockerButton blockerId="second" />
        </UIBlockingProvider>
      );

      act(() => {
        screen.getByRole("button", { name: "Add blocker" }).click();
      });

      expect(replacementMiddleware).toHaveBeenCalledOnce();
    });
  });

  describe("Store stability", () => {
    it("should maintain same store instance across re-renders", () => {
      const stores: Array<ReturnType<typeof useResolvedStoreApi>> = [];

      const StoreCapture = () => {
        const store = useResolvedStoreApi();

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
  useActionBlocker("test-blocker", { scope: "test", reason: "Test" });

  return <div data-testid="blocker-test">Test</div>;
}

function AddBlockerButton({ blockerId }: { blockerId: string }) {
  const store = useUIBlockingContext();

  function handleClick(): void {
    store.getState().addBlocker(blockerId);
  }

  return <button onClick={handleClick}>Add blocker</button>;
}
