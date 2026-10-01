import { ReactElement } from "react";
import { Content } from "../shared";
import ActiveBlockerItem from "./ActiveBlockerItem";
import { isBlockerStuck } from "./ActiveBlockers.utils";
import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";

interface ActiveBlockersListProps {
  blockers: Array<[string, BlockerInfo]>;
  now: number;
  stuckThresholdMs: number;
}

function ActiveBlockersList(props: ActiveBlockersListProps): ReactElement {
  const { blockers, now, stuckThresholdMs } = props;

  return (
    <Content>
      {blockers.map(([id, blocker]) => (
        <ActiveBlockerItem
          key={id}
          id={id}
          blocker={blocker}
          isStuck={isBlockerStuck(blocker, now, stuckThresholdMs)}
        />
      ))}
    </Content>
  );
}

export default ActiveBlockersList;
