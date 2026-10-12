import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";
import { DEMO_INSPECTION } from "./DemoDevtools.constants";
import type { ReactElement } from "react";
import "@okyrychenko-dev/react-action-guard-devtools/styles.css";

export function DemoDevtools(): ReactElement {
  const store = useResolvedStoreApi();

  return <ActionGuardDevtools store={store} inspection={DEMO_INSPECTION} showInProduction />;
}
