import { Component, ReactNode } from "react";
import sharedStyles from "../../styles/shared.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className={sharedStyles.errorBoundary}>
          <span className={sharedStyles.errorTitle}>Devtools Error</span>
          <span className={sharedStyles.errorMessage}>{error?.message ?? "Unknown error"}</span>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
