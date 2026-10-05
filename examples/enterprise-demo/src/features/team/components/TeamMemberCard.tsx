import { useEnterpriseBlocker } from "@features/core/guard/scopes";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { useEffect, useState } from "react";
import { resolvePriorityColor } from "../team.utils";
import type { ReactElement } from "react";
import type { TeamMember } from "../team.types";

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard(props: TeamMemberCardProps): ReactElement {
  const { member } = props;

  const [isLocked, setIsLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEnterpriseBlocker(
    `team-lock-${member.id}`,
    {
      scope: member.scope,
      priority: member.priority,
      reason: `${member.name} holds a review lock`,
    },
    isLocked
  );

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLocked(false);
      setSecondsLeft(0);
    }, member.lockDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLocked, member.lockDurationMs]);

  const handleAcquire = (): void => {
    setSecondsLeft(Math.round(member.lockDurationMs / 1000));
    setIsLocked(true);
  };

  const handleRelease = (): void => {
    setIsLocked(false);
    setSecondsLeft(0);
  };

  const priorityColor = resolvePriorityColor(member.priority);

  return (
    <Card className={isLocked ? "border-amber-400/40 bg-amber-500/3" : ""}>
      <Card.Content className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${member.avatarColor} grid place-items-center text-white text-[13px] font-bold shrink-0`}
          >
            {member.avatar}
          </div>
          <div>
            <p className="m-0 text-slate-900 text-[14px] font-semibold">{member.name}</p>
            <p className="m-0 text-slate-500 text-[12px]">{member.role}</p>
          </div>
          <Chip size="sm" color={priorityColor} variant="soft" className="ml-auto">
            P{member.priority}
          </Chip>
        </div>

        <div className="flex flex-wrap gap-1">
          {member.scope.map((s) => (
            <Chip key={s} size="sm" variant="secondary">
              {s}
            </Chip>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2.5">
          {isLocked && (
            <p className="m-0 flex-1 text-amber-600 text-[13px] font-semibold tabular-nums">
              Lock active — {secondsLeft}s remaining
            </p>
          )}
          {!isLocked && <p className="m-0 flex-1 text-slate-400 text-[13px]">No active lock</p>}

          {isLocked && (
            <Button size="sm" variant="secondary" onPress={handleRelease}>
              Release
            </Button>
          )}
          {!isLocked && (
            <Button size="sm" variant="primary" onPress={handleAcquire}>
              Acquire Lock
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
