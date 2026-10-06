import type { RestrictionChip } from "./AdminPanel.types";

export function restrictionChip(isRestricted: boolean): RestrictionChip {
  if (isRestricted) {
    return { color: "warning", label: "Restricted" };
  }
  return { color: "success", label: "Online" };
}
