import { renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UIBlockingProvider } from "../../../context";
import { uiBlockingStoreApi } from "../../../store";
import { useActionBlocker } from "../useActionBlocker";
import type { ReactNode } from "react";

describe("hook ID collision diagnostics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("should warn when two active hooks register the same ID in one store", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = renderHook(() => useActionBlocker("duplicate", {}));
    const second = renderHook(() => useActionBlocker("duplicate", {}));

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"duplicate"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("same store"));

    first.unmount();
    second.unmount();
  });

  it("should allow equal IDs in isolated provider stores", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const first = renderHook(() => useActionBlocker("isolated", {}), { wrapper });
    const second = renderHook(() => useActionBlocker("isolated", {}), { wrapper });

    expect(warn).not.toHaveBeenCalled();

    first.unmount();
    second.unmount();
  });

  it("should release registrations during Strict Mode cleanup and unmount", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <StrictMode>{children}</StrictMode>
    );
    const first = renderHook(() => useActionBlocker("strict", {}), { wrapper });

    first.unmount();

    const second = renderHook(() => useActionBlocker("strict", {}), { wrapper });

    expect(warn).not.toHaveBeenCalled();

    second.unmount();
  });

  it("should retain tracking for a remaining owner after collision cleanup", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = renderHook(() => useActionBlocker("remaining", {}));
    const second = renderHook(() => useActionBlocker("remaining", {}));

    first.unmount();
    warn.mockClear();

    const third = renderHook(() => useActionBlocker("remaining", {}));

    expect(warn).toHaveBeenCalledTimes(1);

    second.unmount();
    third.unmount();
    warn.mockClear();

    const fresh = renderHook(() => useActionBlocker("remaining", {}));

    expect(warn).not.toHaveBeenCalled();

    fresh.unmount();
  });

  it("should track activation and ID changes without warning for config updates", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = renderHook(() => useActionBlocker("changing", {}));
    const second = renderHook(
      ({ id, active, reason }) => useActionBlocker(id, { reason }, active),
      { initialProps: { id: "changing", active: false, reason: "initial" } }
    );

    expect(warn).not.toHaveBeenCalled();

    second.rerender({ id: "changing", active: true, reason: "initial" });

    expect(warn).toHaveBeenCalledTimes(1);

    second.rerender({ id: "changing", active: true, reason: "updated" });

    expect(warn).toHaveBeenCalledTimes(1);

    second.rerender({ id: "different", active: true, reason: "updated" });
    first.unmount();
    warn.mockClear();

    const replacement = renderHook(() => useActionBlocker("changing", {}));

    expect(warn).not.toHaveBeenCalled();

    replacement.unmount();
    second.unmount();
  });

  it("should preserve production collision behavior without diagnostics", () => {
    vi.stubEnv("NODE_ENV", "production");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = renderHook(() => useActionBlocker("production", { reason: "first" }));
    const second = renderHook(() => useActionBlocker("production", { reason: "second" }));
    const { getBlockingInfo } = uiBlockingStoreApi.getState();

    expect(warn).not.toHaveBeenCalled();
    expect(getBlockingInfo("global")).toEqual([expect.objectContaining({ reason: "second" })]);

    first.unmount();

    expect(getBlockingInfo("global")).toEqual([]);

    second.unmount();
  });
});
