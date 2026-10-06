import { Button, Card } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { GUIDED_PRESETS } from "./GuidedPresets.constants";
import { PresetCard } from "./PresetCard";
import type { ReactElement } from "react";
import type { GuidedPresetsProps } from "./GuidedPresets.types";

export function GuidedPresets(props: GuidedPresetsProps): ReactElement {
  const { activePresetId, onApplyPreset, onClearPresets } = props;

  return (
    <Card aria-label="Guided proof presets">
      <Card.Header className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle eyebrow="Guided proof" title="Scenario presets" />
        <Button size="sm" variant="secondary" onPress={onClearPresets}>
          Clear presets
        </Button>
      </Card.Header>
      <Card.Content className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {GUIDED_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={activePresetId === preset.id}
            onApply={onApplyPreset}
          />
        ))}
      </Card.Content>
    </Card>
  );
}
