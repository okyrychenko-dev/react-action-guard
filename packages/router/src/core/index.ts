/**
 * Core utilities for react-action-guard-router
 *
 * This module provides shared functionality used across all router adapters.
 */

export { useBeforeUnload, DEFAULT_UNLOAD_MESSAGE } from "./useBeforeUnload";
export { useShouldBlock } from "./useShouldBlock";
export { useDialogState } from "./useDialogState";
export {
  resolveCondition,
  createBlockerId,
  isDefined,
  normalizeScope,
  isThenable,
  resolveConfirmResult,
} from "./utils";
export { ROUTE_ERRORS } from "./constants";
export {
  handleConfirmation,
  type ConfirmationResult,
  type ConfirmationCallbacks,
} from "./utils/handleConfirmation";
export type {
  BaseNavigationBlockerOptions,
  BeforeUnloadOptions,
  NavigationBlockerReturn,
} from "./types";
export type { DialogState, UseDialogStateReturn } from "./useDialogState";
