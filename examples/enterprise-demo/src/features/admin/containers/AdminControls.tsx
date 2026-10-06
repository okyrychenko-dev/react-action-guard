import { AdminPanel, ConfirmDialog, MaintenanceBlocker } from "../components";
import { useAdminActions } from "../hooks";
import type { ReactElement } from "react";

export function AdminControls(): ReactElement {
  const state = useAdminActions();

  const handleMaintenanceEnd = (): void => {
    state.handleMaintenanceToggle(false);
  };

  const handleRefundConfirm = (): void => {
    void state.refundAction.onConfirm();
  };

  return (
    <>
      <AdminPanel
        isRestricted={state.isRestricted}
        actionResult={state.actionResult}
        isMaintenanceArmed={state.isMaintenanceArmed}
        isTeamLockActive={state.isTeamLockActive}
        refundDisabled={state.refundButtonDisabled}
        onRefund={state.refundAction.execute}
        onClearCheckout={state.handleClearCheckout}
        onClearAll={state.handleClearAll}
        onMaintenanceToggle={state.handleMaintenanceToggle}
        onSimulateTeamMember={state.handleSimulateTeamMember}
      />
      {state.isMaintenanceArmed && <MaintenanceBlocker onEnd={handleMaintenanceEnd} />}
      <ConfirmDialog
        isOpen={state.refundAction.isDialogOpen}
        title={state.refundAction.confirmConfig.title}
        message={state.refundAction.confirmConfig.message}
        confirmText={state.refundAction.confirmConfig.confirmText}
        cancelText={state.refundAction.confirmConfig.cancelText}
        isExecuting={state.refundAction.isExecuting}
        onConfirm={handleRefundConfirm}
        onCancel={state.refundAction.onCancel}
      />
    </>
  );
}
