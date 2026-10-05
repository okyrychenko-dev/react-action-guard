import { Button } from "@heroui/react";
import type { ReactElement } from "react";

interface AuditFilterButtonProps<T extends string> {
  value: T;
  currentFilter: T;
  onSelect: (value: T) => void;
}

export function AuditFilterButton<T extends string>(
  props: AuditFilterButtonProps<T>
): ReactElement {
  const { value, currentFilter, onSelect } = props;

  const handlePress = (): void => {
    onSelect(value);
  };

  return (
    <Button
      size="sm"
      variant={currentFilter === value ? "primary" : "secondary"}
      onPress={handlePress}
    >
      {value}
    </Button>
  );
}
