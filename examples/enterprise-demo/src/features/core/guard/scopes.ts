import { createTypedHooks } from "@okyrychenko-dev/react-action-guard";

export type EnterpriseScope =
  "global" | "checkout" | "payment" | "inventory" | "admin" | "navigation";

export const {
  useAsyncAction: useGuardedAction,
  useActionBlocker: useEnterpriseBlocker,
  useBlockingInfo: useEnterpriseBlockingInfo,
  useIsBlocked: useEnterpriseIsBlocked,
} = createTypedHooks<EnterpriseScope>();

export const ENTERPRISE_SCOPES: ReadonlyArray<EnterpriseScope> = [
  "global",
  "checkout",
  "payment",
  "inventory",
  "admin",
  "navigation",
];
