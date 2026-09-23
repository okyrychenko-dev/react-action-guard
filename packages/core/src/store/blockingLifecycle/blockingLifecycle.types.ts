import type { Middleware, MiddlewareContext } from "../../middleware";
import type { BlockerConfig, BlockerInfo } from "../uiBlockingStore.types";

/** An immutable point-in-time blocker projection. */
export type BlockingLifecycleSnapshot = ReadonlyArray<Readonly<BlockerInfo>>;

/** Read snapshots and observe lifecycle changes without transition authority. */
export interface BlockingLifecycleObservation {
  getSnapshot: () => BlockingLifecycleSnapshot;
  subscribe: (listener: (snapshot: BlockingLifecycleSnapshot) => void) => VoidFunction;
  observe: (observer: Middleware) => VoidFunction;
}

export interface BlockingLifecycle extends BlockingLifecycleObservation {
  restore: (blockers: ReadonlyMap<string, BlockerConfig>) => void;
  add: (id: string, config?: BlockerConfig) => void;
  update: (id: string, config?: Partial<BlockerConfig>) => void;
  remove: (id: string) => void;
  clear: () => void;
  clearScope: (scope: string) => void;
  isBlocked: (scope?: string | ReadonlyArray<string>) => boolean;
  getBlockingInfo: (scope: string) => ReadonlyArray<BlockerInfo>;
}

export type BlockingEvent = MiddlewareContext;
