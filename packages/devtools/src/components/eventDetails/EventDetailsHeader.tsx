import { ReactElement } from "react";
import { CloseIcon } from "../../icons";
import { EventBadge, IconButton } from "../shared";
import styles from "./EventDetails.module.css";

interface EventDetailsHeaderProps {
  action: string;
  onClose: VoidFunction;
}

function EventDetailsHeader(props: EventDetailsHeaderProps): ReactElement {
  const { action, onClose } = props;

  return (
    <div className={styles.header}>
      <EventBadge action={action}>{action}</EventBadge>
      <IconButton title="Close details" onClick={onClose}>
        <CloseIcon size={16} />
      </IconButton>
    </div>
  );
}

export default EventDetailsHeader;
