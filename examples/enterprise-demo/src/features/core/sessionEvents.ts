import type { UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { StoreApi } from "zustand";

type OrderPlacedListener = (orderId: string) => void;

const sessionListeners = new WeakMap<StoreApi<UIBlockingStore>, Set<OrderPlacedListener>>();

export function subscribeToOrderPlaced(
  store: StoreApi<UIBlockingStore>,
  listener: OrderPlacedListener
): VoidFunction {
  let orderPlacedListeners = sessionListeners.get(store);
  if (!orderPlacedListeners) {
    orderPlacedListeners = new Set<OrderPlacedListener>();
    sessionListeners.set(store, orderPlacedListeners);
  }
  const listeners = orderPlacedListeners;
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function publishOrderPlaced(store: StoreApi<UIBlockingStore>, orderId: string): void {
  sessionListeners.get(store)?.forEach((listener) => {
    listener(orderId);
  });
}
