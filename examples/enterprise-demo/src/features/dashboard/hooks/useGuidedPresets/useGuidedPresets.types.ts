import type { BlockerConfig } from "@okyrychenko-dev/react-action-guard";

export interface GuidedPresetBlocker {
  id: string;
  config: BlockerConfig;
}

export interface GuidedPreset {
  id: string;
  label: string;
  description: string;
  blockers: ReadonlyArray<GuidedPresetBlocker>;
}

export interface UseGuidedPresetsOptions {
  presets: ReadonlyArray<GuidedPreset>;
}

export interface UseGuidedPresetsReturn {
  activePresetId: string | null;
  applyPreset: (preset: GuidedPreset) => void;
  clearPresets: VoidFunction;
}
