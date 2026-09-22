/**
 * Default values and constants for UI Blocking Store
 */

export { DEFAULT_SCOPE } from "./scope";

/**
 * Default reason when none is provided
 */
export const DEFAULT_REASON = "Unknown" as const;

/**
 * Default priority for blockers
 */
export const DEFAULT_PRIORITY = 0 as const;

/**
 * Default priority for async actions
 */
export const ASYNC_ACTION_PRIORITY = 20 as const;

/**
 * DevTools store name
 */
export const DEVTOOLS_NAME = "UIBlocking" as const;
