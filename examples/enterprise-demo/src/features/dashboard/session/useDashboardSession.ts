import { useContext } from "react";
import { DashboardSessionContext } from "./dashboardSession.context";
import type { DashboardSession } from "./dashboardSession.types";

export function useDashboardSession(): DashboardSession {
  const session = useContext(DashboardSessionContext);
  if (!session) {
    throw new Error("Dashboard session consumers require DashboardSessionProvider.");
  }
  return session;
}
