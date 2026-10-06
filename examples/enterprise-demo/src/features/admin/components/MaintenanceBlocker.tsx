import { useScheduledBlocker } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";

interface MaintenanceBlockerProps {
  onEnd: VoidFunction;
}

export function MaintenanceBlocker(props: MaintenanceBlockerProps): null {
  const { onEnd } = props;

  const [scheduleStart] = useState(() => Date.now() + 250);

  useScheduledBlocker("scheduled-maintenance", {
    scope: "global",
    reason: "Scheduled billing maintenance is in progress",
    priority: 98,
    schedule: {
      start: scheduleStart,
      duration: 1000,
    },
    onScheduleEnd: onEnd,
  });

  return null;
}
