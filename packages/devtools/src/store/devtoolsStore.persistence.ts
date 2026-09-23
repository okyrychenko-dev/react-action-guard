import { assertDefined, isNullish, isPromise, isUndefined } from "@okyrychenko-dev/type-utils";
import { createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_TAB,
  DEVTOOLS_STORAGE_VERSION,
  createDefaultFilter,
} from "./devtoolsStore.constants";
import type { PersistStorage, StateStorage, StorageValue } from "zustand/middleware";
import type { DevtoolsFilter, DevtoolsStore } from "../types";

/**
 * Subset of Devtools state persisted across reloads.
 *
 * Only UI preferences are stored. Recorded events and transient viewing state belong to an
 * observation session, while `isOpen` and `maxEvents` are reapplied from component props.
 */
export type PersistedDevtoolsState = Pick<DevtoolsStore, "isMinimized" | "activeTab" | "filter">;

type PersistedStorageValue = StorageValue<PersistedDevtoolsState>;
type PersistedStorageResult = PersistedStorageValue | null | Promise<PersistedStorageValue | null>;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function createDefaultPreferences(): PersistedDevtoolsState {
  return {
    isMinimized: false,
    activeTab: DEFAULT_TAB,
    filter: createDefaultFilter(),
  };
}

function isPersistedStoragePromise(
  value: PersistedStorageResult
): value is Promise<PersistedStorageValue | null> {
  return isPromise(value);
}

function getPersistedPreferences(value: PersistedStorageValue | null): PersistedDevtoolsState {
  if (isNullish(value) || value.version !== DEVTOOLS_STORAGE_VERSION) {
    return createDefaultPreferences();
  }

  return value.state;
}

function areArraysEqual<T>(first: ReadonlyArray<T>, second: ReadonlyArray<T>): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function areFiltersEqual(first: DevtoolsFilter, second: DevtoolsFilter): boolean {
  return (
    first.search === second.search &&
    areArraysEqual(first.actions, second.actions) &&
    areArraysEqual(first.scopes, second.scopes)
  );
}

function mergeChangedFilter(
  previous: DevtoolsFilter,
  next: DevtoolsFilter,
  persisted: DevtoolsFilter
): DevtoolsFilter {
  return {
    actions: areArraysEqual(previous.actions, next.actions) ? persisted.actions : next.actions,
    scopes: areArraysEqual(previous.scopes, next.scopes) ? persisted.scopes : next.scopes,
    search: previous.search === next.search ? persisted.search : next.search,
  };
}

function arePreferencesEqual(
  first: PersistedDevtoolsState,
  second: PersistedDevtoolsState
): boolean {
  return (
    first.isMinimized === second.isMinimized &&
    first.activeTab === second.activeTab &&
    areFiltersEqual(first.filter, second.filter)
  );
}

function mergeChangedPreferences(
  previous: PersistedDevtoolsState,
  next: PersistedDevtoolsState,
  persisted: PersistedDevtoolsState
): PersistedDevtoolsState {
  return {
    isMinimized:
      previous.isMinimized === next.isMinimized ? persisted.isMinimized : next.isMinimized,
    activeTab: previous.activeTab === next.activeTab ? persisted.activeTab : next.activeTab,
    filter: mergeChangedFilter(previous.filter, next.filter, persisted.filter),
  };
}

function getBrowserStorage(): StateStorage {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return window.localStorage;
}

function createJsonStorage(getStorage: () => StateStorage): PersistStorage<PersistedDevtoolsState> {
  const storage = createJSONStorage<PersistedDevtoolsState>(getStorage);

  if (isUndefined(storage)) {
    const fallbackStorage = createJSONStorage<PersistedDevtoolsState>(() => noopStorage);

    assertDefined(fallbackStorage, "No-op Devtools preference storage should be available");

    return fallbackStorage;
  }

  return storage;
}

/**
 * Creates storage that persists only the preference fields changed by this store binding.
 *
 * Observation sessions keep independent runtime state but share one preference key. Reading the
 * latest value before each write prevents a stale session from replacing preferences changed by
 * another session when Zustand persists an unrelated runtime update.
 */
export function createDevtoolsPreferenceStorage(
  getStorage: () => StateStorage = getBrowserStorage
): PersistStorage<PersistedDevtoolsState> {
  const storage = createJsonStorage(getStorage);
  let previousPreferences = createDefaultPreferences();

  const rememberPreferences = (
    value: PersistedStorageValue | null
  ): PersistedStorageValue | null => {
    previousPreferences = getPersistedPreferences(value);

    return value;
  };

  const persistChangedPreferences = (
    name: string,
    value: PersistedStorageValue,
    latestValue: PersistedStorageValue | null
  ): unknown => {
    const latestPreferences = getPersistedPreferences(latestValue);
    const mergedPreferences = mergeChangedPreferences(
      previousPreferences,
      value.state,
      latestPreferences
    );

    previousPreferences = value.state;

    const hasCurrentPersistedValue =
      !isNullish(latestValue) && latestValue.version === DEVTOOLS_STORAGE_VERSION;

    if (hasCurrentPersistedValue && arePreferencesEqual(mergedPreferences, latestPreferences)) {
      return undefined;
    }

    return storage.setItem(name, {
      state: mergedPreferences,
      version: DEVTOOLS_STORAGE_VERSION,
    });
  };

  return {
    getItem: (name) => {
      const value = storage.getItem(name);

      if (isPersistedStoragePromise(value)) {
        return value.then(rememberPreferences);
      }

      return rememberPreferences(value);
    },
    setItem: (name, value) => {
      const latestValue = storage.getItem(name);

      if (isPersistedStoragePromise(latestValue)) {
        return latestValue.then((resolvedValue) =>
          persistChangedPreferences(name, value, resolvedValue)
        );
      }

      return persistChangedPreferences(name, value, latestValue);
    },
    removeItem: (name) => {
      previousPreferences = createDefaultPreferences();

      return storage.removeItem(name);
    },
  };
}
