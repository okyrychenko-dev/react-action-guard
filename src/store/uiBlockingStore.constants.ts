/**
 * Default values and constants for UI Blocking Store
 */

/**
 * Default scope for blockers
 */
export const DEFAULT_SCOPE = "global" as const;

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
