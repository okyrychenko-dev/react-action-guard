import {
  AdminPage,
  CheckoutPage,
  DashboardPage,
  IntegrationsPage,
  OrdersPage,
  SettingsPage,
  TeamPage,
} from "@pages";
import { AppLayout } from "./AppLayout";
import type { RouteObject } from "react-router-dom";

const APP_ROUTES: ReadonlyArray<RouteObject> = [
  { index: true, element: <DashboardPage /> },
  { path: "checkout", element: <CheckoutPage /> },
  { path: "admin", element: <AdminPage /> },
  { path: "orders", element: <OrdersPage /> },
  { path: "integrations", element: <IntegrationsPage /> },
  { path: "team", element: <TeamPage /> },
  { path: "settings", element: <SettingsPage /> },
];

export const routes: ReadonlyArray<RouteObject> = [
  {
    element: <AppLayout />,
    children: [...APP_ROUTES],
  },
];
