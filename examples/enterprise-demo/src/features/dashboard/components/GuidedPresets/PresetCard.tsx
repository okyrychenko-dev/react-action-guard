import { Button, Card, Chip } from "@heroui/react";
import type { ReactElement } from "react";
import type { GuidedPreset } from "./GuidedPresets.types";

interface PresetCardProps {
  preset: GuidedPreset;
  isActive: boolean;
  onApply: (preset: GuidedPreset) => void;
}

export function PresetCard(props: PresetCardProps): ReactElement {
  const { preset, isActive, onApply } = props;

  const handleApply = (): void => {
    onApply(preset);
  };

  return (
    <Card className="bg-slate-50">
      <Card.Content className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="m-0 text-[14px] font-semibold text-slate-900">{preset.label}</h3>
            <p className="m-0 mt-1 text-[13px] leading-snug text-slate-500">{preset.description}</p>
          </div>
          {isActive && (
            <Chip size="sm" color="warning" variant="soft">
              Active
            </Chip>
          )}
        </div>
        <Button size="sm" variant={isActive ? "secondary" : "primary"} onPress={handleApply}>
          Apply preset
        </Button>
      </Card.Content>
    </Card>
  );
}
