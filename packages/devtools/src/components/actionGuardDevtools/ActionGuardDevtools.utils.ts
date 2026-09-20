import { isInstanceOf } from "@okyrychenko-dev/type-utils";
import { DevtoolsKeyboardResult } from "./ActionGuardDevtools.types";
import type { Nullable } from "@okyrychenko-dev/type-utils";

function isTypingTarget(target: Nullable<EventTarget>): boolean {
  return (
    isInstanceOf(target, HTMLInputElement) ||
    isInstanceOf(target, HTMLTextAreaElement) ||
    isInstanceOf(target, HTMLSelectElement) ||
    (isInstanceOf(target, HTMLElement) && target.isContentEditable)
  );
}

export function getDevtoolsKeyboardAction(
  event: KeyboardEvent,
  isOpen: boolean
): Nullable<DevtoolsKeyboardResult> {
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
