import type { DevtoolsState } from "../../types";

export interface DevtoolsTabConfig {
  id: DevtoolsState["activeTab"];
  label: string;
}

export const DEVTOOLS_TABS: ReadonlyArray<DevtoolsTabConfig> = [
  { id: "timeline", label: "Timeline" },
  { id: "blockers", label: "Active Blockers" },
  { id: "stats", label: "Stats" },
];
