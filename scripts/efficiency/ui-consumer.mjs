import { createElement } from "react";
import { UIBlockingProvider, useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";

function Checkout() {
  useActionBlocker("saving", { scope: "checkout" });
  const { isBlocked, reasonContent } = useGuardedButton({ scope: "checkout" });
  return createElement("button", { disabled: isBlocked }, reasonContent ?? "Save");
}

export function App() {
  return createElement(UIBlockingProvider, null, createElement(Checkout));
}
