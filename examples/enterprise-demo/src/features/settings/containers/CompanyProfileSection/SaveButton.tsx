import { Button } from "@heroui/react";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import type { ReactElement } from "react";

interface SaveButtonProps {
  onSave: VoidFunction;
}

export function SaveButton(props: SaveButtonProps): ReactElement {
  const { onSave } = props;
  const { buttonState } = useGuardedButton({ scope: "checkout" });

  return (
    <Button variant="primary" onPress={onSave} isDisabled={buttonState.disabled}>
      Save changes
    </Button>
  );
}
