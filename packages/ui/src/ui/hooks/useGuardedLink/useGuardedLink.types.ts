import type { MouseEventHandler } from "react";
import type {
  GuardedLinkState,
  GuardedReasonProps,
  GuardedScopeProps,
  UseTopBlockerReturn,
} from "../../types";

export interface UseGuardedLinkParams<
  TElement extends HTMLElement = HTMLAnchorElement,
>
  extends GuardedScopeProps, GuardedReasonProps {
  disabled?: boolean;
  removeFromTabOrder?: boolean;
  stopPropagationWhenBlocked?: boolean;
  onClick?: MouseEventHandler<TElement>;
}

export interface UseGuardedLinkReturn<
  TElement extends HTMLElement = HTMLAnchorElement,
> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  linkState: GuardedLinkState;
  onClick: MouseEventHandler<TElement>;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
