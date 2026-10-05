import type { GuidedPreset } from "../../hooks/useGuidedPresets";

export type { GuidedPreset, GuidedPresetBlocker } from "../../hooks/useGuidedPresets";

export interface GuidedPresetsProps {
  activePresetId: string | null;
  onApplyPreset: (preset: GuidedPreset) => void;
  onClearPresets: VoidFunction;
}
