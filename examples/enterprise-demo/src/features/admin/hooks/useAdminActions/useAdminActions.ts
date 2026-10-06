import { useEnterpriseBlocker, useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { useConfirmableBlocker, useResolvedValue } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import { useEffect, useRef, useState } from "react";
import { refundEnterpriseOrder } from "../../admin.api";
import type { UseAdminActionsReturn } from "./useAdminActions.types";

const TEAM_MEMBER_NAMES: ReadonlyArray<string> = ["Alex M.", "Sarah K.", "Jordan R.", "Taylor W."];

function pickRandomName(): string {
  return TEAM_MEMBER_NAMES[Math.floor(Math.random() * TEAM_MEMBER_NAMES.length)];
}

export function useAdminActions(): UseAdminActionsReturn {
  const [isMaintenanceArmed, setMaintenanceArmed] = useState(false);
  const [actionResult, setActionResult] = useState("No admin action executed");
  const [isTeamLockActive, setTeamLockActive] = useState(false);
  const [teamMemberName, setTeamMemberName] = useState("");
  const isMountedRef = useRef(true);
  const refundControllerRef = useRef<AbortController | null>(null);
  const teamLockTimeoutRef = useRef<number | null>(null);

  const isAdminBlocked = useEnterpriseIsBlocked("admin");
  const isGlobalBlocked = useEnterpriseIsBlocked("global");
  const isPaymentBlocked = useEnterpriseIsBlocked("payment");
  const isRestricted = isAdminBlocked || isGlobalBlocked || isPaymentBlocked;

  const { buttonState: refundButtonState } = useGuardedButton({
    scope: ["admin", "payment"],
  });

  const { clearAllBlockers, clearBlockersForScope } = useResolvedValue((state) => ({
    clearAllBlockers: state.clearAllBlockers,
    clearBlockersForScope: state.clearBlockersForScope,
  }));

  useEnterpriseBlocker(
    "concurrent-team-review",
    {
      scope: ["checkout", "payment"],
      reason: `${teamMemberName} is reviewing this order — auto-releases in 8s`,
      priority: 78,
    },
    isTeamLockActive
  );

  const refundAction = useConfirmableBlocker("refund-enterprise-order", {
    scope: ["admin", "payment"],
    reason: "Refund approval is pending",
    priority: 94,
    confirmTitle: "Approve enterprise refund",
    confirmMessage: "Refunding this order will create a finance audit event.",
    confirmButtonText: "Approve refund",
    cancelButtonText: "Keep order",
    onConfirm: async () => {
      if (!isMountedRef.current) {
        return;
      }
      const controller = new AbortController();
      refundControllerRef.current = controller;
      try {
        await refundEnterpriseOrder(controller.signal);
        if (!controller.signal.aborted) {
          setActionResult("Refund approved and audit event recorded");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          throw error;
        }
      } finally {
        if (refundControllerRef.current === controller) {
          refundControllerRef.current = null;
        }
      }
    },
    onCancel: () => {
      setActionResult("Refund cancelled");
    },
  });

  const clearTeamLockTimeout = (): void => {
    if (teamLockTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(teamLockTimeoutRef.current);
    teamLockTimeoutRef.current = null;
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTeamLockTimeout();
      refundControllerRef.current?.abort();
    };
  }, []);

  const handleSimulateTeamMember = (): void => {
    if (isTeamLockActive) {
      return;
    }

    const name = pickRandomName();

    setTeamMemberName(name);
    setTeamLockActive(true);
    setActionResult(`${name} lock added — auto-releases in 8s`);

    clearTeamLockTimeout();
    teamLockTimeoutRef.current = window.setTimeout(() => {
      teamLockTimeoutRef.current = null;
      setTeamLockActive(false);
      setActionResult(`${name} lock released`);
    }, 8000);
  };

  const handleClearCheckout = (): void => {
    clearTeamLockTimeout();
    setTeamLockActive(false);
    clearBlockersForScope("checkout");
  };

  const handleClearAll = (): void => {
    clearTeamLockTimeout();
    setTeamLockActive(false);
    setMaintenanceArmed(false);
    clearAllBlockers();
  };

  return {
    refundAction,
    refundButtonDisabled: refundButtonState.disabled,
    isMaintenanceArmed,
    isRestricted,
    isTeamLockActive,
    teamMemberName,
    actionResult,
    handleClearCheckout,
    handleClearAll,
    handleMaintenanceToggle: setMaintenanceArmed,
    handleSimulateTeamMember,
  };
}
