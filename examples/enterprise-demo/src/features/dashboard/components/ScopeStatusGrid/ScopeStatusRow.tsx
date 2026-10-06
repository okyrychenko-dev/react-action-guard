import { type EnterpriseScope, useEnterpriseBlockingInfo } from "@features/core/guard/scopes";
import { Card, Chip } from "@heroui/react";
import { formatScope } from "./ScopeStatusGrid.utils";
import type { ReactElement } from "react";

interface ScopeStatusRowProps {
  scope: EnterpriseScope;
}

export function ScopeStatusRow(props: ScopeStatusRowProps): ReactElement {
  const { scope } = props;
  const blockers = useEnterpriseBlockingInfo(scope);
  const isBlocked = blockers.length > 0;

  const dotClass = [
    "w-2 h-2 rounded-full shrink-0",
    isBlocked ? "bg-amber-400 scope-indicator--blocked" : "bg-emerald-500",
  ].join(" ");

  return (
    <Card className={isBlocked ? "border-amber-400/35 bg-amber-500/3" : ""}>
      <Card.Content className="flex items-center gap-2.5 py-3">
        <span className={dotClass} aria-hidden="true" />
        <span className="flex-1 text-slate-900 text-[13px] font-medium capitalize">
          {formatScope(scope)}
        </span>
        <Chip size="sm" color={isBlocked ? "warning" : "success"} variant="soft">
          {isBlocked
            ? `${blockers.length.toString()} blocker${blockers.length > 1 ? "s" : ""}`
            : "Clear"}
        </Chip>
      </Card.Content>
    </Card>
  );
}
