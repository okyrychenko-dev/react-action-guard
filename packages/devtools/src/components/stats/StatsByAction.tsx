import { ReactElement } from "react";
import { EventBadge } from "../shared";
import { ACTION_ORDER } from "./Stats.constants";
import StatsSection from "./StatsSection";
import type { DevtoolsEventStats } from "../../types";

interface StatsByActionProps {
  byAction: DevtoolsEventStats["byAction"];
}

function StatsByAction(props: StatsByActionProps): ReactElement {
  const { byAction } = props;

  const rows = ACTION_ORDER.map((action) => ({
    id: action,
    label: <EventBadge action={action}>{action}</EventBadge>,
    count: byAction[action],
  }));

  return <StatsSection title="Events by action" rows={rows} />;
}

export default StatsByAction;
