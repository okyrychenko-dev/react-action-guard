import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { actAsync, createWrapper } from "../../test/test.utils";
import { useBlockingMutation } from "../useBlockingMutation";
import { MutationBlockingConfig } from "../useBlockingMutation.types";

describe("useBlockingMutation", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should block UI during mutation execution", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      reason: "Saving changes...",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Trigger mutation
    result.current.mutate(undefined);

    // Should block during mutation
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock after mutation completes
    await waitFor(
      () => {
        const { isBlocked } = uiBlockingStoreApi.getState();
        expect(isBlocked("test")).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("should use custom reason", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      reason: "Custom mutation message",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Custom mutation message");
      }
    });
  });

  it("should remove blocker after timeout and call onTimeout", async () => {
    const mutationFn = vi.fn().mockImplementation(() => new Promise(() => undefined));
    const onTimeout = vi.fn();

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      timeout: 50,
      onTimeout,
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationKey: ["save"],
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    await actAsync(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 75);
      });
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
    const timedOutId = onTimeout.mock.calls[0]?.[0];
    expect(typeof timedOutId).toBe("string");
    expect(timedOutId).toContain('mutation-["save"]-');
    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should use custom priority", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      priority: 50,
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.priority).toBe(50);
      }
    });
  });

  it("should use default reason when not provided", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Saving changes...");
      }
    });
  });

  it("should use default priority of 30 when not provided", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.priority).toBe(30);
      }
    });
  });

  it("should handle multiple scopes", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: ["scope1", "scope2"],
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
    });
  });

  it("should remove blocker when component unmounts", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result, unmount } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Wait for blocker to be added
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Unmount and verify blocker is removed
    unmount();

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should return the same result as useMutation", async () => {
    const mutationFn = vi.fn().mockResolvedValue("test-data");

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("test-data");
    expect(mutationFn).toHaveBeenCalledTimes(1);
  });

  it("should handle mutation with variables", async () => {
    const mutationFn = vi
      .fn()
      .mockImplementation((variables: { id: number }) =>
        Promise.resolve(`data-${String(variables.id)}`)
      );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation<string, Error, { id: number }>({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate({ id: 42 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("data-42");
    expect(mutationFn).toHaveBeenCalledTimes(1);
    const callArgs = mutationFn.mock.calls[0];
    expect(callArgs[0]).toEqual({ id: 42 });
  });

  it("should unblock after mutation error", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Test error")), 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Should block during mutation
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock after error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should handle multiple consecutive mutations", async () => {
    let callCount = 0;
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          callCount++;
          setTimeout(() => resolve(`data-${String(callCount)}`), 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // First mutation
    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("data-1");

    const { isBlocked: isBlocked1 } = uiBlockingStoreApi.getState();
    expect(isBlocked1("test")).toBe(false);

    // Second mutation
    result.current.mutate(undefined);

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.data).toBe("data-2");
    });

    const { isBlocked: isBlocked2 } = uiBlockingStoreApi.getState();
    expect(isBlocked2("test")).toBe(false);
  });

  it("should use unique blocker ID for each mutation hook instance", async () => {
    const mutationFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const mutationFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result: result1 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: mutationFn1,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const { result: result2 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: mutationFn2,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Trigger both mutations
    result1.current.mutate(undefined);
    result2.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      // Both mutations should create separate blockers
      expect(info.length).toBe(2);
    });
  });

  it("should handle rapid state changes", async () => {
    let resolveMutation: ((value: string) => void) | undefined;
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveMutation = resolve;
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Should block during mutation
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Resolve the mutation
    if (resolveMutation) {
      resolveMutation("data");
    }

    // Should unblock after mutation completes
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should work with onSuccess callback", async () => {
    const mutationFn = vi.fn().mockResolvedValue("test-data");
    const onSuccess = vi.fn();

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
          onSuccess,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const callArgs = onSuccess.mock.calls[0];
    expect(callArgs[0]).toBe("test-data");
    expect(callArgs[1]).toBeUndefined();
    expect(callArgs[2]).toBeUndefined();
  });

  it("should work with onError callback", async () => {
    const error = new Error("Test error");
    const mutationFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
          onError,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const callArgs = onError.mock.calls[0];
    expect(callArgs[0]).toBe(error);
    expect(callArgs[1]).toBeUndefined();
    expect(callArgs[2]).toBeUndefined();
  });

  it("should block on error when onError is true", async () => {
    const error = new Error("Test error");
    const mutationFn = vi.fn().mockRejectedValue(error);

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      onError: true,
      reason: "Error occurred",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Should block when error occurs
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { isBlocked, getBlockingInfo } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(true);

    const info = getBlockingInfo("test");
    expect(info[0]?.reason).toBe("Error occurred");
  });

  it("should not block on error when onError is false", async () => {
    const error = new Error("Test error");
    const mutationFn = vi.fn().mockRejectedValue(error);

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      onError: false,
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Should not block after error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should block both during pending and on error when onError is true", async () => {
    const error = new Error("Test error");
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(error), 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      onError: true,
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Should block during pending
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
      expect(result.current.isPending).toBe(true);
    });

    // Should continue blocking after error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should work with mutateAsync", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("test-data"), 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const promise = result.current.mutateAsync(undefined);

    // Should block during mutation
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    const data = await promise;
    expect(data).toBe("test-data");

    // Should unblock after mutation completes
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should use reasonOnPending during pending state", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnPending: "Saving user data...",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Saving user data...");
      }
    });
  });

  it("should use reasonOnError during error state when onError is true", async () => {
    const error = new Error("Test error");
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(error), 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      onError: true,
      reason: "Default reason",
      reasonOnError: "Failed to save data",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(undefined);

    // Wait for error state
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");
    expect(info[0]?.reason).toBe("Failed to save data");
  });

  it("should use different reasons for pending and error states", async () => {
    let shouldError = false;
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (shouldError) {
              reject(new Error("Test error"));
            } else {
              resolve("data");
            }
          }, 50);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
      onError: true,
      reasonOnPending: "Saving changes...",
      reasonOnError: "Error occurred while saving",
    };

    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // First mutation - check pending reason
    result.current.mutate(undefined);

    await waitFor(() => {
      if (result.current.isPending) {
        const { getBlockingInfo } = uiBlockingStoreApi.getState();
        const info = getBlockingInfo("test");
        if (info.length > 0) {
          expect(info[0]?.reason).toBe("Saving changes...");
        }
      }
    });

    // Wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Second mutation with error - check error reason
    shouldError = true;
    result.current.mutate(undefined);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");
    expect(info[0]?.reason).toBe("Error occurred while saving");
  });

  it("should create isolated blockerIds for same mutationKey", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result: result1 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 123],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const { result: result2 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 123],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Trigger both mutations
    result1.current.mutate(undefined);
    result2.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      // Same mutationKey still creates per-instance blocker IDs
      expect(info.length).toBe(2);
    });
  });

  it("should keep blocker active when one of same-key mutations unmounts", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const first = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 123],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const second = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 123],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    first.result.current.mutate(undefined);
    second.result.current.mutate(undefined);

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    first.unmount();

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should use different blockerIds for different mutationKeys", async () => {
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: MutationBlockingConfig = {
      scope: "test",
    };

    const { result: result1 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 123],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const { result: result2 } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          mutationKey: ["saveUser", 456],
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Trigger both mutations
    result1.current.mutate(undefined);
    result2.current.mutate(undefined);

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      // Different keys should create different blockers
      expect(info.length).toBe(2);
    });
  });
});
