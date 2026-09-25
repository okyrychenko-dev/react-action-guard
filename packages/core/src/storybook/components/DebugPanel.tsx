import { ReactElement } from "react";
import { useUIBlockingStore } from "../../store";
import "./DebugPanel.css";
import BlockerItem, { BlockerEntry } from "./BlockerItem";

interface DebugPanelProps {
  title?: string;
  showEmpty?: boolean;
}

function DebugPanel(props: DebugPanelProps): ReactElement {
  const { title = "🔍 Debug Panel", showEmpty = true } = props;

  const blockingSnapshot = useUIBlockingStore((state) => state.blockingSnapshot);
  const blockerEntries: Array<BlockerEntry> = blockingSnapshot.map((blocker) => ({
    id: blocker.id,
    blocker,
  }));

  return (
    <div className="container">
      <h3 className={title}>{title}</h3>

      <div className="stat">
        <strong>Active Blockers:</strong> {blockerEntries.length}
      </div>

      {blockerEntries.length > 0 ? (
        <div>
          {blockerEntries.map((entry) => (
            <BlockerItem key={entry.id} {...entry} />
          ))}
        </div>
      ) : (
        showEmpty && <div className="empty">No active blockers</div>
      )}
    </div>
  );
}

export default DebugPanel;
