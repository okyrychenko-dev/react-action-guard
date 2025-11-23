import { JSX, ReactNode } from "react";

interface StatusDisplayProps {
  label?: string;
  children: ReactNode;
}

export const StatusDisplay = ({ label = "Status:", children }: StatusDisplayProps): JSX.Element => {
  return (
    <p className="status">
      {label} <strong>{children}</strong>
    </p>
  );
};
