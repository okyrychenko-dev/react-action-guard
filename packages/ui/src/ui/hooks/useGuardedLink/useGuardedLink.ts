import { type MouseEvent, useCallback } from "react";
import { resolveActionReason, resolveGuardedLinkState } from "../../utils";
import { useGuardedControl } from "../useGuardedControl";
import type {
  UseGuardedLinkParams,
  UseGuardedLinkReturn,
} from "./useGuardedLink.types";

export function useGuardedLink<
  TElement extends HTMLElement = HTMLAnchorElement,
>(params: UseGuardedLinkParams<TElement> = {}): UseGuardedLinkReturn<TElement> {
  const {
    disabled,
    onClick,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    removeFromTabOrder,
    scope,
    stopPropagationWhenBlocked,
  } = params;

  const resolveState = useCallback(
    (isBlocked: boolean) =>
      resolveGuardedLinkState({
        disabled,
        isBlocked,
        removeFromTabOrder,
      }),
    [disabled, removeFromTabOrder],
  );

  const control = useGuardedControl({
    reasonFallback,
    reasonId,
    reasonMode,
    resolveReason: resolveActionReason,
    resolveState,
    scope,
  });

  const handleClick = useCallback(
    (e: MouseEvent<TElement>) => {
      if (control.controlState.onClickShouldPrevent) {
        e.preventDefault();

        if (stopPropagationWhenBlocked === true) {
          e.stopPropagation();
        }

        return;
      }

      onClick?.(e);
    },
    [
      control.controlState.onClickShouldPrevent,
      onClick,
      stopPropagationWhenBlocked,
    ],
  );

  return {
    blocker: control.blocker,
    isBlocked: control.isBlocked,
    linkState: control.controlState,
    onClick: handleClick,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
