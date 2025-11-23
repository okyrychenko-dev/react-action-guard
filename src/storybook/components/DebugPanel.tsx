import { JSX } from "react";
import { type StoredBlocker, useUIBlockingStore } from "../../store";
import "./DebugPanel.css";

interface DebugPanelProps {
  title?: string;
  showEmpty?: boolean;
}

interface BlockerEntry {
  id: string;
  blocker: StoredBlocker;
}

const formatScope = (scope: string | ReadonlyArray<string>): string => {
  return Array.isArray(scope) ? scope.join(", ") : (scope as string);
};

const BlockerItem = ({ id, blocker }: BlockerEntry): JSX.Element => (
  <div className="blocker">
    <div className="field">
      <span className="label">ID:</span>
      <span className="value">{id}</span>
    </div>
    <div className="field">
      <span className="label">Scope:</span>
      <span className="value">{formatScope(blocker.scope)}</span>
    </div>
    <div className="field">
      <span className="label">Reason:</span>
      <span className="value">{blocker.reason}</span>
    </div>
    <div className="field">
      <span className="label">Priority:</span>
      <span className="value">{blocker.priority}</span>
    </div>
  </div>
);

export const DebugPanel = ({
  title = "🔍 Debug Panel",
  showEmpty = true,
}: DebugPanelProps): JSX.Element => {
  const activeBlockers = useUIBlockingStore((state) => state.activeBlockers);
  const blockerEntries: Array<BlockerEntry> = Array.from(activeBlockers.entries()).map(
    ([id, blocker]): BlockerEntry => ({
      id,
      blocker,
    })
  );

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
};
