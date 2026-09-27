/**
 * Shared navigation utilities. Import router hooks from their adapter subpaths.
 */

export { useBeforeUnload } from "./core/useBeforeUnload";
export { useDialogState } from "./core/useDialogState";
export { resolveCondition, createBlockerId, isDefined, normalizeScope } from "./core/utils";
export type {
  BaseNavigationBlockerOptions,
  BeforeUnloadOptions,
  NavigationBlockerReturn,
} from "./core/types";
export type { DialogState, UseDialogStateReturn } from "./core/useDialogState";
