import { ReactElement } from "react";
import { Badge } from "../shared";
import { getBadgeClassName, shouldShowBadge } from "./ToggleButtonBadge.utils";

interface ToggleButtonBadgeProps {
  count: number;
  isPaused: boolean;
}

function ToggleButtonBadge(props: ToggleButtonBadgeProps): ReactElement | null {
  const { count, isPaused } = props;

  if (!shouldShowBadge(count)) {
    return null;
  }

  return <Badge className={getBadgeClassName(isPaused)}>{count}</Badge>;
}

export default ToggleButtonBadge;
