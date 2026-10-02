import type { ConfirmationOwner } from "./confirmationOwner.types";

/** Owns the right to settle only the latest navigation attempt, once. */
export function createConfirmationOwner(): ConfirmationOwner {
  let currentAttempt = 0;

  function invalidate(): void {
    currentAttempt += 1;
  }

  function begin(): () => boolean {
    const attempt = ++currentAttempt;

    function settle(): boolean {
      if (attempt !== currentAttempt) {
        return false;
      }
      invalidate();

      return true;
    }

    return settle;
  }

  return { begin, invalidate };
}
