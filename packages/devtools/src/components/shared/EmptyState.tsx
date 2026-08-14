import { clsx } from "clsx";
import { ReactElement, ReactNode } from "react";
import sharedStyles from "../../styles/shared.module.css";

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

function EmptyState(props: EmptyStateProps): ReactElement {
  const { children, className } = props;

  return <div className={clsx(sharedStyles.emptyState, className)}>{children}</div>;
}

export default EmptyState;
