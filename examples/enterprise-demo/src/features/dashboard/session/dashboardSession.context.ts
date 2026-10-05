import { createContext } from "react";
import type { DashboardSession } from "./dashboardSession.types";

export const DashboardSessionContext = createContext<DashboardSession | undefined>(undefined);
