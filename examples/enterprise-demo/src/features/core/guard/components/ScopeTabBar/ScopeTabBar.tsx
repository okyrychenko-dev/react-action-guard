import { type Key, ListBox, ListBoxItem, Select } from "@heroui/react";
import { ENTERPRISE_SCOPES, type EnterpriseScope } from "../../scopes";
import { toEnterpriseScope } from "./ScopeTabBar.utils";
import type { ReactElement } from "react";

interface ScopeTabBarProps {
  selectedScope: EnterpriseScope;
  onScopeChange: (scope: EnterpriseScope) => void;
}

export function ScopeTabBar(props: ScopeTabBarProps): ReactElement {
  const { selectedScope, onScopeChange } = props;

  const handleChange = (key: Key | null): void => {
    const scope = toEnterpriseScope(key);

    if (scope !== undefined) {
      onScopeChange(scope);
    }
  };

  return (
    <Select value={selectedScope} onChange={handleChange}>
      <Select.Trigger aria-label="Blocking scope">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {ENTERPRISE_SCOPES.map((scope) => (
            <ListBoxItem key={scope} id={scope}>
              {scope}
            </ListBoxItem>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
