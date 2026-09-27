import { ReactElement } from "react";
import ActionGuardDevtoolsInternal from "./ActionGuardDevtoolsInternal";
import type { Nullable } from "@okyrychenko-dev/type-utils";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";
import "../../styles/theme.css";

/**
 * Visual panel for inspecting UI blocking. Hidden in production unless
 * `showInProduction` is set; observers of one store share an observation session.
 *
 * @public
 * @see {@link https://github.com/okyrychenko-dev/react-action-guard-devtools | DevTools README}
 * @see {@link createDevtoolsMiddleware} for manual middleware registration
 */
function ActionGuardDevtools(props: ActionGuardDevtoolsProps): Nullable<ReactElement> {
  const { showInProduction = false, ...others } = props;

  // Early return in production - no hooks called, no resources allocated
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  return <ActionGuardDevtoolsInternal {...others} />;
}

export default ActionGuardDevtools;
