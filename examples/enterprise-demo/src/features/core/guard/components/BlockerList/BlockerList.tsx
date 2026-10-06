import { EmptyState, ScrollShadow } from "@heroui/react";
import { BlockerCard } from "./BlockerCard";
import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { ReactElement } from "react";

interface BlockerListProps {
  blockers: ReadonlyArray<BlockerInfo>;
}

export function BlockerList(props: BlockerListProps): ReactElement {
  const { blockers } = props;

  if (blockers.length === 0) {
    return (
      <ScrollShadow className="max-h-56" aria-label="Active blockers">
        <EmptyState className="py-3 text-slate-400 text-[13px]">
          No active blockers for this scope.
        </EmptyState>
      </ScrollShadow>
    );
  }

  return (
    <ScrollShadow className="max-h-56 flex flex-col gap-2" aria-label="Active blockers">
      {blockers.map((blocker) => (
        <BlockerCard key={blocker.id} blocker={blocker} />
      ))}
    </ScrollShadow>
  );
}
