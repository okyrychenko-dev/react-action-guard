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

      {event.duration !== undefined && (
        <div className={styles.section}>
          <div className={styles.label}>Duration</div>
          <div className={styles.value}>{formatDuration(event.duration)}</div>
        </div>
      )}

      {event.config && (
        <div className={styles.section}>
          <div className={styles.label}>Config</div>
          <div className={styles.config}>
            {event.config.scope !== undefined && (
              <div>
                <span className={styles.mutedLabel}>scope: </span>
                {formatScope(event.config.scope)}
              </div>
            )}
            {event.config.reason !== undefined && (
              <div>
                <span className={styles.mutedLabel}>reason: </span>
                {event.config.reason}
              </div>
            )}
            {event.config.priority !== undefined && (
              <div>
                <span className={styles.mutedLabel}>priority: </span>
                {event.config.priority}
              </div>
            )}
          </div>
        </div>
      )}

      {!event.config?.scope && event.scope !== undefined && (
        <div className={styles.section}>
          <div className={styles.label}>Scope</div>
          <div className={styles.value}>{formatScope(event.scope)}</div>
        </div>
      )}

      {event.count !== undefined && (
        <div className={styles.section}>
          <div className={styles.label}>Affected Count</div>
          <div className={styles.value}>{event.count}</div>
        </div>
      )}

      {event.prevState && (
        <div className={styles.section}>
          <div className={styles.label}>Previous State</div>
          <div className={styles.config}>
            {event.prevState.scope !== undefined && (
              <div>
                <span className={styles.mutedLabel}>scope: </span>
                {formatScope(event.prevState.scope)}
              </div>
            )}
            {event.prevState.reason !== undefined && (
              <div>
                <span className={styles.mutedLabel}>reason: </span>
                {event.prevState.reason}
              </div>
            )}
            {event.prevState.priority !== undefined && (
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
