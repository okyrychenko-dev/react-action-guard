import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { useGuardedControl } from "./useGuardedControl";
import type {
  GuardedActionState,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
} from "../../types";
import type { GuardedControlTestOptions } from "./useGuardedControl.test.types";
import type {
  ActionControlOptions,
  FieldControlOptions,
  LinkControlOptions,
  UseGuardedControlReturn,
} from "./useGuardedControl.types";

function renderControlState<TState>(
  useControl: () => UseGuardedControlReturn<TState>,
  isBlocked: boolean
): TState {
  const { addBlocker, clearAllBlockers } = uiBlockingStoreApi.getState();

  clearAllBlockers();
  if (isBlocked) {
    addBlocker("matrix");
  }

  const { result, unmount } = renderHook(useControl);
  const { controlState } = result.current;

  unmount();

  return controlState;
}
export function renderActionState({
  isBlocked,
  ...options
}: GuardedControlTestOptions<ActionControlOptions>): GuardedActionState {
  return renderControlState(() => useGuardedControl({ kind: "action", ...options }), isBlocked);
}
export function renderFieldState({
  isBlocked,
  ...options
}: GuardedControlTestOptions<FieldControlOptions>): GuardedFieldState {
  return renderControlState(() => useGuardedControl({ kind: "field", ...options }), isBlocked);
}
export function renderLinkState({
  isBlocked,
  ...options
}: GuardedControlTestOptions<LinkControlOptions>): GuardedLinkState {
  return renderControlState(() => useGuardedControl({ kind: "link", ...options }), isBlocked);
}
export function renderGroupState(isBlocked: boolean): GuardedGroupState {
  return renderControlState(() => useGuardedControl({ kind: "group" }), isBlocked);
}
