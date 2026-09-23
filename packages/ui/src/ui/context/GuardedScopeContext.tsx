import { resolveScope } from "@okyrychenko-dev/react-action-guard";
import { createContext, useContext, useMemo } from "react";
import type { Optional } from "@okyrychenko-dev/type-utils";
import type { ReactNode } from "react";
import type { GuardedScope } from "../types";

export interface GuardedScopeContextValue {
  scope: GuardedScope;
}

export interface GuardedScopeProviderProps {
  scope: GuardedScope;
  children: ReactNode;
}

const GuardedScopeContext = createContext<GuardedScopeContextValue | null>(null);

export function GuardedScopeProvider({ children, scope }: GuardedScopeProviderProps): ReactNode {
  const value = useMemo(() => ({ scope }), [scope]);

  return <GuardedScopeContext.Provider value={value}>{children}</GuardedScopeContext.Provider>;
}

export const GuardedFormScopeProvider = GuardedScopeProvider;

export function useGuardedScope(): Optional<GuardedScope> {
  return useContext(GuardedScopeContext)?.scope;
}

export function useResolvedGuardedScope(explicitScope?: GuardedScope): Optional<GuardedScope> {
  const contextScope = useGuardedScope();

  return resolveScope(explicitScope, contextScope);
}
