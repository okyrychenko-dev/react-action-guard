import { type Optional, isUndefined } from "@okyrychenko-dev/type-utils";

/** Reject invalid delays before a registration or its existing timer is changed. */
export function validateTimeout(timeout: Optional<number>): void {
  if (isUndefined(timeout)) {
    return;
  }

  if (
    !Number.isFinite(timeout) ||
    (timeout > 0 && Date.now() + timeout > Number.MAX_SAFE_INTEGER)
  ) {
    throw new RangeError("Blocker timeout must be finite with a safely representable deadline");
  }
}
