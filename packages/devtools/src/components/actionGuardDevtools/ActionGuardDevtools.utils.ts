import { DevtoolsKeyboardResult } from "./ActionGuardDevtools.types";

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function getDevtoolsKeyboardAction(
  event: KeyboardEvent,
  isOpen: boolean
): DevtoolsKeyboardResult | null {
  if (!isOpen) {
    return null;
  }

  if (isTypingTarget(event.target)) {
    return null;
  }

  switch (event.key) {
    case "Escape":
      return { action: "close", preventDefault: false };
    case " ":
      return { action: "togglePause", preventDefault: true };
    case "c":
    case "C":
      if (!event.metaKey && !event.ctrlKey) {
        return { action: "clearEvents", preventDefault: false };
      }
      return null;
    default:
      return null;
  }
}
