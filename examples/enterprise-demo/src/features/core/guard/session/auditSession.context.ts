import { createContext } from "react";
import type { UseAuditLogReturn } from "../hooks/useAuditLog";

export const AuditSessionContext = createContext<UseAuditLogReturn | undefined>(undefined);
