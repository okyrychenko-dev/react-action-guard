import { useAuditLog } from "../hooks/useAuditLog";
import { AuditSessionContext } from "./auditSession.context";
import type { ReactElement, ReactNode } from "react";

interface AuditSessionProviderProps {
  children: ReactNode;
}

export function AuditSessionProvider({ children }: AuditSessionProviderProps): ReactElement {
  const audit = useAuditLog();
  return <AuditSessionContext value={audit}>{children}</AuditSessionContext>;
}
