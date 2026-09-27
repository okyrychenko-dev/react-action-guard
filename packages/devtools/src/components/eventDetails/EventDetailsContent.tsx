import { isUndefined } from "@okyrychenko-dev/type-utils";
import { ReactElement } from "react";
import { formatDuration, formatFullTimestamp, formatRelativeTime, formatScope } from "../../utils";
import styles from "./EventDetails.module.css";
import type { DevtoolsEvent } from "../../types";

interface EventDetailsContentProps {
  event: DevtoolsEvent;
}

function EventDetailsContent(props: EventDetailsContentProps): ReactElement {
  const { event } = props;

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <div className={styles.label}>Blocker ID</div>
        <div className={styles.value}>{event.blockerId}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Timestamp</div>
        <div className={styles.value}>
          {formatFullTimestamp(event.timestamp)}
          <span className={styles.mutedInline}>({formatRelativeTime(event.timestamp)})</span>
        </div>
      </div>

      {!isUndefined(event.duration) && (
        <div className={styles.section}>
          <div className={styles.label}>Duration</div>
          <div className={styles.value}>{formatDuration(event.duration)}</div>
        </div>
      )}

      {event.config && (
        <div className={styles.section}>
          <div className={styles.label}>Config</div>
          <div className={styles.config}>
            {!isUndefined(event.config.scope) && (
              <div>
                <span className={styles.mutedLabel}>scope: </span>
                {formatScope(event.config.scope)}
              </div>
            )}
            {!isUndefined(event.config.reason) && (
              <div>
                <span className={styles.mutedLabel}>reason: </span>
                {event.config.reason}
              </div>
            )}
            {!isUndefined(event.config.priority) && (
              <div>
                <span className={styles.mutedLabel}>priority: </span>
                {event.config.priority}
              </div>
            )}
          </div>
        </div>
      )}

      {!event.config?.scope && !isUndefined(event.scope) && (
        <div className={styles.section}>
          <div className={styles.label}>Scope</div>
          <div className={styles.value}>{formatScope(event.scope)}</div>
        </div>
      )}

      {!isUndefined(event.count) && (
        <div className={styles.section}>
          <div className={styles.label}>Affected Count</div>
          <div className={styles.value}>{event.count}</div>
        </div>
      )}

      {event.prevState && (
        <div className={styles.section}>
          <div className={styles.label}>Previous State</div>
          <div className={styles.config}>
            {!isUndefined(event.prevState.scope) && (
              <div>
                <span className={styles.mutedLabel}>scope: </span>
                {formatScope(event.prevState.scope)}
              </div>
            )}
            {!isUndefined(event.prevState.reason) && (
              <div>
                <span className={styles.mutedLabel}>reason: </span>
                {event.prevState.reason}
              </div>
            )}
            {!isUndefined(event.prevState.priority) && (
              <div>
                <span className={styles.mutedLabel}>priority: </span>
                {event.prevState.priority}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetailsContent;
