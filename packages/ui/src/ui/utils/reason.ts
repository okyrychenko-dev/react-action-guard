import type {
  GuardedFieldReasonMode,
  GuardedReasonBlocker,
  GuardedReasonMode,
  GuardedReasonResult,
} from "../types";

export function getGuardedReason(
  blocker: GuardedReasonBlocker,
  fallback?: string,
): string | null {
  return blocker.reason ?? fallback ?? null;
}

function shouldLinkReason(
  mode: GuardedReasonMode | GuardedFieldReasonMode,
): boolean {
  return mode === "description" || mode === "helperText";
}

function getRequiredReasonId(
  mode: GuardedReasonMode | GuardedFieldReasonMode,
  reasonId?: string,
): string {
  if (reasonId === undefined || reasonId.trim().length === 0) {
    throw new Error(`reasonId is required when reasonMode is "${mode}"`);
  }

  return reasonId;
}

function resolveGuardedReason(params: {
  blocker: GuardedReasonBlocker;
  fallback?: string;
  mode: GuardedReasonMode | GuardedFieldReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  const reason = getGuardedReason(params.blocker, params.fallback);

  if (
    !params.blocker.isBlocked ||
    reason === null ||
    params.mode === "hidden"
  ) {
    return { ariaDescribedBy: undefined, reasonContent: null };
  }

  if (shouldLinkReason(params.mode)) {
    return {
      ariaDescribedBy: getRequiredReasonId(params.mode, params.reasonId),
      reasonContent: reason,
    };
  }

  return { ariaDescribedBy: undefined, reasonContent: reason };
}

export function resolveActionReason(params: {
  blocker: GuardedReasonBlocker;
  fallback?: string;
  mode: GuardedReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  return resolveGuardedReason(params);
}

export function resolveFieldReason(params: {
  blocker: GuardedReasonBlocker;
  fallback?: string;
  mode: GuardedFieldReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  return resolveGuardedReason(params);
}
