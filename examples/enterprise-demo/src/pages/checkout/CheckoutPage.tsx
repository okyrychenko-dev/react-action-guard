import { CheckoutWorkspace } from "@features/checkout";
import { CoordinationWorkspace } from "@features/coordination";
import { useEnterpriseBlockingInfo } from "@features/core/guard/scopes";
import { NavigationBlockModal } from "@features/navigation";
import { useDialogState } from "@okyrychenko-dev/react-action-guard-router";
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";
import { getCheckoutNavigationCopy } from "./CheckoutPage.utils";
import type { ReactElement } from "react";
import type { CheckoutNavigationCopy } from "./CheckoutPage.types";

export function CheckoutPage(): ReactElement {
  const blockers = useEnterpriseBlockingInfo("navigation");
  const copy = getCheckoutNavigationCopy(blockers);
  const { dialogState, confirm } = useDialogState<CheckoutNavigationCopy>();

  const requestNavigationConfirmation = (): Promise<boolean> => confirm(copy);

  useNavigationBlocker({
    scope: "navigation",
    blockBrowserUnload: true,
    message: copy.message,
    onConfirm: requestNavigationConfirmation,
  });

  const handleConfirmNavigation: VoidFunction = () => {
    dialogState?.resolve(true);
  };

  const handleCancelNavigation: VoidFunction = () => {
    dialogState?.resolve(false);
  };

  return (
    <>
      <CheckoutWorkspace />
      <CoordinationWorkspace />
      <NavigationBlockModal
        title={dialogState?.message.title}
        message={dialogState?.message.message}
        cancelLabel={dialogState?.message.cancelLabel}
        isOpen={dialogState?.isOpen ?? false}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
}
