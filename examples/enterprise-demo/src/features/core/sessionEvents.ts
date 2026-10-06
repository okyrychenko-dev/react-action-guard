import type { UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { StoreApi } from "zustand";
import type { ActionRejectionReason } from "./sessionEvents.types";

type OrderPlacedListener = (orderId: string) => void;

const sessionListeners = new WeakMap<StoreApi<UIBlockingStore>, Set<OrderPlacedListener>>();
const rejectionListeners = new WeakMap<
  StoreApi<UIBlockingStore>,
  Set<(reason: ActionRejectionReason) => void>
>();

export function subscribeToActionRejected(
  store: StoreApi<UIBlockingStore>,
  listener: (reason: ActionRejectionReason) => void
): VoidFunction {
  let listeners = rejectionListeners.get(store);
  if (!listeners) {
    listeners = new Set();
    rejectionListeners.set(store, listeners);
  }
  const sessionRejections = listeners;
  sessionRejections.add(listener);
  return () => {
    sessionRejections.delete(listener);
  };
}

export function publishActionRejected(
  store: StoreApi<UIBlockingStore>,
  reason: ActionRejectionReason
): void {
  rejectionListeners.get(store)?.forEach((listener) => {
    listener(reason);
  });
}

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
