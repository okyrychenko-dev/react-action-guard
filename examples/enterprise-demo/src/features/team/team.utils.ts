import type { PriorityColor } from "./team.types";

export function resolvePriorityColor(priority: number): PriorityColor {
  if (priority >= 85) {
    return "danger";
  }
  if (priority >= 70) {
    return "warning";
  }
  return "default";
}
