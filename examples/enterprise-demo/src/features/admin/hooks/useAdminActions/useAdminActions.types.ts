import type { UseConfirmableBlockerReturn } from "@okyrychenko-dev/react-action-guard";

export interface UseAdminActionsReturn {
  refundAction: UseConfirmableBlockerReturn;
  refundButtonDisabled: boolean;
  isMaintenanceArmed: boolean;
  isRestricted: boolean;
  isTeamLockActive: boolean;
  teamMemberName: string;
  actionResult: string;
  handleClearCheckout: VoidFunction;
  handleClearAll: VoidFunction;
  handleMaintenanceToggle: (value: boolean) => void;
  handleSimulateTeamMember: VoidFunction;
}
