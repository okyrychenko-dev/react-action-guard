import {
  uiBlockingStoreApi,
  useResolvedStoreApi,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createDeferred, createWrapper } from "../../test/test.utils";
import { useBlockingMutation } from "../useBlockingMutation";

vi.mock("@okyrychenko-dev/react-action-guard", async (importOriginal) => {
  const original = await importOriginal<typeof import("@okyrychenko-dev/react-action-guard")>();

  return { ...original, useResolvedStoreApi: vi.fn(original.useResolvedStoreApi) };
});

describe("mutation owners returning to a store", () => {
  it.each(["original", "replacement"])(
    "should keep the scope blocked when the %s owner settles first",
    async (firstToSettle) => {
      const provider = renderHook(() => useUIBlockingContext(), {
        wrapper: createWrapper({ blockingProvider: true }),
      });
      const storeA = uiBlockingStoreApi;
      const storeB = provider.result.current;
      const { clearAllBlockers, getBlockingInfo } = storeA.getState();

      clearAllBlockers();
      vi.mocked(useResolvedStoreApi).mockReturnValue(storeA);

      const original = createDeferred<string>();
      const replacement = createDeferred<string>();
      const hook = renderHook(
        () =>
          useBlockingMutation({
            mutationFn: (name: string) =>
              name === "original" ? original.promise : replacement.promise,
            blockingConfig: { scope: "store-return" },
          }),
        { wrapper: createWrapper() }
      );
      let originalPromise = Promise.resolve("");
      let replacementPromise = Promise.resolve("");

      act(() => {
        originalPromise = hook.result.current.mutateAsync("original");
      });
      vi.mocked(useResolvedStoreApi).mockReturnValue(storeB);
      hook.rerender();
      vi.mocked(useResolvedStoreApi).mockReturnValue(storeA);
      hook.rerender();
      act(() => {
        replacementPromise = hook.result.current.mutateAsync("replacement");
      });

      await act(async () => {
        if (firstToSettle === "original") {
          original.resolve("original");
          await originalPromise;
        } else {
          replacement.resolve("replacement");
          await replacementPromise;
        }
      });
      expect(getBlockingInfo("store-return")).toHaveLength(1);

      await act(async () => {
        original.resolve("original");
        replacement.resolve("replacement");
        await Promise.all([originalPromise, replacementPromise]);
      });
      expect(getBlockingInfo("store-return")).toHaveLength(0);
      hook.unmount();
      provider.unmount();
      vi.mocked(useResolvedStoreApi).mockReset();
    }
  );
});
