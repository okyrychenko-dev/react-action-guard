import { useEnterpriseBlocker } from "@features/core";
import { NavigationBlockModal } from "@features/navigation";
import { useDialogState } from "@okyrychenko-dev/react-action-guard-router";
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";
import { useEffect } from "react";
import type { ReactElement } from "react";

interface ConfirmationRouteProps {
  onResolver: (resolve: (confirmed: boolean) => void) => void;
}

export function ConfirmationRoute({ onResolver }: ConfirmationRouteProps): ReactElement {
  useEnterpriseBlocker("dirty", { scope: "navigation" }, true);
  const { dialogState, confirm } = useDialogState();
  useNavigationBlocker({ scope: "navigation", message: "Discard edits?", onConfirm: confirm });
  useEffect(() => {
    if (dialogState) {
      onResolver(dialogState.resolve);
    }
  }, [dialogState, onResolver]);
  return (
    <NavigationBlockModal
      isOpen={dialogState?.isOpen ?? false}
      onConfirm={() => {
        dialogState?.resolve(true);
      }}
      onCancel={() => {
        dialogState?.resolve(false);
      }}
    />
  );
}
