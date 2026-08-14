import clsx from "clsx";
import { ReactElement, ReactNode } from "react";

interface StatusDisplayProps {
  isBlocked: boolean;
  blockedMessage: ReactNode;
  readyMessage: string;
}

function StatusDisplay(props: StatusDisplayProps): ReactElement {
  const { isBlocked, blockedMessage, readyMessage } = props;

  return (
    <div className={clsx("status-display", isBlocked ? "status-blocked" : "status-ready")}>
      {isBlocked ? blockedMessage : readyMessage}
    </div>
  );
}

export default StatusDisplay;
