import type { ConfirmationOwner } from "./confirmationOwner.types";

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
