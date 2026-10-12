import { ENTERPRISE_SCOPES } from "@features/core/guard/scopes";
import type { DevtoolsInspection } from "@okyrychenko-dev/react-action-guard-devtools";

export const DEMO_INSPECTION: DevtoolsInspection = {
  scopes: ENTERPRISE_SCOPES,
  actions: [
    { id: "save-cart", scope: ["checkout", "navigation"] },
    { id: "apply-coupon", scope: ["checkout", "payment"] },
    { id: "place-order", scope: ["checkout", "payment", "inventory"] },
    { id: "leave-checkout", scope: "navigation" },
    { id: "edit-property", scope: "property" },
    { id: "save-revision", scope: ["property", "revision", "recalculation"] },
    { id: "recalculate-revision", scope: ["property", "revision", "recalculation"] },
    { id: "agent-edit", scope: ["property", "revision", "recalculation"] },
    { id: "help-and-chat", scope: "help" },
  ],
};
