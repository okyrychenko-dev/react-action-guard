import { ReactElement } from "react";
import { EventItem } from "../eventItem";
import { Content, EmptyState } from "../shared";
import styles from "./Timeline.module.css";
import type { DevtoolsEvent } from "../../types";

interface TimelineContentProps {
  events: Array<DevtoolsEvent>;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

function TimelineContent(props: TimelineContentProps): ReactElement {
  const { events, selectedEventId, onSelectEvent } = props;

  return (
    <Content>
      {events.length === 0 && <EmptyState>No matching events</EmptyState>}
      {events.length > 0 && (
        <ul className={styles.eventList}>
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              selected={selectedEventId === event.id}
              onSelect={onSelectEvent}
            />
          ))}
        </ul>
      )}
    </Content>
  );
}

export default TimelineContent;
