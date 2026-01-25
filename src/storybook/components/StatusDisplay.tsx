import { ReactElement, ReactNode } from "react";

interface StatusDisplayProps {
  label?: string;
  children: ReactNode;
}

function StatusDisplay(props: StatusDisplayProps): ReactElement {
  const { label = "Status:", children } = props;

  return (
    <p className="status">
      {label} <strong>{children}</strong>
    </p>
  );
}

export default StatusDisplay;
