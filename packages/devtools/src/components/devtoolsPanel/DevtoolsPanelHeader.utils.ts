import { clsx } from "clsx";
import styles from "./DevtoolsPanel.module.css";

export function getPauseButtonTitle(isPaused: boolean): string {
  return isPaused ? "Resume recording" : "Pause recording";
}

export function getMinimizeButtonTitle(isMinimized: boolean): string {
  return isMinimized ? "Maximize" : "Minimize";
}

export function getPauseButtonClassName(isPaused: boolean): string {
  return clsx(isPaused && styles.pauseButtonActive);
}
