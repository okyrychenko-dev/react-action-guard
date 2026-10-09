import type { ReactNode } from "react";

export interface MutationErrorBoundaryProps {
  children: ReactNode;
}

export interface MutationErrorBoundaryState {
  error: unknown;
}
