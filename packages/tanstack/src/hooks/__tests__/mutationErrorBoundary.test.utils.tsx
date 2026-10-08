import { Component, type ComponentType, type ReactNode } from "react";
import type {
  MutationErrorBoundaryProps,
  MutationErrorBoundaryState,
} from "./mutationErrorBoundary.test.types";

export function createMutationErrorBoundary(
  onError: (error: unknown) => void
): ComponentType<MutationErrorBoundaryProps> {
  class MutationErrorBoundary extends Component<
    MutationErrorBoundaryProps,
    MutationErrorBoundaryState
  > {
    state: MutationErrorBoundaryState = { error: undefined };

    static getDerivedStateFromError(error: unknown): MutationErrorBoundaryState {
      return { error };
    }

    componentDidCatch(error: unknown): void {
      onError(error);
    }

    render(): ReactNode {
      const { error } = this.state;
      const { children } = this.props;

      if (error !== undefined) {
        return null;
      }

      return children;
    }
  }

  return MutationErrorBoundary;
}
