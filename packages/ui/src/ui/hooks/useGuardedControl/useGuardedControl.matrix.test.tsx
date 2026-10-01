import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { afterEach, describe, expect, it } from "vitest";
import {
  renderActionState,
  renderFieldState,
  renderGroupState,
  renderLinkState,
} from "./useGuardedControl.test.utils";
describe("guarded control state matrix", () => {
  afterEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });
  it("should resolve each blocked action state", () => {
    expect(renderActionState({ blockedState: "disabled", isBlocked: true })).toEqual({
      disabled: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
    });
    expect(renderActionState({ blockedState: "loading", isBlocked: true })).toEqual({
      disabled: true,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
    });
    expect(renderActionState({ blockedState: "none", isBlocked: true })).toEqual({
      disabled: false,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
    });
  });

  it("should preserve action flags when the control is not blocked", () => {
    expect(
      renderActionState({
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
      void Reflect.apply(renderActionState, undefined, [
        { blockedState: "unexpected", isBlocked: false },
      ]);
    }).toThrow("GuardedActionBlockedState Unexpected value in exhaustive check");
  });

  it("should resolve each blocked field state", () => {
    expect(renderFieldState({ blockedState: "disabled", isBlocked: true })).toEqual({
      disabled: true,
      readOnly: false,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: true,
      ariaReadOnly: undefined,
    });
    expect(renderFieldState({ blockedState: "readOnly", isBlocked: true })).toEqual({
      disabled: false,
      readOnly: true,
      loading: false,
      ariaBusy: undefined,
      ariaDisabled: undefined,
      ariaReadOnly: true,
    });
    expect(renderFieldState({ blockedState: "loading", isBlocked: true })).toEqual({
      disabled: true,
      readOnly: false,
      loading: true,
      ariaBusy: true,
      ariaDisabled: true,
      ariaReadOnly: undefined,
    });
    expect(renderFieldState({ blockedState: "none", isBlocked: false })).toEqual({
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
      renderFieldState({
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
      void Reflect.apply(renderFieldState, undefined, [
        { blockedState: "unexpected", isBlocked: false },
      ]);
    }).toThrow("GuardedFieldBlockedState Unexpected value in exhaustive check");
  });

  it("should resolve link state for disabled and tab-order options", () => {
    expect(renderLinkState({ isBlocked: false })).toEqual({
      ariaDisabled: undefined,
      tabIndex: undefined,
      onClickShouldPrevent: false,
    });
    expect(
      renderLinkState({
        isBlocked: true,
        removeFromTabOrder: true,
      })
    ).toEqual({
      ariaDisabled: true,
      tabIndex: -1,
      onClickShouldPrevent: true,
    });
    expect(
      renderLinkState({
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
    expect(renderGroupState(true)).toEqual({
      ariaBusy: true,
      ariaDisabled: true,
    });
    expect(renderGroupState(false)).toEqual({
      ariaBusy: undefined,
      ariaDisabled: undefined,
    });
  });
});
