export type GuardedReasonMode = "visible" | "description" | "hidden";

export type GuardedFieldReasonMode = "helperText" | "description" | "hidden";

export interface GuardedReasonProps {
  reasonMode?: GuardedReasonMode;
  reasonFallback?: string;
  reasonId?: string;
}

export interface GuardedFieldReasonProps {
  reasonMode?: GuardedFieldReasonMode;
  reasonFallback?: string;
  reasonId?: string;
}

export interface GuardedReasonBlocker {
  isBlocked: boolean;
  reason: string | null;
}

export interface GuardedReasonResult {
  ariaDescribedBy?: string;
  reasonContent: string | null;
}
