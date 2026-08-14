import { StoredBlocker } from "@okyrychenko-dev/react-action-guard";
import { clsx } from "clsx";
import { ReactElement } from "react";
import { formatRelativeTime, formatScope } from "../../utils";
import { Badge } from "../shared";
import styles from "./ActiveBlockers.module.css";

interface BlockerItemProps {
  id: string;
  blocker: StoredBlocker;
  isStuck: boolean;
}

function ActiveBlockerItem(props: BlockerItemProps): ReactElement {
  const { id, blocker, isStuck } = props;

  return (
    <div className={clsx(styles.blockerItem, isStuck && styles.blockerItemStuck)}>
      <div className={styles.blockerHeader}>
        <span className={styles.blockerId}>{id}</span>
        {isStuck ? (
          <Badge className={styles.stuckBadge} title="Active longer than the stuck threshold">
            Stuck
          </Badge>
        ) : (
          <Badge className={styles.activeBadge}>Active</Badge>
        )}
      </div>
      <div className={styles.blockerMeta}>
        <span>Scope: {formatScope(blocker.scope)}</span>
        <span>Priority: {blocker.priority}</span>
        <span>Reason: {blocker.reason}</span>
        <span>Started: {formatRelativeTime(blocker.timestamp)}</span>
      </div>
    </div>
  );
}

export default ActiveBlockerItem;
