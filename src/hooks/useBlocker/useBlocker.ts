import { useEffect } from "react";
import { type BlockerConfig, useUIBlockingStore } from "../../store";

/**
 * Hook to automatically add and remove a blocker based on component lifecycle
 *
 * Automatically adds a blocker when the component mounts (or when activated)
 * and removes it when the component unmounts (or when deactivated).
 *
 * @param blockerId - Unique identifier for the blocker
 * @param config - Blocker configuration (scope, reason, priority)
 * @param isActive - Whether the blocker is currently active (default: true)
 *
 */
export const useBlocker = (blockerId: string, config: BlockerConfig, isActive = true): void => {
  const { addBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  useEffect(() => {
    if (!isActive || !blockerId) {
      return;
    }

    addBlocker(blockerId, config);

    return () => {
      removeBlocker(blockerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockerId, isActive, addBlocker, removeBlocker]);
};
