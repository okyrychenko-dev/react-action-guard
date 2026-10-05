import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useCallback, useEffect, useState } from "react";
import type {
  GuidedPreset,
  UseGuidedPresetsOptions,
  UseGuidedPresetsReturn,
} from "./useGuidedPresets.types";

export function useGuidedPresets({ presets }: UseGuidedPresetsOptions): UseGuidedPresetsReturn {
  const store = useResolvedStoreApi();
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(({ blockingSnapshot }) => {
      setActivePresetId((currentId) => {
        const preset = presets.find(({ id }) => id === currentId);
        if (!preset) {
          return null;
        }
        const hasAllBlockers = preset.blockers.every(({ id }) =>
          blockingSnapshot.some((blocker) => blocker.id === id)
        );
        return hasAllBlockers ? currentId : null;
      });
    });
  }, [presets, store]);

  const clearPresetBlockers = useCallback(() => {
    const { removeBlocker } = store.getState();
    presets
      .flatMap((p) => p.blockers)
      .forEach((b) => {
        removeBlocker(b.id);
      });
  }, [presets, store]);

  useEffect(() => {
    return clearPresetBlockers;
  }, [clearPresetBlockers]);

  const clearPresets = useCallback(() => {
    clearPresetBlockers();
    setActivePresetId(null);
  }, [clearPresetBlockers]);

  const applyPreset = useCallback(
    (preset: GuidedPreset) => {
      const { addBlocker } = store.getState();
      clearPresetBlockers();
      preset.blockers.forEach((b) => {
        addBlocker(b.id, b.config);
      });
      setActivePresetId(preset.id);
    },
    [clearPresetBlockers, store]
  );

  return { activePresetId, applyPreset, clearPresets };
}
