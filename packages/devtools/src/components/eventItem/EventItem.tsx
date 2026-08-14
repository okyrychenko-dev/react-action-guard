import { clsx } from "clsx";
import { ReactElement, memo } from "react";
import styles from "./EventItem.module.css";
import EventItemDetails from "./EventItemDetails";
import EventItemHeader from "./EventItemHeader";
import type { DevtoolsEvent } from "../../types";

interface EventItemProps {
  event: DevtoolsEvent;
  selected: boolean;
  onSelect: (eventId: string | null) => void;
}

function EventItem(props: EventItemProps): ReactElement {
  const { event, selected, onSelect } = props;

  const handleSelect = (): void => {
    onSelect(selected ? null : event.id);
  };

  return (
    <li className={clsx(styles.eventItem, selected && styles.selected)} onClick={handleSelect}>
      <EventItemHeader event={event} />
      <EventItemDetails event={event} />
    </li>
  );
}

export default memo(EventItem);
