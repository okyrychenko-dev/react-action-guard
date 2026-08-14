import type { DevtoolsFilter } from "../types/devtools.types";

export const DEFAULT_FILTER: DevtoolsFilter = {
  actions: ["add", "remove", "update", "timeout", "clear", "clear_scope"],
  scopes: [],
  search: "",
};

export const createDefaultFilter = (): DevtoolsFilter => ({
  actions: [...DEFAULT_FILTER.actions],
  scopes: [...DEFAULT_FILTER.scopes],
  search: DEFAULT_FILTER.search,
});

export const DEFAULT_MAX_EVENTS = 200;

export const DEFAULT_TAB = "timeline" as const;

/** localStorage key under which UI preferences are persisted. */
export const DEVTOOLS_STORAGE_KEY = "react-action-guard-devtools";

/** Bump when the persisted shape changes incompatibly. */
export const DEVTOOLS_STORAGE_VERSION = 1;
