import { describe, expect, it } from "vitest";
import {
  normalizeGuardedScope,
  resolveGuardedActionState,
  resolveGuardedFieldState,
  resolveGuardedLinkState,
} from "../utils";

describe("ui state utils", () => {
  it("should default an undefined scope to global", () => {
    expect(normalizeGuardedScope()).toEqual(["global"]);
  });

  it("should resolve blocked action state as disabled", () => {
    expect(
      resolveGuardedActionState({
        blockedState: "disabled",
        isBlocked: true,
      }),
    ).toEqual({
      disabled: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
    });
  });

  it("should resolve blocked action state as loading", () => {
    expect(
      resolveGuardedActionState({
        blockedState: "loading",
        isBlocked: true,
      }),
    ).toEqual({
      disabled: true,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
    });
  });

  it("should resolve blocked field state as read only", () => {
    expect(
      resolveGuardedFieldState({
        blockedState: "readOnly",
        isBlocked: true,
      }),
    ).toEqual({
      disabled: false,
      readOnly: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
      ariaReadOnly: true,
    });
  });

  it("should preserve existing disabled field state when blocked state is none", () => {
    expect(
      resolveGuardedFieldState({
        blockedState: "none",
        disabled: true,
        isBlocked: true,
      }).disabled,
    ).toBe(true);
  });

  it("should prevent guarded links when blocked", () => {
    expect(
      resolveGuardedLinkState({
        isBlocked: true,
        removeFromTabOrder: true,
      }),
    ).toEqual({
      ariaDisabled: true,
      tabIndex: -1,
      onClickShouldPrevent: true,
    });
  });
});
