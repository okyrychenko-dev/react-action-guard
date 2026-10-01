import type { StoreApi } from "zustand";
import type { UIBlockingStore } from "./uiBlockingStore.types";

const storeSequences = new WeakMap<StoreApi<UIBlockingStore>, number>();

export function allocateBlockerId(store: StoreApi<UIBlockingStore>, prefix: string): string {
  let sequence = storeSequences.get(store) ?? 0;
  let blockerId: string;

  const { blockingSnapshot } = store.getState();

  do {
    sequence += 1;
    blockerId = `${prefix}-${String(sequence)}`;
  } while (blockingSnapshot.some(({ id }) => id === blockerId));

  storeSequences.set(store, sequence);

  return blockerId;
}
