import { ReactElement } from "react";
import { CloseIcon, MinimizeIcon, PauseIcon, PlayIcon, ShieldIcon, TrashIcon } from "../../icons";
import { MaximizeIcon } from "../../icons/Maximize";
import { COLORS } from "../../styles/tokens";
import { Badge, IconButton } from "../shared";
import styles from "./DevtoolsPanel.module.css";
import {
  getMinimizeButtonTitle,
  getPauseButtonClassName,
  getPauseButtonTitle,
} from "./DevtoolsPanelHeader.utils";

interface DevtoolsPanelHeaderProps {
  eventsCount: number;
  isPaused: boolean;
  isMinimized: boolean;
  onTogglePause: VoidFunction;
  onClearEvents: VoidFunction;
  onToggleMinimized: VoidFunction;
  onClose: VoidFunction;
}

function DevtoolsPanelHeader(props: DevtoolsPanelHeaderProps): ReactElement {
  const {
    eventsCount,
    isPaused,
    isMinimized,
    onTogglePause,
    onClearEvents,
    onToggleMinimized,
    onClose,
  } = props;

  return (
    <div className={styles.header}>
      <div className={styles.headerTitle}>
        <ShieldIcon size={16} color={COLORS.primary} />
        <span>Action Guard</span>
        <Badge className={styles.headerCount}>{eventsCount}</Badge>
      </div>
      <div className={styles.headerActions}>
        <IconButton
          className={getPauseButtonClassName(isPaused)}
          title={getPauseButtonTitle(isPaused)}
          onClick={onTogglePause}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </IconButton>
        <IconButton title="Clear events" onClick={onClearEvents}>
          <TrashIcon />
        </IconButton>
        <IconButton title={getMinimizeButtonTitle(isMinimized)} onClick={onToggleMinimized}>
          {isMinimized ? <MinimizeIcon /> : <MaximizeIcon />}
        </IconButton>
        <IconButton title="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default DevtoolsPanelHeader;
