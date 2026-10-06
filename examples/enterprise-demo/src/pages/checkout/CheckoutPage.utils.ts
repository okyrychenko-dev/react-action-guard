import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { CheckoutNavigationCopy } from "./CheckoutPage.types";

export function getCheckoutNavigationCopy(
  blockers: ReadonlyArray<BlockerInfo>
): CheckoutNavigationCopy {
  const hasUnsavedEdits = blockers.some(({ id }) => id === "unsaved-checkout-changes");
  const onlyUnsavedEdits =
    hasUnsavedEdits && blockers.every(({ id }) => id === "unsaved-checkout-changes");

  if (onlyUnsavedEdits) {
    return {
      title: "Unsaved changes detected",
      message: "Checkout has unsaved edits. Leave and discard them?",
      cancelLabel: "Stay and save",
    };
  }
  const reasons = [...new Set(blockers.map(({ reason }) => reason))].join(" ");
  let message = reasons || "Navigation is currently guarded.";

  if (hasUnsavedEdits) {
    message += " Leaving will discard unsaved checkout edits.";
  }
  message += " Leave this page anyway?";

  return { title: "Navigation is guarded", message, cancelLabel: "Stay here" };
}
