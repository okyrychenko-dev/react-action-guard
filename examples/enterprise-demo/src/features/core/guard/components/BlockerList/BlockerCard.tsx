import { Card, Chip } from "@heroui/react";
import { formatScope, priorityColor } from "./BlockerList.utils";
import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { ReactElement } from "react";

interface BlockerCardProps {
  blocker: BlockerInfo;
}

export function BlockerCard(props: BlockerCardProps): ReactElement {
  const { blocker } = props;

  return (
    <Card className="border-l-4 border-l-amber-400 bg-amber-50">
      <Card.Content className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-[13px] text-slate-900 break-all">{blocker.id}</strong>
          <Chip size="sm" color={priorityColor(blocker.priority)} variant="soft">
            P{blocker.priority}
          </Chip>
        </div>
        <div className="flex flex-wrap gap-1">
          {formatScope(blocker.scope).map((s) => (
            <Chip key={s} size="sm" variant="secondary">
              {s}
            </Chip>
          ))}
        </div>
        <p className="m-0 text-slate-500 text-[13px] leading-snug">{blocker.reason}</p>
        <span className="text-slate-400 text-xs">
          {new Date(blocker.timestamp).toLocaleTimeString()}
        </span>
      </Card.Content>
    </Card>
  );
}
