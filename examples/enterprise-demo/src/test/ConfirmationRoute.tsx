import { useEnterpriseBlocker } from "@features/core";
import { NavigationBlockModal } from "@features/navigation";
import { useDialogState } from "@okyrychenko-dev/react-action-guard-router";
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";
import { useEffect } from "react";
import type { ReactElement } from "react";

interface ConfirmationRouteProps {
  onResolver: (resolve: (confirmed: boolean) => void) => void;
}

export function ConfirmationRoute(props: ConfirmationRouteProps): ReactElement {
  const { onResolver } = props;

  useEnterpriseBlocker("dirty", { scope: "navigation" }, true);
  const { dialogState, confirm } = useDialogState();
  useNavigationBlocker({ scope: "navigation", message: "Discard edits?", onConfirm: confirm });
  useEffect(() => {
    if (dialogState) {
      onResolver(dialogState.resolve);
    }
  }, [dialogState, onResolver]);
  const handleConfirmNavigation: VoidFunction = () => {
    dialogState?.resolve(true);
  };

  const handleCancelNavigation: VoidFunction = () => {
    dialogState?.resolve(false);
  };

  return (
    <NavigationBlockModal
      isOpen={dialogState?.isOpen ?? false}
      onConfirm={handleConfirmNavigation}
      onCancel={handleCancelNavigation}
    />
  );
}
