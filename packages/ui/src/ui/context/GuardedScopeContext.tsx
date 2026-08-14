import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { GuardedScope } from "../types";

export interface GuardedScopeContextValue {
  scope: GuardedScope;
}

export interface GuardedScopeProviderProps {
  scope: GuardedScope;
  children: ReactNode;
}

const GuardedScopeContext = createContext<GuardedScopeContextValue | null>(
  null,
);

export function GuardedScopeProvider({
  children,
  scope,
}: GuardedScopeProviderProps): ReactNode {
  const value = useMemo(() => ({ scope }), [scope]);

  return (
    <GuardedScopeContext.Provider value={value}>
      {children}
    </GuardedScopeContext.Provider>
  );
}

export const GuardedFormScopeProvider = GuardedScopeProvider;

export function useGuardedScope(): GuardedScope | undefined {
  return useContext(GuardedScopeContext)?.scope;
}

export function useResolvedGuardedScope(
  explicitScope?: GuardedScope,
): GuardedScope | undefined {
  const contextScope = useGuardedScope();

  if (Array.isArray(explicitScope) && explicitScope.length === 0) {
    return contextScope;
  }

  return explicitScope ?? contextScope;
}
