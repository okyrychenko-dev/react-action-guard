import { ReactElement } from "react";
import styles from "./EventDetails.module.css";
import EventDetailsContent from "./EventDetailsContent";
import EventDetailsHeader from "./EventDetailsHeader";
import type { DevtoolsEvent } from "../../types";

interface EventDetailsProps {
  event: DevtoolsEvent;
  onClose: VoidFunction;
}

function EventDetails(props: EventDetailsProps): ReactElement {
  const { event, onClose } = props;

  return (
    <div className={styles.panel}>
      <EventDetailsHeader action={event.action} onClose={onClose} />
      <EventDetailsContent event={event} />
    </div>
  );
}

export default EventDetails;
