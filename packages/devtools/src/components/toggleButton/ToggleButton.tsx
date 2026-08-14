import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import { useStore } from "zustand";
import { ShieldIcon } from "../../icons";
import { useDevtoolsStore } from "../../store";
import { getToggleButtonClassName } from "./ToggleButton.utils";
import ToggleButtonBadge from "./ToggleButtonBadge";
import type { DevtoolsPosition } from "../../types";
import type { UIBlockingStoreApi } from "../actionGuardDevtools";

interface ToggleButtonProps {
  position: DevtoolsPosition;
  store?: UIBlockingStoreApi;
}

function ToggleButton(props: ToggleButtonProps): ReactElement | null {
  const { position, store } = props;

  const { isOpen, toggleOpen, isPaused } = useDevtoolsStore((state) => ({
    isOpen: state.isOpen,
    toggleOpen: state.toggleOpen,
    isPaused: state.isPaused,
  }));

  // Read active blockers count directly from the blocking store
  const targetStore = store ?? uiBlockingStoreApi;
  const activeBlockers = useStore(targetStore, (state) => state.activeBlockers);

  const activeCount = activeBlockers.size;
  if (isOpen) {
    return null;
  }

  return (
    <button
      className={getToggleButtonClassName(position)}
      title="Open Action Guard Devtools"
      onClick={toggleOpen}
    >
      <ShieldIcon size={22} />
      <ToggleButtonBadge count={activeCount} isPaused={isPaused} />
    </button>
  );
}

export default ToggleButton;
