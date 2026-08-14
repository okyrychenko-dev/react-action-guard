import { ReactElement } from "react";
import { formatTime } from "../../utils";
import { EventBadge } from "../shared";
import styles from "./EventItem.module.css";
import type { DevtoolsEvent } from "../../types";

interface EventItemHeaderProps {
  event: DevtoolsEvent;
}

function EventItemHeader(props: EventItemHeaderProps): ReactElement {
  const { event } = props;
  const { action, blockerId, timestamp } = event;

  return (
    <div className={styles.eventHeader}>
      <EventBadge action={action}>{action}</EventBadge>
      <span className={styles.eventBlockerId}>{blockerId}</span>
      <span className={styles.eventTime}>{formatTime(timestamp)}</span>
    </div>
  );
}

export default EventItemHeader;
