import { Chip } from "@heroui/react";
import { resolvePriorityColor } from "../team.utils";
import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { ReactElement } from "react";

interface LeaderboardRowProps {
  rank: number;
  blocker: BlockerInfo;
}

export function LeaderboardRow(props: LeaderboardRowProps): ReactElement {
  const { rank, blocker } = props;

  const priorityColor = resolvePriorityColor(blocker.priority);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-900/6 last:border-0">
      <span className="w-6 text-center text-slate-400 text-[12px] font-bold tabular-nums shrink-0">
        #{rank}
      </span>
      <span className="flex-1 text-slate-700 text-[13px] font-mono truncate">{blocker.id}</span>
      <Chip size="sm" color={priorityColor} variant="soft" className="shrink-0">
        P{blocker.priority}
      </Chip>
      <span className="text-slate-500 text-[12px] truncate max-w-[180px]">{blocker.reason}</span>
    </div>
  );
}
