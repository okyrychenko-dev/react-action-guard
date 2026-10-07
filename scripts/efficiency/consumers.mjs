import { createElement } from "react";
import {
  useBlockingInfo,
  useIsBlocked,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";

export function Capture({ capture }) {
  capture(useUIBlockingContext());
  return null;
}

export function BooleanConsumer({ counts }) {
  const blocked = useIsBlocked("checkout");
  counts.boolean++;
  return createElement("output", { "data-boolean": String(blocked) });
}

export function InfoConsumer({ counts }) {
  const blockers = useBlockingInfo("checkout");
  counts.info++;
  return createElement("output", {
    "data-info": blockers.length,
    "data-reason": blockers[0]?.reason ?? "",
  });
}

export function ButtonConsumer({ counts }) {
  const { isBlocked, blocker } = useGuardedButton({ scope: "checkout" });
  counts.button++;
  return createElement("button", { disabled: isBlocked, "data-reason": blocker.reason ?? "" });
}
