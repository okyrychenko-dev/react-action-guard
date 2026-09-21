import {
  useActionBlocker,
  useConditionalBlocker,
  useScheduledBlocker,
} from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";

interface InitialPassiveEffectBlockersProps {
  isActionBlockerActive: boolean;
}

function InitialPassiveEffectBlockers(
  props: InitialPassiveEffectBlockersProps
): ReactElement | null {
  const { isActionBlockerActive } = props;

  useActionBlocker(
    "initial-action-blocker",
    { reason: "Initial action blocker", scope: "provider-test" },
    isActionBlockerActive
  );
  useConditionalBlocker("initial-conditional-blocker", {
    checkInterval: 60_000,
    condition: () => true,
    reason: "Initial conditional blocker",
    scope: "provider-test",
  });
  useScheduledBlocker("initial-scheduled-blocker", {
    reason: "Initial scheduled blocker",
    schedule: { duration: 10_000, start: 0 },
    scope: "provider-test",
  });

  return null;
}

export default InitialPassiveEffectBlockers;
