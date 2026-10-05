import { NavButton } from "../NavButton";
import { isNavPathActive } from "./Sidebar.utils";
import type { ReactElement } from "react";
import type { NavSection } from "./Sidebar.types";

interface SidebarSectionProps {
  section: NavSection;
  pathname: string;
}

export function SidebarSection(props: SidebarSectionProps): ReactElement {
  const { section, pathname } = props;

  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-2.5 pb-1 pt-0.5 text-slate-500 text-[10px] font-semibold tracking-[0.08em] uppercase m-0">
        {section.heading}
      </p>
      {section.items.map((item) => (
        <NavButton key={item.path} item={item} isActive={isNavPathActive(pathname, item.path)} />
      ))}
    </div>
  );
}
