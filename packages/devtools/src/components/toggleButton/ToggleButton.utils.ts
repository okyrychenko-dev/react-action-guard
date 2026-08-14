import { clsx } from "clsx";
import positionStyles from "../../styles/position.module.css";
import { getPositionClass } from "../../styles/position.utils";
import styles from "./ToggleButton.module.css";
import type { DevtoolsPosition } from "../../types";

export function getToggleButtonClassName(position: DevtoolsPosition): string {
  return clsx(
    styles.toggleButton,
    positionStyles.positionBase,
    getPositionClass(position),
    positionStyles.overlayLayer
  );
}
