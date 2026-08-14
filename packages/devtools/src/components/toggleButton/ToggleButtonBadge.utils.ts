import { clsx } from "clsx";
import styles from "./ToggleButton.module.css";

export function shouldShowBadge(count: number): boolean {
  return count > 0;
}

export function getBadgeClassName(isPaused: boolean): string {
  return clsx(styles.badgePosition, isPaused ? styles.badgePaused : styles.badgeActive);
}
