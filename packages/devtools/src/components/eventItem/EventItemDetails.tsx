import { isUndefined } from "@okyrychenko-dev/type-utils";
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
  const priority = config?.priority;

  return (
    <div className={styles.eventDetails}>
      <span>scope: {formatScope(scope)}</span>
      {!isUndefined(duration) && <span>duration: {formatDuration(duration)}</span>}
      {!isUndefined(priority) && <span>priority: {priority}</span>}
      {!isUndefined(count) && <span>count: {count}</span>}
    </div>
  );
}

export default EventItemDetails;
