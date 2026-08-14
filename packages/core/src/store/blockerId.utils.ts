import type { StoreApi } from "zustand";
import type { UIBlockingStore } from "./uiBlockingStore.types";

const storeSequences = new WeakMap<StoreApi<UIBlockingStore>, number>();

export function allocateBlockerId(store: StoreApi<UIBlockingStore>, prefix: string): string {
  let sequence = storeSequences.get(store) ?? 0;
  let blockerId: string;

  do {
    sequence += 1;
    blockerId = `${prefix}-${String(sequence)}`;
  } while (store.getState().activeBlockers.has(blockerId));

  storeSequences.set(store, sequence);
  return blockerId;
}
