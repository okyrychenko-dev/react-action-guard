import { ReactElement } from "react";
import ActiveBlockerItem from "./ActiveBlockerItem";
import { isBlockerStuck } from "./ActiveBlockers.utils";
import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsInspection } from "../actionGuardDevtools";

interface ActiveBlockersListProps {
  blockers: Array<[string, BlockerInfo]>;
  now: number;
  stuckThresholdMs: number;
  inspection?: DevtoolsInspection;
}

function ActiveBlockersList(props: ActiveBlockersListProps): ReactElement {
  const { blockers, now, stuckThresholdMs, inspection } = props;

  return (
    <div>
      {blockers.map(([id, blocker]) => (
        <ActiveBlockerItem
          key={id}
          id={id}
          blocker={blocker}
          now={now}
          actions={inspection?.actions}
          isStuck={isBlockerStuck(blocker, now, stuckThresholdMs)}
        />
      ))}
    </div>
  );
}

export default ActiveBlockersList;
