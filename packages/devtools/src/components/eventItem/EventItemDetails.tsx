import { ReactElement } from "react";
import { formatDuration, formatScope } from "../../utils";
import styles from "./EventItem.module.css";
import type { DevtoolsEvent } from "../../types";

interface EventItemDetailsProps {
  event: DevtoolsEvent;
}

function EventItemDetails(props: EventItemDetailsProps): ReactElement {
  const { event } = props;
  const { config, duration, count } = event;
  const scope = config?.scope ?? event.scope;

  return (
    <div className={styles.eventDetails}>
      <span>scope: {formatScope(scope)}</span>
      {duration !== undefined && <span>duration: {formatDuration(duration)}</span>}
      {config?.priority !== undefined && <span>priority: {config.priority}</span>}
      {count !== undefined && <span>count: {count}</span>}
    </div>
  );
}

export default EventItemDetails;
