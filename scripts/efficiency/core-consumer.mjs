import { createElement } from "react";
import {
  createBlockingLifecycle,
  UIBlockingProvider,
  useActionBlocker,
  useIsBlocked,
} from "@okyrychenko-dev/react-action-guard";

function Checkout() {
  useActionBlocker("saving", { scope: "checkout" });
  return createElement("button", { disabled: useIsBlocked("checkout") }, "Save");
}

export function App() {
  return createElement(UIBlockingProvider, null, createElement(Checkout));
}

export function exercise() {
  const lifecycle = createBlockingLifecycle();
  lifecycle.add("saving", { scope: "checkout", reason: "Saving" });
  const blocked = lifecycle.isBlocked("checkout");
  lifecycle.remove("saving");
  return blocked && !lifecycle.isBlocked("checkout");
}
