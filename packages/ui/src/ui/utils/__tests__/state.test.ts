import { describe, expect, it } from "vitest";
import {
  normalizeGuardedScope,
  resolveGuardedActionState,
  resolveGuardedFieldState,
  resolveGuardedGroupState,
  resolveGuardedLinkState,
} from "../state";

describe("state utils", () => {
  it("should normalize an undefined scope to global", () => {
    expect(normalizeGuardedScope()).toEqual(["global"]);
  });

  it("should normalize a string scope", () => {
    expect(normalizeGuardedScope("profile")).toEqual(["profile"]);
  });

  it("should remove duplicate scopes and sort them", () => {
    expect(normalizeGuardedScope(["profile", "billing", "profile"])).toEqual([
      "billing",
      "profile",
    ]);
  });

  it("should reuse normalized scope references for equivalent scope arrays", () => {
    const firstScope = normalizeGuardedScope(["profile", "billing"]);
    const secondScope = normalizeGuardedScope(["billing", "profile"]);

    expect(secondScope).toBe(firstScope);
  });

  it("should evict the oldest normalized scope when the cache is full", () => {
    const firstScope = normalizeGuardedScope("cache-scope-0");

    for (let index = 1; index <= 256; index += 1) {
      normalizeGuardedScope(["cache-scope", String(index)].join("-"));
    }

    expect(normalizeGuardedScope("cache-scope-0")).not.toBe(firstScope);
  });

  it("should resolve each blocked action state", () => {
    expect(resolveGuardedActionState({ blockedState: "disabled", isBlocked: true })).toEqual({
      disabled: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
    });
    expect(resolveGuardedActionState({ blockedState: "loading", isBlocked: true })).toEqual({
      disabled: true,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
    });
    expect(resolveGuardedActionState({ blockedState: "none", isBlocked: true })).toEqual({
      disabled: false,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
    });
  });

  it("should preserve action flags when the control is not blocked", () => {
    expect(
      resolveGuardedActionState({
        blockedState: "loading",
        isBlocked: false,
        disabled: true,
        loading: true,
      })
    ).toEqual({
      disabled: true,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
    });
  });

  it("should reject an unknown action blocked state", () => {
    expect(() => {
      void Reflect.apply(resolveGuardedActionState, undefined, [
        { blockedState: "unexpected", isBlocked: false },
      ]);
    }).toThrow("Unhandled GuardedActionBlockedState: unexpected");
  });

  it("should resolve each blocked field state", () => {
    expect(resolveGuardedFieldState({ blockedState: "disabled", isBlocked: true })).toEqual({
      disabled: true,
      readOnly: false,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
      ariaReadOnly: undefined,
    });
    expect(resolveGuardedFieldState({ blockedState: "readOnly", isBlocked: true })).toEqual({
      disabled: false,
      readOnly: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
      ariaReadOnly: true,
    });
    expect(resolveGuardedFieldState({ blockedState: "loading", isBlocked: true })).toEqual({
      disabled: true,
      readOnly: false,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
      ariaReadOnly: undefined,
    });
    expect(resolveGuardedFieldState({ blockedState: "none", isBlocked: false })).toEqual({
      disabled: false,
      readOnly: false,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
      ariaReadOnly: undefined,
    });
  });

  it("should preserve field flags when the control is not blocked", () => {
    expect(
      resolveGuardedFieldState({
        blockedState: "none",
        isBlocked: false,
        disabled: true,
        readOnly: true,
        loading: true,
      })
    ).toEqual({
      disabled: true,
      readOnly: true,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
      ariaReadOnly: true,
    });
  });

  it("should reject an unknown field blocked state", () => {
    expect(() => {
      void Reflect.apply(resolveGuardedFieldState, undefined, [
        { blockedState: "unexpected", isBlocked: false },
      ]);
    }).toThrow("Unhandled GuardedFieldBlockedState: unexpected");
  });

  it("should resolve link state for disabled and tab-order options", () => {
    expect(resolveGuardedLinkState({ isBlocked: false })).toEqual({
      ariaDisabled: undefined,
      tabIndex: undefined,
      onClickShouldPrevent: false,
    });
    expect(
      resolveGuardedLinkState({
        isBlocked: true,
        removeFromTabOrder: true,
      })
    ).toEqual({
      ariaDisabled: true,
      tabIndex: -1,
      onClickShouldPrevent: true,
    });
    expect(
      resolveGuardedLinkState({
        disabled: true,
        isBlocked: false,
        removeFromTabOrder: false,
      })
    ).toEqual({
      ariaDisabled: true,
      tabIndex: undefined,
      onClickShouldPrevent: true,
    });
  });

  it("should resolve group accessibility state from its blocked status", () => {
    expect(resolveGuardedGroupState(true)).toEqual({
      ariaBusy: true,
      ariaDisabled: true,
    });
    expect(resolveGuardedGroupState(false)).toEqual({
      ariaBusy: undefined,
      ariaDisabled: undefined,
    });
  });
});
