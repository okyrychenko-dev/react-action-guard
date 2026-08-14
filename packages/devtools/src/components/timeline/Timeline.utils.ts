import { DEFAULT_FILTER } from "../../store/devtoolsStore.constants";
import type { DevtoolsFilter } from "../../types";

export function isFilterActive(filter: DevtoolsFilter): boolean {
  if (filter.search.length > 0 || filter.scopes.length > 0) {
    return true;
  }

  if (filter.actions.length !== DEFAULT_FILTER.actions.length) {
    return true;
  }

  return !DEFAULT_FILTER.actions.every((action) => filter.actions.includes(action));
}
