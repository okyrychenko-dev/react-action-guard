import { type MouseEvent, useCallback } from "react";
import { useGuardedControl } from "../useGuardedControl";
import type { UseGuardedLinkParams, UseGuardedLinkReturn } from "./useGuardedLink.types";

export function useGuardedLink<TElement extends HTMLElement = HTMLAnchorElement>(
  params: UseGuardedLinkParams<TElement> = {}
): UseGuardedLinkReturn<TElement> {
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

  const control = useGuardedControl({
    kind: "link",
    disabled,
    removeFromTabOrder,
    reasonFallback,
    reasonId,
    reasonMode,
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
    [control.controlState.onClickShouldPrevent, onClick, stopPropagationWhenBlocked]
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
