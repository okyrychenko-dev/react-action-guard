import { CheckoutWorkspace } from "@features/checkout";
import { NavigationBlockModal } from "@features/navigation";
import { useDialogState } from "@okyrychenko-dev/react-action-guard-router";
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";
import type { ReactElement } from "react";

export function CheckoutPage(): ReactElement {
  const { dialogState, confirm } = useDialogState();

  useNavigationBlocker({
    scope: "navigation",
    blockBrowserUnload: true,
    message: "Checkout has unsaved edits. Leave and discard them?",
    onConfirm: confirm,
  });

  return (
    <>
      <CheckoutWorkspace />
      <NavigationBlockModal
        isOpen={dialogState?.isOpen ?? false}
        onConfirm={() => {
          dialogState?.resolve(true);
        }}
        onCancel={() => {
          dialogState?.resolve(false);
        }}
      />
    </>
  );
}
