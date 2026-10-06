import type { ScopeChipPropsReturn } from "./CheckoutStatus.types";

export function scopeChipProps(
  isBlocked: boolean,
  blockedLabel: string,
  openLabel: string
): ScopeChipPropsReturn {
  if (isBlocked) {
    return { color: "warning", label: blockedLabel };
  }
  return { color: "success", label: openLabel };
}
