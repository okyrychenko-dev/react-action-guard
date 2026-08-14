import { clsx } from "clsx";
import positionStyles from "../../styles/position.module.css";
import { getPositionClass } from "../../styles/position.utils";
import styles from "./DevtoolsPanel.module.css";
import type { DevtoolsPosition } from "../../types";

export function getPanelClassName(position: DevtoolsPosition, isMinimized: boolean): string {
  return clsx(
    styles.panel,
    positionStyles.positionBase,
    getPositionClass(position),
    positionStyles.overlayLayer,
    isMinimized ? styles.panelMinimized : styles.panelExpanded
  );
}
