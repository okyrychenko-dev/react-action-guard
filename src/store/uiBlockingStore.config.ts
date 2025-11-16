import type { DevtoolsOptions } from "zustand/middleware";
import { DEVTOOLS_NAME } from "./uiBlockingStore.constants";

/**
 * DevTools configuration for UI Blocking Store
 *
 * Enables Redux DevTools integration only in development mode
 * for better debugging experience without production overhead.
 */
export const devtoolsConfig: DevtoolsOptions = {
  name: DEVTOOLS_NAME,
  enabled: process.env.NODE_ENV !== "production",
};
