import {
  AdminIcon,
  CheckoutIcon,
  DashboardIcon,
  IntegrationsIcon,
  OrdersIcon,
  SettingsIcon,
  TeamIcon,
} from "../NavIcons";
import type { NavSection } from "./Sidebar.types";

export const NAV_SECTIONS: ReadonlyArray<NavSection> = [
  {
    heading: "Main",
    items: [
      { path: "/", label: "Dashboard", Icon: DashboardIcon },
      { path: "/checkout", label: "Checkout", Icon: CheckoutIcon, blockedScope: "checkout" },
      { path: "/admin", label: "Admin", Icon: AdminIcon, blockedScope: "admin" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { path: "/orders", label: "Orders", Icon: OrdersIcon, blockedScope: "checkout" },
      { path: "/integrations", label: "Integrations", Icon: IntegrationsIcon },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { path: "/team", label: "Team", Icon: TeamIcon },
      { path: "/settings", label: "Settings", Icon: SettingsIcon },
    ],
  },
];
