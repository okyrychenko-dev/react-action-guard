import { ReactElement } from "react";
import ActionGuardDevtoolsProviderInternal from "./ActionGuardDevtoolsProviderInternal";
import type { ActionGuardDevtoolsProviderProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsProvider(props: ActionGuardDevtoolsProviderProps): ReactElement {
  const { children, showInProduction = false, ...others } = props;

  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return <>{children}</>;
  }

  return (
    <ActionGuardDevtoolsProviderInternal {...others}>
      {children}
    </ActionGuardDevtoolsProviderInternal>
  );
}

export default ActionGuardDevtoolsProvider;
