import {
  type BlockerInfo,
  DEFAULT_SCOPE,
  normalizeScope,
  scopeAffectsObservation,
} from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { clsx } from "clsx";
import { ReactElement } from "react";
import { formatRelativeTime, formatScope } from "../../utils";
import { Badge } from "../shared";
import styles from "./ActiveBlockers.module.css";
import { getBlockerAge } from "./ActiveBlockers.utils";
import type { DevtoolsInspectedAction } from "../actionGuardDevtools";

interface BlockerItemProps {
  id: string;
  blocker: BlockerInfo;
  isStuck: boolean;
  now?: number;
  actions?: ReadonlyArray<DevtoolsInspectedAction>;
}

function ActiveBlockerItem(props: BlockerItemProps): ReactElement {
  const { id, blocker, isStuck, now, actions } = props;
  const { scope, priority, reason, timestamp } = blocker;

  let affectedActions = "not declared";

  if (isDefined(actions)) {
    affectedActions =
      actions
        .filter(({ scope: actionScope }) => scopeAffectsObservation(scope, actionScope))
        .map(({ id: actionId }) => actionId)
        .join(", ") || "None";
  }

  const isGlobal = normalizeScope(scope).includes(DEFAULT_SCOPE);

  return (
    <article
      aria-label={`Blocker ${id}`}
      className={clsx(styles.blockerItem, isStuck && styles.blockerItemStuck)}
    >
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
        <span>Scope: {formatScope(scope)}</span>
        <span>Priority: {priority}</span>
        <span>Reason: {reason || "not provided"}</span>
        <span>Started: {formatRelativeTime(timestamp)}</span>
        <span>Age: {getBlockerAge(blocker, now ?? timestamp)} ms</span>
        <span>Source: unavailable</span>
        {isGlobal && <span>Global effect: all non-empty scopes</span>}
        <span>Affected actions: {affectedActions}</span>
      </div>
    </article>
  );
}

export default ActiveBlockerItem;
