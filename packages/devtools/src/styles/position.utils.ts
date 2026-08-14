import positionStyles from "./position.module.css";
import type { DevtoolsPosition } from "../types";

export function getPositionClass(position: DevtoolsPosition): string {
  return position === "left" ? positionStyles.positionLeft : positionStyles.positionRight;
}
