import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBlocker } from "../useBlocker";
import { useUIBlockingStore } from "../../store";
import type { BlockerConfig } from "../../store";

describe("useBlocker", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
  });

  it("should add blocker when component mounts", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("test")).toBe(true);
  });

  it("should remove blocker when component unmounts", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    const { unmount } = renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { isBlocked: isBlockedBefore } = useUIBlockingStore.getState();

    expect(isBlockedBefore("test")).toBe(true);

    unmount();

    const { isBlocked: isBlockedAfter } = useUIBlockingStore.getState();

    expect(isBlockedAfter("test")).toBe(false);
  });

  it("should not add blocker when isActive is false", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    renderHook(() => {
      useBlocker(blockerId, config, false);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("test")).toBe(false);
  });

  it("should add blocker when isActive changes to true", async () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => {
        useBlocker(blockerId, config, active);
      },
      { initialProps: { active: false } }
    );

    const { isBlocked: isBlockedInitial } = useUIBlockingStore.getState();

    expect(isBlockedInitial("test")).toBe(false);

    rerender({ active: true });

    await waitFor(() => {
      const { isBlocked } = useUIBlockingStore.getState();

      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should remove blocker when isActive changes to false", async () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => {
        useBlocker(blockerId, config, active);
      },
      { initialProps: { active: true } }
    );

    const { isBlocked: isBlockedInitial } = useUIBlockingStore.getState();

    expect(isBlockedInitial("test")).toBe(true);

    rerender({ active: false });

    await waitFor(() => {
      const { isBlocked } = useUIBlockingStore.getState();

      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should update blocker when blockerId changes", async () => {
    const config: BlockerConfig = { scope: "test" };

    const { rerender } = renderHook(
      ({ id }: { id: string }) => {
        useBlocker(id, config);
      },
      { initialProps: { id: "blocker-1" } }
    );

    const { getBlockingInfo: getInfoInitial } = useUIBlockingStore.getState();
    const infoInitial = getInfoInitial("test");

    expect(infoInitial).toHaveLength(1);
    expect(infoInitial[0]?.id).toBe("blocker-1");

    rerender({ id: "blocker-2" });

    await waitFor(() => {
      const { getBlockingInfo } = useUIBlockingStore.getState();
      const info = getBlockingInfo("test");

      expect(info).toHaveLength(1);
      expect(info[0]?.id).toBe("blocker-2");
    });
  });

  it("should not add blocker when blockerId is empty", () => {
    const config: BlockerConfig = { scope: "test" };

    renderHook(() => {
      useBlocker("", config);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("test")).toBe(false);
  });

  it("should use default scope when not provided", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = {};

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked()).toBe(true);
  });

  it("should handle multiple scopes", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: ["scope1", "scope2"] };

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("scope1")).toBe(true);
    expect(isBlocked("scope2")).toBe(true);
  });

  it("should handle custom priority", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test", priority: 100 };

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { getBlockingInfo } = useUIBlockingStore.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.priority).toBe(100);
  });

  it("should handle custom reason", () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test", reason: "Custom reason" };

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    const { getBlockingInfo } = useUIBlockingStore.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.reason).toBe("Custom reason");
  });

  it("should handle multiple instances of the hook", () => {
    const config1: BlockerConfig = { scope: "scope1" };
    const config2: BlockerConfig = { scope: "scope2" };

    renderHook(() => {
      useBlocker("blocker-1", config1);
    });
    renderHook(() => {
      useBlocker("blocker-2", config2);
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("scope1")).toBe(true);
    expect(isBlocked("scope2")).toBe(true);
  });

  it("should clean up only its own blocker on unmount", () => {
    const config1: BlockerConfig = { scope: "test" };
    const config2: BlockerConfig = { scope: "test" };

    renderHook(() => {
      useBlocker("blocker-1", config1);
    });
    const { unmount } = renderHook(() => {
      useBlocker("blocker-2", config2);
    });

    const { isBlocked: isBlockedBefore } = useUIBlockingStore.getState();

    expect(isBlockedBefore("test")).toBe(true);

    unmount();

    const { isBlocked: isBlockedAfter } = useUIBlockingStore.getState();

    expect(isBlockedAfter("test")).toBe(true); // blocker-1 still exists
  });

  it("should handle rapid mount/unmount cycles", async () => {
    const blockerId = "test-blocker";
    const config: BlockerConfig = { scope: "test" };

    const { unmount: unmount1 } = renderHook(() => {
      useBlocker(blockerId, config);
    });
    unmount1();

    const { unmount: unmount2 } = renderHook(() => {
      useBlocker(blockerId, config);
    });
    unmount2();

    renderHook(() => {
      useBlocker(blockerId, config);
    });

    await waitFor(() => {
      const { isBlocked } = useUIBlockingStore.getState();

      expect(isBlocked("test")).toBe(true);
    });
  });
});
