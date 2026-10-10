import { act, renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { UIBlockingProvider, useResolvedStoreApi } from "./context";
import { createTypedHooks } from "./createTypedHooks";
import type { BlockerInfo } from "./store";
import type { ScopeValue } from "./types";

type AppScope = "checkout" | "profile";

describe("typed metadata observation", () => {
  it("should accept typed readonly arrays and keep rejecting unknown scope names", () => {
    const { useBlockingInfo: useTypedBlockingInfo } = createTypedHooks<AppScope>();
    const scopes: ReadonlyArray<AppScope> = ["checkout", "profile"];
    const { result } = renderHook(
      () => ({
        store: useResolvedStoreApi(),
        info: useTypedBlockingInfo(scopes),
        single: useTypedBlockingInfo("checkout"),
        empty: useTypedBlockingInfo([]),
      }),
      { wrapper: UIBlockingProvider }
    );
    const { store } = result.current;
    const { addBlocker, clearAllBlockers } = store.getState();

    expectTypeOf(useTypedBlockingInfo).parameter(0).toEqualTypeOf<ScopeValue<AppScope>>();
    expectTypeOf<"unknown">().not.toExtend<Parameters<typeof useTypedBlockingInfo>[0]>();
    expectTypeOf<ReadonlyArray<"checkout" | "unknown">>().not.toExtend<
      Parameters<typeof useTypedBlockingInfo>[0]
    >();
    expectTypeOf(result.current.info).toEqualTypeOf<ReadonlyArray<Readonly<BlockerInfo>>>();

    act(() => {
      addBlocker("checkout", { scope: "checkout" });
      addBlocker("profile", { scope: "profile" });
      addBlocker("maintenance", { scope: "global", priority: 50 });
    });

    const { info, single, empty } = result.current;

    expect(info.map(({ id }) => id)).toEqual(["maintenance", "checkout", "profile"]);
    expect(single.map(({ id }) => id)).toEqual(["maintenance", "checkout"]);
    expect(empty).toEqual([]);
    act(() => clearAllBlockers());
  });
});
