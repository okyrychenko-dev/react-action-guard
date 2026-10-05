import { useEnterpriseBlockingInfo } from "@features/core/guard/scopes";
import { Card, Chip, EmptyState } from "@heroui/react";
import { LeaderboardRow } from "./LeaderboardRow";
import type { ReactElement } from "react";

export function PriorityLeaderboard(): ReactElement {
  const blockers = useEnterpriseBlockingInfo("checkout");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="m-0 text-slate-900 text-[17px] font-semibold">Priority leaderboard</h2>
        <Chip size="sm" color="default" variant="secondary">
          checkout scope
        </Chip>
      </div>

      <Card>
        <Card.Content className="flex flex-col">
          {blockers.length === 0 && (
            <EmptyState className="py-3 text-slate-400 text-[13px] text-center">
              No active blockers on the checkout scope.
            </EmptyState>
          )}
          {blockers.map((blocker, index) => (
            <LeaderboardRow key={blocker.id} rank={index + 1} blocker={blocker} />
          ))}
        </Card.Content>
      </Card>
    </div>
  );
}
