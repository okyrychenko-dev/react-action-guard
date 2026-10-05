import type { TeamMember } from "./team.types";

export const TEAM_MEMBERS: ReadonlyArray<TeamMember> = [
  {
    id: "alice",
    name: "Alice Chen",
    role: "Engineering Manager",
    avatar: "AC",
    avatarColor: "bg-violet-500",
    scope: ["checkout", "payment"],
    priority: 90,
    lockDurationMs: 10000,
  },
  {
    id: "bob",
    name: "Bob Kumar",
    role: "Senior Engineer",
    avatar: "BK",
    avatarColor: "bg-blue-500",
    scope: ["checkout"],
    priority: 75,
    lockDurationMs: 8000,
  },
  {
    id: "carol",
    name: "Carol Smith",
    role: "Risk Analyst",
    avatar: "CS",
    avatarColor: "bg-rose-500",
    scope: ["payment", "inventory"],
    priority: 85,
    lockDurationMs: 12000,
  },
  {
    id: "david",
    name: "David Park",
    role: "Junior Engineer",
    avatar: "DP",
    avatarColor: "bg-amber-500",
    scope: ["checkout"],
    priority: 40,
    lockDurationMs: 6000,
  },
];
