import { useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { Button, Chip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import type { NavItem } from "./Sidebar/Sidebar.types";

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

export function NavButton(props: NavButtonProps): ReactElement {
  const { item, isActive } = props;

  const navigate = useNavigate();
  const isBlocked = useEnterpriseIsBlocked(item.blockedScope ?? "global");

  let navClass = "bg-transparent text-slate-400 hover:bg-white/6 hover:text-slate-300";

  if (isActive) {
    navClass = "bg-teal-600/13 text-slate-50 hover:bg-teal-600/18 hover:text-slate-50";
  }

  const handlePress = (): void => {
    void navigate(item.path);
  };

  return (
    <Button
      fullWidth
      variant="ghost"
      className={`relative justify-start gap-2.5 px-3 py-2 text-[13px] font-medium ${navClass}`}
      onPress={handlePress}
    >
      {isActive && (
        <span
          className="absolute left-0 inset-y-1 w-0.5 rounded-r-sm bg-teal-500"
          aria-hidden="true"
        />
      )}
      <item.Icon />
      {item.label}
      {item.blockedScope && isBlocked && (
        <Chip size="sm" color="warning" variant="soft" className="ml-auto">
          !
        </Chip>
      )}
    </Button>
  );
}
