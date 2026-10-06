import type { EnterpriseScope } from "@features/core/guard/scopes";
import type { ReactElement } from "react";

export interface NavItem {
  path: string;
  label: string;
  Icon: () => ReactElement;
  blockedScope?: Extract<EnterpriseScope, "checkout" | "admin" | "payment" | "inventory">;
}

export interface NavSection {
  heading: string;
  items: ReadonlyArray<NavItem>;
}
