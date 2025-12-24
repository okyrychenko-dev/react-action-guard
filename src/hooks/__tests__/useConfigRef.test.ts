import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useConfigRef } from "../useConfigRef";

describe("useConfigRef", () => {
  it("should initialize ref with the provided config", () => {
    const config = { value: 1, name: "test" };

    const { result } = renderHook(() => useConfigRef(config));

    expect(result.current.current).toEqual(config);
  });

  it("should update ref when config changes", () => {
    const initialConfig = { value: 1 };
    const updatedConfig = { value: 2 };

    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config: initialConfig },
    });

    expect(result.current.current).toEqual(initialConfig);

    rerender({ config: updatedConfig });

    expect(result.current.current).toEqual(updatedConfig);
  });

  it("should maintain ref identity across rerenders", () => {
    const config = { value: 1 };

    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config },
    });

    const initialRef = result.current;

    rerender({ config: { value: 2 } });

    expect(result.current).toBe(initialRef);
  });

  it("should work with primitive values", () => {
    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config: "initial" },
    });

    expect(result.current.current).toBe("initial");

    rerender({ config: "updated" });

    expect(result.current.current).toBe("updated");
  });

  it("should work with null and undefined", () => {
    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config: null as string | null },
    });

    expect(result.current.current).toBeNull();

    rerender({ config: "value" });

    expect(result.current.current).toBe("value");

    rerender({ config: null });

    expect(result.current.current).toBeNull();
  });

  it("should work with functions", () => {
    const fn1 = (): number => 1;
    const fn2 = (): number => 2;

    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config: fn1 },
    });

    expect(result.current.current).toBe(fn1);

    rerender({ config: fn2 });

    expect(result.current.current).toBe(fn2);
  });

  it("should work with arrays", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(({ config }) => useConfigRef(config), {
      initialProps: { config: arr1 },
    });

    expect(result.current.current).toBe(arr1);

    rerender({ config: arr2 });

    expect(result.current.current).toBe(arr2);
  });

  it("should be accessible in callbacks without stale closures", async () => {
    let capturedValue: number | undefined;

    const { result, rerender } = renderHook(
      ({ config }) => {
        const ref = useConfigRef(config);

        return {
          ref,
          captureValue: (): void => {
            capturedValue = ref.current.value;
          },
        };
      },
      {
        initialProps: { config: { value: 1 } },
      }
    );

    // Capture value before update
    act(() => {
      result.current.captureValue();
    });

    expect(capturedValue).toBe(1);

    // Update config
    rerender({ config: { value: 42 } });

    // Capture value after update - ref should have latest value
    act(() => {
      result.current.captureValue();
    });

    expect(capturedValue).toBe(42);
  });
});
