import { ENTERPRISE_SCOPES } from "@features/core/guard/scopes";
import { ScopeStatusRow } from "./ScopeStatusRow";
import type { ReactElement } from "react";

export function ScopeStatusGrid(): ReactElement {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {ENTERPRISE_SCOPES.map((scope) => (
        <ScopeStatusRow key={scope} scope={scope} />
      ))}
    </div>
  );
}
