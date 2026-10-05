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
      className="flex gap-4 overflow-x-auto bg-slate-950 px-3 py-3 md:col-start-1 md:row-start-2 md:row-span-2 md:flex-col md:gap-3 md:overflow-y-auto md:px-2.5 md:py-4 xl:row-span-1"
      aria-label="Main navigation"
    >
      {NAV_SECTIONS.map((section) => (
        <SidebarSection key={section.heading} section={section} pathname={pathname} />
      ))}

      <div className="hidden md:mt-auto md:block md:border-t md:border-white/10 md:pt-3">
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
