import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useGuardedControl } from "./useGuardedControl";
import { interpretControlState } from "./useGuardedControl.utils";
import type { GuardedFieldReasonMode, GuardedReasonMode } from "../../types";

describe("guarded control interpretation", () => {
  it("should reject an unknown control kind at runtime", () => {
    expect(() => {
      // @ts-expect-error JavaScript callers can supply an unsupported control kind.
      interpretControlState({ kind: "unexpected" }, false);
    }).toThrow();
  });

  afterEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should interpret action state and accessible reason through one interface", () => {
    const { addBlocker } = uiBlockingStoreApi.getState();

    addBlocker("save", { scope: "form", reason: "Saving" });

    const { result } = renderHook(() =>
      useGuardedControl({
        kind: "action",
        scope: "form",
        reasonMode: "description",
        reasonId: "save-reason",
      })
    );

    expect(result.current.controlState).toEqual({
      disabled: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
    });
    expect(result.current.reasonContent).toBe("Saving");
    expect(result.current.ariaDescribedBy).toBe("save-reason");
  });
  it.each<GuardedReasonMode>(["hidden", "visible", "description"])(
    "should resolve %s reasons for actions, groups and links",
    (reasonMode) => {
      const { addBlocker } = uiBlockingStoreApi.getState();

      addBlocker("save", { reason: "Saving" });

      const { result } = renderHook(() => ({
        action: useGuardedControl({ kind: "action", reasonMode, reasonId: "reason" }),
        group: useGuardedControl({ kind: "group", reasonMode, reasonId: "reason" }),
        link: useGuardedControl({ kind: "link", reasonMode, reasonId: "reason" }),
      }));

      for (const control of Object.values(result.current)) {
        expect(control.reasonContent).toBe(reasonMode === "hidden" ? null : "Saving");
        expect(control.ariaDescribedBy).toBe(reasonMode === "description" ? "reason" : undefined);
      }
    }
  );
  it.each<GuardedFieldReasonMode>(["hidden", "description", "helperText"])(
    "should resolve %s field reasons",
    (reasonMode) => {
      const { addBlocker } = uiBlockingStoreApi.getState();

      addBlocker("save", { reason: "Saving" });

      const { result } = renderHook(() =>
        useGuardedControl({ kind: "field", reasonMode, reasonId: "reason" })
      );

      expect(result.current.reasonContent).toBe(reasonMode === "hidden" ? null : "Saving");
      expect(result.current.ariaDescribedBy).toBe(reasonMode === "hidden" ? undefined : "reason");
    }
  );
  it.each<GuardedFieldReasonMode>(["description", "helperText"])(
    "should require a nonblank description id in %s mode only while blocked",
    (reasonMode) => {
      const idle = renderHook(() => useGuardedControl({ kind: "field", reasonMode }));

      expect(idle.result.current.reasonContent).toBeNull();
      idle.unmount();

      const { addBlocker } = uiBlockingStoreApi.getState();

      addBlocker("save");
      expect(() =>
        renderHook(() => useGuardedControl({ kind: "field", reasonMode, reasonId: " " }))
      ).toThrow("reasonId is required");
    }
  );

  it("should preserve empty reasons and ignore fallback content while idle", () => {
    const { addBlocker } = uiBlockingStoreApi.getState();
    const idle = renderHook(() =>
      useGuardedControl({ kind: "action", reasonMode: "visible", reasonFallback: "Fallback" })
    );

    expect(idle.result.current.reasonContent).toBeNull();
    idle.unmount();
    addBlocker("save", { reason: "" });
    expect(
      renderHook(() =>
        useGuardedControl({ kind: "action", reasonMode: "visible", reasonFallback: "Fallback" })
      ).result.current.reasonContent
    ).toBe("");
  });
});
