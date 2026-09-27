import { useEffect } from "react";
import { resolveCondition } from "./utils";

/**
 * Default message shown when preventing browser unload
 */
export const DEFAULT_UNLOAD_MESSAGE = "Changes you made may not be saved.";

/**
 * Blocks browser tab close/refresh when condition is met.
 */
export function useBeforeUnload(
  when: boolean | (() => boolean),
  message = DEFAULT_UNLOAD_MESSAGE
): void {
  useEffect(() => {
    const shouldBlock = resolveCondition(when);

    if (!shouldBlock) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      // Prevent default to trigger the browser's confirmation dialog
      event.preventDefault();

      // Fallback for legacy browsers/WebViews that still rely on returnValue.
      if ("returnValue" in event) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        event.returnValue = message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when, message]);
}
