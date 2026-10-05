export type PriorityColor = "danger" | "warning" | "default";

export type TeamMemberScope = "checkout" | "payment" | "inventory" | "admin";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  scope: ReadonlyArray<TeamMemberScope>;
  priority: number;
  lockDurationMs: number;
}
