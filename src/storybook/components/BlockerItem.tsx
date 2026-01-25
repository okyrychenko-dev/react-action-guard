import { ReactElement } from "react";
import { StoredBlocker } from "../../store";
import { formatScope } from "./BlockerItem.utils";

export interface BlockerEntry {
  id: string;
  blocker: StoredBlocker;
}

function BlockerItem({ id, blocker }: BlockerEntry): ReactElement {
  return (
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
}

export default BlockerItem;
