import { createResolvedStoreHooks } from "@okyrychenko-dev/react-zustand-toolkit";
import { ReactElement, ReactNode, createContext, useContext } from "react";
import { devtoolsStoreApi } from "./devtoolsStore.store";
import type { DevtoolsStore } from "../types";
import type { DevtoolsStoreApi } from "./devtoolsStore.store";

const DevtoolsStoreContext = createContext<DevtoolsStoreApi | null>(null);

const { useResolvedValue: useDevtoolsStore } = createResolvedStoreHooks<DevtoolsStore>(
  devtoolsStoreApi,
  () => useContext(DevtoolsStoreContext)
);

interface DevtoolsStoreProviderProps {
  children: ReactNode;
  store: DevtoolsStoreApi;
}

export function DevtoolsStoreProvider(props: DevtoolsStoreProviderProps): ReactElement {
  const { children, store } = props;

  return <DevtoolsStoreContext.Provider value={store}>{children}</DevtoolsStoreContext.Provider>;
}

export { useDevtoolsStore };
