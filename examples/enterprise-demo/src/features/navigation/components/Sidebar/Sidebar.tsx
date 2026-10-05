import { Chip } from "@heroui/react";
import { useResolvedValue } from "@okyrychenko-dev/react-action-guard";
import { useLocation } from "react-router-dom";
import { NAV_SECTIONS } from "./Sidebar.constants";
import { SidebarSection } from "./SidebarSection";
import type { ReactElement } from "react";

export function Sidebar(): ReactElement {
  const { pathname } = useLocation();
  const { blockerCount } = useResolvedValue((s) => ({
    blockerCount: s.blockingSnapshot.length,
  }));

  return (
    <nav
      className="sidebar col-start-1 row-start-2 bg-slate-950 border-r border-white/7 overflow-y-auto px-2.5 py-3.5 flex flex-col gap-3"
      aria-label="Main navigation"
    >
      {NAV_SECTIONS.map((section) => (
        <SidebarSection key={section.heading} section={section} pathname={pathname} />
      ))}

      <div className="mt-auto pt-3 border-t border-white/7">
        <div className="flex items-center justify-between px-2.5 py-1.5 text-slate-500 text-xs">
          <span>Active blockers</span>
          <Chip size="sm" color={blockerCount > 0 ? "warning" : "default"} variant="soft">
            {blockerCount}
          </Chip>
        </div>
        <div className="flex items-center justify-between px-2.5 py-1.5 text-slate-500 text-xs">
          <span>Scopes guarded</span>
          <span className="text-slate-400 font-semibold">6</span>
        </div>
      </div>
    </nav>
  );
}
