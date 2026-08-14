import { clsx } from "clsx";
import { ReactElement } from "react";
import styles from "./DevtoolsPanel.module.css";
import { DEVTOOLS_TABS } from "./DevtoolsPanelTabs.utils";
import type { DevtoolsState } from "../../types";

interface DevtoolsPanelTabsProps {
  activeTab: DevtoolsState["activeTab"];
  onSelectTab: (tab: DevtoolsState["activeTab"]) => void;
}

function DevtoolsPanelTabs(props: DevtoolsPanelTabsProps): ReactElement {
  const { activeTab, onSelectTab } = props;

  return (
    <div className={styles.tabs}>
      {DEVTOOLS_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            onSelectTab(tab.id);
          }}
          className={clsx(styles.tab, activeTab === tab.id && styles.tabActive)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default DevtoolsPanelTabs;
