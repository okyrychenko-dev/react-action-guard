import { useContext } from "react";
import { AuditSessionContext } from "./auditSession.context";
import type { UseAuditLogReturn } from "../hooks/useAuditLog";

export function useAuditSession(): UseAuditLogReturn {
  const audit = useContext(AuditSessionContext);
  if (!audit) {
    throw new Error("Audit session consumers require AuditSessionProvider.");
  }
  return audit;
}
