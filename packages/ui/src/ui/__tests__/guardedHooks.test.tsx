import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { type ReactNode, useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuardedScopeProvider } from "../context";
import {
  useGuardedAction,
  useGuardedButton,
  useGuardedField,
  useGuardedGroup,
  useGuardedLink,
  useTopBlocker,
} from "../hooks";

describe("guarded ui hooks", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should expose the top blocker for a scope", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("low", {
        scope: "checkout",
        reason: "Low priority",
        priority: 1,
      });
      uiBlockingStoreApi.getState().addBlocker("high", {
        scope: "checkout",
        reason: "High priority",
        priority: 10,
      });
    });

    const { result } = renderHook(() => useTopBlocker("checkout"));

    expect(result.current.status).toBe("blocked");
    expect(result.current.topBlocker?.id).toBe("high");
    expect(result.current.reason).toBe("High priority");
  });

  it("should apply a global blocker to a scoped query", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("global-save", {
        reason: "Global save",
      });
    });

    const { result } = renderHook(() => useTopBlocker("checkout"));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.topBlocker?.id).toBe("global-save");
  });

  it("should let guarded fields inherit scope from provider", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
        reason: "Saving profile",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () =>
        useGuardedField({
          blockedState: "readOnly",
          reasonId: "profile-blocked-reason",
          reasonMode: "helperText",
        }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.fieldState.readOnly).toBe(true);
    expect(result.current.ariaDescribedBy).toBe("profile-blocked-reason");
    expect(result.current.reasonContent).toBe("Saving profile");
  });

  it("should let guarded actions inherit scope from provider", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("submit", {
        scope: "profile",
        reason: "Submitting profile",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () => useGuardedAction({ blockedState: "loading" }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.actionState.disabled).toBe(true);
    expect(result.current.actionState.loading).toBe(true);
  });

  it("should let explicit scope override provider scope", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "billing",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () => useGuardedButton({ scope: "billing" }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.buttonState.disabled).toBe(true);
  });

  it("should expose guarded group state", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("group-save", {
        scope: "settings",
        reason: "Saving settings",
      });
    });

    const { result } = renderHook(() =>
      useGuardedGroup({
        scope: "settings",
        reasonMode: "description",
        reasonId: "settings-blocked-reason",
      }),
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.groupState.ariaBusy).toBe(true);
    expect(result.current.groupState.ariaDisabled).toBe(true);
    expect(result.current.ariaDescribedBy).toBe("settings-blocked-reason");
    expect(result.current.reasonContent).toBe("Saving settings");
  });

  it("should expose visible guarded button reason without aria description", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
        reason: "Saving profile",
      });
    });

    const { result } = renderHook(() =>
      useGuardedButton({
        scope: "profile",
        reasonMode: "visible",
        reasonId: "profile-blocked-reason",
      }),
    );

    expect(result.current.reasonContent).toBe("Saving profile");
    expect(result.current.ariaDescribedBy).toBeUndefined();
  });

  it("should prevent guarded link clicks while blocked", () => {
    const handleClick = vi.fn();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("navigation", {
        scope: "navigation",
      });
    });

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
      });

      return (
        <a
          href="/next"
          aria-disabled={linkState.ariaDisabled}
          onClick={onClick}
        >
          Next
        </a>
      );
    }

    render(<GuardedLinkExample />);

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should match blockers with multiple scopes", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("multi-scope", {
        scope: ["profile", "billing"],
        reason: "Saving account",
      });
    });

    const { result } = renderHook(() => useTopBlocker("billing"));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.topBlocker?.id).toBe("multi-scope");
  });

  it("should preserve user disabled state when blocked state is none", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
      });
    });

    const { result } = renderHook(() =>
      useGuardedButton({
        blockedState: "none",
        disabled: true,
        scope: "profile",
      }),
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.buttonState.disabled).toBe(true);
    expect(result.current.buttonState.loading).toBe(false);
    expect(result.current.buttonState.ariaDisabled).toBe(true);
    expect(result.current.buttonState.ariaBusy).toBeUndefined();
  });

  it("should map guarded button state with a custom resolver", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
      });
    });

    const { result } = renderHook(() =>
      useGuardedButton({
        blockedState: "loading",
        scope: "profile",
        getButtonState: (state) => ({
          busy: state.loading,
          disabled: state.disabled,
        }),
      }),
    );

    expect(result.current.buttonState).toEqual({
      busy: true,
      disabled: true,
    });
  });

  it("should map guarded field state with a custom resolver", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("email", {
        scope: "profile",
      });
    });

    const { result } = renderHook(() =>
      useGuardedField({
        blockedState: "readOnly",
        scope: "profile",
        getFieldState: (state) => ({
          disabled: state.disabled,
          locked: state.readOnly,
        }),
      }),
    );

    expect(result.current.fieldState).toEqual({
      disabled: false,
      locked: true,
    });
  });

  it("should stop guarded link click propagation while blocked", () => {
    const handleParentClick = vi.fn();
    const handleClick = vi.fn();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("navigation", {
        scope: "navigation",
      });
    });

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
        stopPropagationWhenBlocked: true,
      });

      return (
        <div onClick={handleParentClick}>
          <a
            href="/next"
            aria-disabled={linkState.ariaDisabled}
            onClick={onClick}
          >
            Next
          </a>
        </div>
      );
    }

    render(<GuardedLinkExample />);

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it("should render guarded button aria attributes in the DOM", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("submit", {
        scope: "profile",
      });
    });

    function GuardedButtonExample(): ReactNode {
      const { buttonState } = useGuardedButton({
        blockedState: "loading",
        scope: "profile",
      });

      return (
        <button
          type="button"
          aria-busy={buttonState.ariaBusy}
          aria-disabled={buttonState.ariaDisabled}
          disabled={buttonState.disabled}
        >
          Save
        </button>
      );
    }

    render(<GuardedButtonExample />);

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("should keep guarded action references stable across parent rerenders", () => {
    const handleActionStateChange = vi.fn();
    const handleBlockerChange = vi.fn();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
      });
    });

    function GuardedActionExample({ tick }: { tick: number }): ReactNode {
      const { actionState, blocker } = useGuardedAction({
        scope: "profile",
      });

      useEffect(() => {
        handleActionStateChange(actionState);
      }, [actionState]);

      useEffect(() => {
        handleBlockerChange(blocker);
      }, [blocker]);

      return <button data-tick={tick}>Save</button>;
    }

    const { rerender } = render(<GuardedActionExample tick={1} />);

    expect(handleActionStateChange).toHaveBeenCalledTimes(1);
    expect(handleBlockerChange).toHaveBeenCalledTimes(1);

    rerender(<GuardedActionExample tick={2} />);

    expect(handleActionStateChange).toHaveBeenCalledTimes(1);
    expect(handleBlockerChange).toHaveBeenCalledTimes(1);
  });

  it("should keep guarded button state stable with inline array scope across parent rerenders", () => {
    const handleButtonStateChange = vi.fn();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: ["profile", "billing"],
      });
    });

    function GuardedButtonExample({ tick }: { tick: number }): ReactNode {
      const { buttonState } = useGuardedButton({
        blockedState: "loading",
        scope: ["profile", "billing"],
      });

      useEffect(() => {
        handleButtonStateChange(buttonState);
      }, [buttonState]);

      return <button data-tick={tick}>Save</button>;
    }

    const { rerender } = render(<GuardedButtonExample tick={1} />);

    expect(handleButtonStateChange).toHaveBeenCalledTimes(1);

    rerender(<GuardedButtonExample tick={2} />);

    expect(handleButtonStateChange).toHaveBeenCalledTimes(1);
  });
});
