// Main component
export { ActionGuardDevtools, ActionGuardDevtoolsProvider } from "./components";
export type { ActionGuardDevtoolsProviderProps } from "./components";

// Store (for advanced usage)
export {
  useDevtoolsStore,
  selectFilteredEvents,
  selectUniqueScopes,
  selectEventStats,
} from "./store";

// Middleware (for manual registration)
export {
  createDevtoolsMiddleware,
  DEVTOOLS_MIDDLEWARE_NAME,
} from "./middleware/devtoolsMiddleware";

// Types
export type {
  DevtoolsEvent,
  DevtoolsEventStats,
  DevtoolsFilter,
  DevtoolsPosition,
  DevtoolsState,
  DevtoolsActions,
  DevtoolsStore,
} from "./types/devtools.types";
