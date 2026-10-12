import { useEffect, useEffectEvent } from "react";
import { AUTOSAVE_DEBOUNCE_MS } from "./useCheckoutAutosave.constants";
import type { CheckoutAutosaveOptions } from "./useCheckoutAutosave.types";

export function useCheckoutAutosave({
  enabled,
  dirty,
  blocked,
  address,
  paymentReference,
  onSave,
}: CheckoutAutosaveOptions): void {
  const saveLatest = useEffectEvent(() => {
    onSave();
  });

  useEffect(() => {
    if (!enabled || !dirty || blocked) {
      return;
    }
    const timer = window.setTimeout(() => {
      saveLatest();
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, dirty, blocked, address, paymentReference]);
}
