import type { Optional } from "@okyrychenko-dev/type-utils";
import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { BlockingLifecycle } from "./blockingLifecycle/blockingLifecycle.types";
import type { UIBlockingStore } from "./uiBlockingStore.types";

export type ActiveBlockers = UIBlockingStore["activeBlockers"];
export type OptionalActiveBlockers = Optional<ActiveBlockers>;

export type StoreMutatorEntry = [StoreMutatorIdentifier, unknown];
export type StoreMutatorStack = Array<StoreMutatorEntry>;
export type DevtoolsStoreMutators = [["zustand/devtools", never]];

export type BlockingStateCreator<TMutators extends StoreMutatorStack> = StateCreator<
  UIBlockingStore,
  [],
  TMutators,
  UIBlockingStore
>;

export type LifecycleActionsCreator = BlockingStateCreator<[]>;
export type LifecycleEnhancedCreator<TMutators extends StoreMutatorStack> = (
  lifecycle: BlockingLifecycle
) => BlockingStateCreator<TMutators>;

export type StoreStateUpdater<TState> = (state: UIBlockingStore) => TState;
export type StoreStateChange = UIBlockingStore | Partial<UIBlockingStore>;
export type MergeStoreUpdate = StoreStateChange | StoreStateUpdater<StoreStateChange>;
export type ReplaceStoreUpdate = UIBlockingStore | StoreStateUpdater<UIBlockingStore>;

export type MergeStoreUpdateArgs = [update: MergeStoreUpdate, replace?: false];
export type ReplaceStoreUpdateArgs = [update: ReplaceStoreUpdate, replace: true];
export type StoreUpdateArgs = MergeStoreUpdateArgs | ReplaceStoreUpdateArgs;
