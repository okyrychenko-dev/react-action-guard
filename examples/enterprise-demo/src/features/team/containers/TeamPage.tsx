import { PageHeader } from "@shared/components";
import { PriorityLeaderboard, TeamMemberCard } from "../components";
import { TEAM_MEMBERS } from "../team.data";
import type { ReactElement } from "react";

export function TeamPage(): ReactElement {
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Concurrent Access"
        title="Team Locks"
        description="Simulate concurrent team member locks to see the priority system resolve conflicts in real time."
      />

      <div className="grid grid-cols-2 gap-3.5">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      <PriorityLeaderboard />
    </div>
  );
}
